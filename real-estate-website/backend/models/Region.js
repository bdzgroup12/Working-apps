const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class Region {
  static async getAll() {
    try {
      const result = await pool.query(
        'SELECT r.*, ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) AS tourist_places ' +
        'FROM regions r ' +
        'LEFT JOIN tourist_places t ON r.id = t.region_id ' +
        'GROUP BY r.id ' +
        'ORDER BY r.name ASC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting regions:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const regionResult = await pool.query(
        'SELECT * FROM regions WHERE id = $1',
        [id]
      );
      
      if (regionResult.rows.length === 0) {
        return null;
      }
      
      const region = regionResult.rows[0];
      
      // Get tourist places for this region
      const touristPlacesResult = await pool.query(
        'SELECT name FROM tourist_places WHERE region_id = $1 ORDER BY name',
        [id]
      );
      
      region.tourist_places = touristPlacesResult.rows.map(place => place.name);
      
      return region;
    } catch (error) {
      console.error(`Error getting region with id ${id}:`, error);
      throw error;
    }
  }

  static async create(regionData) {
    const { name, description, tourist_places = [] } = regionData;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const regionResult = await client.query(
        'INSERT INTO regions (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      
      const region = regionResult.rows[0];
      
      // Insert tourist places if provided
      if (tourist_places && tourist_places.length > 0) {
        for (const place of tourist_places) {
          if (place && place.trim() !== '') {
            await client.query(
              'INSERT INTO tourist_places (region_id, name) VALUES ($1, $2)',
              [region.id, place.trim()]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      
      // Get the updated region with tourist places
      return this.getById(region.id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating region:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(id, regionData) {
    const { name, description, tourist_places = [] } = regionData;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      
      // Update the region
      const regionResult = await client.query(
        'UPDATE regions SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [name, description, id]
      );
      
      if (regionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      // Delete existing tourist places for this region
      await client.query('DELETE FROM tourist_places WHERE region_id = $1', [id]);
      
      // Insert new tourist places
      if (tourist_places && tourist_places.length > 0) {
        for (const place of tourist_places) {
          if (place && place.trim() !== '') {
            await client.query(
              'INSERT INTO tourist_places (region_id, name) VALUES ($1, $2)',
              [id, place.trim()]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      
      // Get the updated region with tourist places
      return this.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error updating region with id ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete tourist places first (due to foreign key constraint)
      await client.query('DELETE FROM tourist_places WHERE region_id = $1', [id]);
      
      // Delete the region
      await client.query('DELETE FROM regions WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error deleting region with id ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Region; 