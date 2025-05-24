const pool = require('../db');

const Agency = {
  countDocuments: async (filter = {}) => {
    let query = 'SELECT COUNT(*) FROM agencies';
    const values = [];
    if (Object.keys(filter).length > 0) {
      const conditions = [];
      let i = 1;
      for (const key in filter) {
        conditions.push(`${key} = $${i}`);
        values.push(filter[key]);
        i++;
      }
      query += ' WHERE ' + conditions.join(' AND ');
    }
    const res = await pool.query(query, values);
    return parseInt(res.rows[0].count, 10);
  }
};

module.exports = Agency;
