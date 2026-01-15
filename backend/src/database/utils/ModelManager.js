import { pool } from "../DBConnection.js";
import * as crud from "./DBMethods.js";

export const ModelManager = {
  createModel: (schemaQueries = [], tableName) => {

    //This kind of logic only for table creation without the array of table and index creation  logic
    // // Auto-create table

    return {
      tableName,
      getSchemaQueries: () => schemaQueries,
      // CREATE
      create: (data, client) =>
        crud.create(tableName, data, client),

      // READ
      find: (filters = {}, client) =>
        crud.find(tableName, filters, client),

      findAll: (client) =>
        crud.find(tableName, {}, client),

      findOne: (filters = {}, client) =>
        crud.findOne(tableName, filters, client),

      findById: (id, client) =>
        crud.findById(tableName, id, client),

      existsById: (id, client) =>
        crud.existsById(tableName, id, client),

      // UPDATE
      updateOne: (filters, data, client) =>
        crud.updateOne(tableName, filters, data, client),

      findByIdAndUpdate: (id, data, client) =>
        crud.findByIdAndUpdate(tableName, id, data, client),

      // DELETE
      deleteOne: (filters, client) =>
        crud.deleteOne(tableName, filters, client),

      findByIdAndDelete: (id, client) =>
        crud.findByIdAndDelete(tableName, id, client),
    };
  }
};
