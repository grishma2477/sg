import { pool } from "../DBConnection.js";

// Create function
export const create = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

  const query = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders})
    RETURNING *;
  `;
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Find multiple records based on filters
export const find = async (table, filters = {}) => {
  const keys = Object.keys(filters);
  const values = Object.values(filters);

  const where = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
  const query = `SELECT * FROM ${table}${keys.length ? ' WHERE ' + where : ''}`;

  const { rows } = await pool.query(query, values);
  return rows;
};

// Retrieve all records (no filters)
export const findAll = async (table) => {
  const query = `SELECT * FROM ${table}`;
  const { rows } = await pool.query(query);
  return rows;
};

// Find one record based on filters
export const findOne = async (table, filters = {}) => {
  const rows = await find(table, filters);
  return rows[0] || null;
};

// Find record by ID
export const findById = async (table, id) => {
  const query = `SELECT * FROM ${table} WHERE id = $1`;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

// Update records based on filters
export const updateOne = async (table, filters, data) => {
  const filterKeys = Object.keys(filters);
  const dataKeys = Object.keys(data);
  const values = [...Object.values(data), ...Object.values(filters)];

  const setClause = dataKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  const whereClause = filterKeys
    .map((key, i) => `${key} = $${dataKeys.length + i + 1}`)
    .join(' AND ');

  const query = `
    UPDATE ${table}
    SET ${setClause}
    WHERE ${whereClause}
    RETURNING *;
  `;
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Update a record by ID
export const findByIdAndUpdate = async (table, id, data) => {
  const dataKeys = Object.keys(data);
  const values = [...Object.values(data), id];

  const setClause = dataKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');

  const query = `
    UPDATE ${table}
    SET ${setClause}
    WHERE id = $${dataKeys.length + 1}
    RETURNING *;
  `;
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Remove records based on filters
export const deleteOne = async (table, filters) => {
  const keys = Object.keys(filters);
  const values = Object.values(filters);

  const where = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
  const query = `DELETE FROM ${table} WHERE ${where} RETURNING *`;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Delete a record by ID
export const findByIdAndDelete = async (table, id) => {
  const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

// Check if record exists by ID
export const existsById = async (table, id) => {
  const query = `SELECT 1 FROM ${table} WHERE id = $1 LIMIT 1`;
  const { rows } = await pool.query(query, [id]);
  return rows.length > 0;
};
