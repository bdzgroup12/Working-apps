const pool = require('../db');

const User = {
  findById: async (id) => {
    const query = 'SELECT id, first_name, last_name, email, role FROM users WHERE id = $1';
    const values = [id];
    const res = await pool.query(query, values);
    return res.rows[0];
  }
};

module.exports = User;
