const pool = require('../config/db');

const categoryModel = {
  getAll: async () => {
    const res = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return res.rows;
  }
};

module.exports = categoryModel;