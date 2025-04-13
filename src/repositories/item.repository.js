const db = require('../database/pg.database');
const { v4: uuidv4 } = require('uuid');

exports.createItem = async (item) => {
  try {
    const id = item.id || uuidv4();
    const result = await db.query(
      'INSERT INTO items(id, name, price, stock, store_id, image_url) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, item.name, item.price, item.stock, item.store_id, item.image_url]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Create error:', error);
    throw error;
  }
};

exports.getAllItems = async () => {
  try {
    const result = await db.query('SELECT * FROM items');
    return result.rows;
  } catch (error) {
    console.error('Fetch error (All Items):', error);
    throw error;
  }
};

exports.getItemsByStoreId = async (storeId) => {
  try {
    const result = await db.query(
      'SELECT * FROM items WHERE store_id = $1',
      [storeId]
    );
    return result.rows;
  } catch (error) {
    console.error('Fetch error (Store ID):', error);
    throw error;
  }
};

exports.getItemById = async (id) => {
  try {
    const result = await db.query(
      'SELECT * FROM items WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Fetch error (Item ID):', error);
    throw error;
  }
};

exports.updateItem = async (id, item) => {
  try {
    const result = await db.query(
      `UPDATE items 
      SET name = $1, price = $2, stock = $3, store_id = $4, image_url = $5
      WHERE id = $6 RETURNING *`,
      [item.name, item.price, item.stock, item.store_id, item.image_url, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};

exports.deleteItem = async (id) => {
  try {
    const result = await db.query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};