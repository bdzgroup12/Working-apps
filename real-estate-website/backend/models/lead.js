const pool = require('../db');

const Lead = {
  countDocuments: async (filter = {}) => {
    let query = 'SELECT COUNT(*) FROM leads';
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
  },
  find: async (filter = {}, options = {}) => {
    let query = 'SELECT * FROM leads';
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
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey] === -1 ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortKey} ${sortOrder}`;
    }
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }
    const res = await pool.query(query, values);
    return res.rows;
  }
};

module.exports = Lead;
