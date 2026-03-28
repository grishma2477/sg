import { pool } from "../DBConnection.js";

/**
 * Helper to choose pool or transaction client
 */
const getClient = (client) => client || pool;

// CREATE
export const create = async (table, data, client) => {
  const db = getClient(client);

  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
    INSERT INTO ${table} (${keys.join(", ")})
    VALUES (${placeholders})
    RETURNING *;
  `;

  const { rows } = await db.query(query, values);
  return rows[0];
};

// FIND MANY
export const find = async (table, filters = {}, client) => {
  const db = getClient(client);

  const keys = Object.keys(filters);
  const values = Object.values(filters);

  const where = keys.length
    ? "WHERE " + keys.map((k, i) => `${k} = $${i + 1}`).join(" AND ")
    : "";

  const query = `SELECT * FROM ${table} ${where}`;
  const { rows } = await db.query(query, values);
  return rows;
};

// FIND ONE
export const findOne = async (table, filters = {}, client) => {
  const rows = await find(table, filters, client);
  return rows[0] || null;
};

// FIND BY ID
export const findById = async (table, id, client) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `SELECT * FROM ${table} WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// UPDATE WITH FILTERS
export const updateOne = async (table, filters, data, client) => {
  const db = getClient(client);

  const dataKeys = Object.keys(data);
  const filterKeys = Object.keys(filters);

  const values = [...Object.values(data), ...Object.values(filters)];

  const setClause = dataKeys
    .map((k, i) => `${k} = $${i + 1}`)
    .join(", ");

  const whereClause = filterKeys
    .map((k, i) => `${k} = $${dataKeys.length + i + 1}`)
    .join(" AND ");

  const query = `
    UPDATE ${table}
    SET ${setClause}
    WHERE ${whereClause}
    RETURNING *;
  `;

  const { rows } = await db.query(query, values);
  return rows[0];
};

// UPDATE BY ID
export const findByIdAndUpdate = async (table, id, data, client) => {
  return updateOne(table, { id }, data, client);
};

// DELETE WITH FILTERS
export const deleteOne = async (table, filters, client) => {
  const db = getClient(client);

  const keys = Object.keys(filters);
  const values = Object.values(filters);

  const where = keys.map((k, i) => `${k} = $${i + 1}`).join(" AND ");
  const query = `DELETE FROM ${table} WHERE ${where} RETURNING *`;

  const { rows } = await db.query(query, values);
  return rows[0];
};

// DELETE BY ID
export const findByIdAndDelete = async (table, id, client) => {
  return deleteOne(table, { id }, client);
};

// EXISTS
export const existsById = async (table, id, client) => {
  const db = getClient(client);
  const { rows } = await db.query(
    `SELECT 1 FROM ${table} WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows.length > 0;
};

export const executeQuery = async (tableName, populate, method, filters = {}, client) => {
  let query = '';
  let queryParams = [];

  if (method === 'find' || method === 'findAll') {
    query = `SELECT * FROM ${tableName} AS ${tableName}`;
  } else if (method === 'findOne') {
    query = `SELECT * FROM ${tableName} AS ${tableName}`;
  } else if (method === 'findById') {
    query = `SELECT * FROM ${tableName} AS ${tableName} WHERE id = $1`;
    queryParams = [filters.id];
  }

  const joinClause = buildPopulateJoin(tableName, populate);
  if (joinClause) {
    query += ` ${joinClause}`;
  }

  if (Object.keys(filters).length > 0) {
    const filterClause = Object.keys(filters)
      .map((key, index) => `${key} = $${index + queryParams.length + 1}`)
      .join(' AND ');  

    if (query.includes('WHERE')) {
      query += ` AND ${filterClause}`;
    } else {
      query += ` WHERE ${filterClause}`;
    }

    queryParams = [...queryParams, ...Object.values(filters)];
    console.log("Query Params:", queryParams);
    console.log("Query :", query);

  }

  const db = getClient(client);
  const { rows } = await db.query(query, queryParams);
  return formatPopulatedResults(rows,populate);
};

function buildPopulateJoin(tableName, populate) {
  if (!populate || populate.length === 0) return '';

  const joinClauses = populate.map(pop => {
    const alias = pop.model.toLowerCase(); 
    const foreignKey = generateForeignKey(alias);  
    const primaryKey = 'id'; 

    return `
      LEFT JOIN ${pop.model} AS ${alias}
      ON ${tableName}.${foreignKey} = ${pop.model}.${primaryKey}
    `;
  });

  return joinClauses.join(' ');
}

function formatPopulatedResults(rows, populate) {
  if (populate.length === 0) {
    return rows;
  }
  return rows.map((row) => {
    populate.forEach(pop => {
      const modelName = convertToModelName(pop.model.toLowerCase());
      if (!row[modelName]) {
        row[modelName] = {}; 
      }
      pop.attributes.forEach(attribute => {
        if (row[attribute]) {
          row[modelName][attribute] = row[attribute];
          delete row[attribute];  
        }
      });

    });

    return row;
  });
}

function generateForeignKey(modelName) {
  // Add "_id" to the singular model name and return
  return `${convertToModelName(modelName)}_id`;
}

function convertToModelName(modelName) {
  const parts = modelName.split('_');
  let baseModelName = parts[0];
  if (baseModelName.endsWith('s')) {
    baseModelName = baseModelName.slice(0, -1);
  } 
  return baseModelName;
}
