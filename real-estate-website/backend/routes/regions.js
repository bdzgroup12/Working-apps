const express = require('express');
const router = express.Router();
const Region = require('../models/Region');
const { verifyToken, getUserRoleAndId } = require('../middleware/auth');

// Create regions table if it doesn't exist (for development)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize regions table if needed
async function initRegionsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create tourist_places table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tourist_places (
        id SERIAL PRIMARY KEY,
        region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        UNIQUE(region_id, name)
      )
    `);
    
    // Check if there are any regions, if not add some sample data
    const result = await pool.query('SELECT COUNT(*) FROM regions');
    if (parseInt(result.rows[0].count) === 0) {
      // Insert regions
      await pool.query(`
        INSERT INTO regions (name, description) VALUES
        ('Andalusia', 'Located in the south of Spain, Andalusia is a large autonomous community with diverse landscapes, from the Sierra Nevada mountains to beautiful coastlines. It is known for flamenco, bullfighting, and Moorish architecture.'),
        ('Catalonia', 'Located in the northeastern corner of Spain, Catalonia has its own distinct identity and language. Barcelona, its capital, is a major tourist destination known for its art and architecture.'),
        ('Madrid', 'The central region containing Spain''s capital and largest city. Madrid is known for its rich repositories of European art, including the Prado Museum''s works by Goya, Velázquez and other Spanish masters.'),
        ('Valencia', 'Located on Spain''s eastern coast, Valencia is known for its City of Arts and Sciences, with futuristic structures including a planetarium, an oceanarium and an interactive museum.'),
        ('Galicia', 'Located in Spain''s northwest, Galicia is known for its seafood, green landscapes, and the famous pilgrimage site of Santiago de Compostela.'),
        ('Balearic Islands', 'An archipelago in the Mediterranean Sea, the Balearic Islands include Mallorca, Menorca, Ibiza, and Formentera. Known for beautiful beaches and vibrant nightlife.'),
        ('Canary Islands', 'An archipelago in the Atlantic Ocean, the Canary Islands are known for their black and white sand beaches, and volcanoes including Mount Teide on Tenerife.'),
        ('Asturias', 'A green region in northern Spain known for its rugged coast, mountains, religious sites, and medieval architecture.'),
        ('Basque Country', 'A region in northern Spain with strong cultural traditions, famous cuisine, and the cities of Bilbao and San Sebastián.'),
        ('Castile and León', 'Spain''s largest region, known for its numerous UNESCO World Heritage Sites, historic cities, and diverse landscapes.'),
        ('Castile-La Mancha', 'The setting for the novel Don Quixote, known for its windmills, vast plains, and historic cities like Toledo.'),
        ('Extremadura', 'A western Spanish region bordering Portugal, known for its preserved medieval towns and Roman ruins.'),
        ('Aragon', 'A diverse region spanning central Spain, containing part of the Pyrenees mountains and the city of Zaragoza.'),
        ('Navarre', 'Northern Spanish region famous for the Running of the Bulls festival in its capital, Pamplona.'),
        ('Murcia', 'A southeastern region known for its agricultural produce, particularly fruits, vegetables, and flowers.'),
        ('La Rioja', 'Spain''s renowned wine region with medieval villages, mountainous landscapes, and monasteries.'),
        ('Cantabria', 'A northern region with prehistoric caves, lush forests, and beautiful beaches along the Bay of Biscay.')
      `);
      
      // Get regions to associate tourist places
      const regionsResult = await pool.query('SELECT id, name FROM regions');
      const regions = regionsResult.rows;
      
      // Insert tourist places for each region
      for (const region of regions) {
        let touristPlaces = [];
        
        switch (region.name) {
          case 'Andalusia':
            touristPlaces = [
              'Alhambra (Granada)', 
              'Seville Cathedral', 
              'Alcázar of Seville', 
              'Mezquita-Cathedral (Córdoba)', 
              'Ronda', 
              'Costa del Sol',
              'Doñana National Park'
            ];
            break;
          case 'Catalonia':
            touristPlaces = [
              'Sagrada Familia (Barcelona)', 
              'Park Güell (Barcelona)', 
              'La Rambla (Barcelona)', 
              'Montserrat Monastery', 
              'Costa Brava',
              'Gothic Quarter (Barcelona)',
              'Camp Nou Stadium'
            ];
            break;
          case 'Madrid':
            touristPlaces = [
              'Prado Museum', 
              'Royal Palace of Madrid', 
              'Plaza Mayor', 
              'Retiro Park', 
              'Puerta del Sol',
              'El Escorial',
              'Santiago Bernabéu Stadium'
            ];
            break;
          case 'Valencia':
            touristPlaces = [
              'City of Arts and Sciences', 
              'Valencia Cathedral', 
              'La Lonja de la Seda', 
              'Bioparc Valencia', 
              'Albufera Natural Park',
              'Central Market of Valencia'
            ];
            break;
          case 'Galicia':
            touristPlaces = [
              'Cathedral of Santiago de Compostela', 
              'Praia das Catedrais (Cathedral Beach)', 
              'Tower of Hercules (A Coruña)', 
              'Cíes Islands', 
              'Ribeira Sacra',
              'Cape Finisterre'
            ];
            break;
          case 'Balearic Islands':
            touristPlaces = [
              'Palma Cathedral (Mallorca)', 
              'Ibiza Old Town', 
              'Cala d\'Or (Mallorca)', 
              'Formentera Beaches', 
              'Drach Caves (Mallorca)',
              'Port de Sóller (Mallorca)'
            ];
            break;
          case 'Canary Islands':
            touristPlaces = [
              'Mount Teide (Tenerife)', 
              'Timanfaya National Park (Lanzarote)', 
              'Maspalomas Dunes (Gran Canaria)', 
              'Loro Park (Tenerife)', 
              'Garajonay National Park (La Gomera)',
              'Playa de las Canteras (Gran Canaria)'
            ];
            break;
          case 'Asturias':
            touristPlaces = [
              'Picos de Europa National Park', 
              'Lakes of Covadonga', 
              'Gijon Beach', 
              'Cathedral of Oviedo', 
              'Cudillero Fishing Village',
              'Dinosaur Coast'
            ];
            break;
          case 'Basque Country':
            touristPlaces = [
              'Guggenheim Museum (Bilbao)', 
              'La Concha Beach (San Sebastián)', 
              'Monte Igueldo', 
              'Parte Vieja (San Sebastián)', 
              'Vizcaya Bridge',
              'Gaztelugatxe'
            ];
            break;
          case 'Castile and León':
            touristPlaces = [
              'Salamanca University', 
              'Burgos Cathedral', 
              'Segovia Aqueduct', 
              'Alcázar of Segovia', 
              'Las Médulas Ancient Roman Gold Mines',
              'Ávila City Walls'
            ];
            break;
          case 'Castile-La Mancha':
            touristPlaces = [
              'Windmills of Consuegra', 
              'Toledo Old Town', 
              'Hanging Houses of Cuenca', 
              'Alcazar of Toledo', 
              'Monastery of Uclés',
              'Almagro'
            ];
            break;
          case 'Extremadura':
            touristPlaces = [
              'Roman Theatre of Mérida', 
              'Old Town of Cáceres', 
              'Royal Monastery of Santa María de Guadalupe', 
              'Alcántara Bridge', 
              'Monfragüe National Park',
              'Plaza Mayor of Trujillo'
            ];
            break;
          case 'Aragon':
            touristPlaces = [
              'Basilica of Our Lady of the Pillar (Zaragoza)', 
              'Aljafería Palace', 
              'Ordesa y Monte Perdido National Park', 
              'Albarracín Medieval Town', 
              'Castle of Loarre',
              'San Juan de la Peña Monastery'
            ];
            break;
          case 'Navarre':
            touristPlaces = [
              'Pamplona (Running of the Bulls)', 
              'Bardenas Reales Natural Park', 
              'Olite Royal Palace', 
              'Roncesvalles', 
              'Zugarramurdi Caves',
              'Señorío de Bertiz Natural Park'
            ];
            break;
          case 'Murcia':
            touristPlaces = [
              'Cathedral of Murcia', 
              'La Manga del Mar Menor', 
              'Roman Theatre of Cartagena', 
              'Sierra Espuña Regional Park', 
              'Caravaca de la Cruz',
              'Ricote Valley'
            ];
            break;
          case 'La Rioja':
            touristPlaces = [
              'Vineyards of Haro', 
              'Monasteries of San Millán de la Cogolla', 
              'Calle del Laurel (Logroño)', 
              'Cathedral of Santo Domingo de la Calzada', 
              'Dinosaur Footprints of Enciso',
              'Nature Reserve of the Sotos of Alfaro'
            ];
            break;
          case 'Cantabria':
            touristPlaces = [
              'Cave of Altamira', 
              'Santander Bay and Beaches', 
              'El Capricho de Gaudí (Comillas)', 
              'Picos de Europa (Cantabrian part)', 
              'Cabárceno Nature Park',
              'Santillana del Mar Medieval Town'
            ];
            break;
        }
        
        // Insert tourist places for this region
        for (const place of touristPlaces) {
          await pool.query(
            'INSERT INTO tourist_places (region_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [region.id, place]
          );
        }
      }
    }
  } catch (error) {
    console.error('Error initializing regions table:', error);
  }
}

initRegionsTable();

// Get all regions
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('GET /api/regions endpoint hit');
    const regions = await Region.getAll();
    console.log('Regions retrieved:', regions ? regions.length : 0);
    res.json({ regions });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

// Get a specific region by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const region = await Region.getById(req.params.id);
    
    if (!region) {
      return res.status(404).json({ error: 'Region not found' });
    }
    
    res.json({ region });
  } catch (error) {
    console.error('Error fetching region:', error);
    res.status(500).json({ error: 'Failed to fetch region' });
  }
});

// Create a new region (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { userId, role } = getUserRoleAndId(req);
    
    // Check if user is admin
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied. Admin only.' });
    }
    
    const { name, description } = req.body;
    
    // Validate inputs
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Region name is required' });
    }
    
    const region = await Region.create({ name, description });
    
    res.status(201).json({ region });
  } catch (error) {
    console.error('Error creating region:', error);
    
    // Handle duplicate name error
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A region with this name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create region' });
  }
});

// Update a region (admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { userId, role } = getUserRoleAndId(req);
    
    // Check if user is admin
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied. Admin only.' });
    }
    
    const { name, description } = req.body;
    
    // Validate inputs
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Region name is required' });
    }
    
    // Check if region exists
    const existingRegion = await Region.getById(req.params.id);
    
    if (!existingRegion) {
      return res.status(404).json({ error: 'Region not found' });
    }
    
    const updatedRegion = await Region.update(req.params.id, { name, description });
    
    res.json({ region: updatedRegion });
  } catch (error) {
    console.error('Error updating region:', error);
    
    // Handle duplicate name error
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A region with this name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to update region' });
  }
});

// Delete a region (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { userId, role } = getUserRoleAndId(req);
    
    // Check if user is admin
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied. Admin only.' });
    }
    
    // Check if region exists
    const existingRegion = await Region.getById(req.params.id);
    
    if (!existingRegion) {
      return res.status(404).json({ error: 'Region not found' });
    }
    
    await Region.delete(req.params.id);
    
    res.json({ message: 'Region deleted successfully' });
  } catch (error) {
    console.error('Error deleting region:', error);
    res.status(500).json({ error: 'Failed to delete region' });
  }
});

module.exports = router; 