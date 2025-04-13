const itemRepository = require('../repositories/item.repository');
const storeRepository = require('../repositories/store.repository');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const baseResponse = require('../utils/baseResponse.util');

exports.createItem = async (req, res) => {
  try {
    const storeId = req.body.store_id;
    const storeExists = await storeRepository.getStoreById(storeId);
    if (!storeExists) {
      return baseResponse(res, false, 404, "Store doesnt exist", null);
    }
    // Up image jika disediakan
    let imageUrl = null;
    if (req.file) {
      // Buffer -> Cloudinary langsung
      const result = await new Promise((resolve, reject) => 
        {
        const uploadStream = cloudinary.uploader.upload_stream
        (
          { folder: 'items' },
          (error, result) => {
            if (error) 
              return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      
      imageUrl = result.secure_url;
    }
    // Buat new item object
    const newItem = {
      id: uuidv4(),
      name: req.body.name,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      store_id: storeId,
      image_url: imageUrl
    };
    // Save ke database
    const itemObj = await itemRepository.createItem(newItem);
    baseResponse(res, true, 201, "Item created", itemObj);
  } catch (error) {
    console.error("Error creating item:", error);
    baseResponse(res, false, 500, "Failed to create item", error.message);
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const items = await itemRepository.getAllItems();
    if (items && items.length > 0) {
      // Return semua item
      baseResponse(res, true, 200, "Items found", items);
    } else {
      baseResponse(res, true, 200, "No items found", []);
    }
  } catch (error) {
    console.error("Error fetching items:", error);
    baseResponse(res, false, 500, "Failed to fetch items", error.message);
  }
};

exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await itemRepository.getItemById(id);
    // Panggil repository untuk fetch item by ID
    if (item) {
      baseResponse(res, true, 200, "Item found", item);
    } else {
      baseResponse(res, false, 404, "Item not found", null);
    }
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    baseResponse(res, false, 500, "Failed to fetch item", error.message);
  }
};

exports.getItemsByStoreId = async (req, res) => {
  try {
    const { store_id } = req.params;
    // Cek jika store ada
    const storeExists = await storeRepository.getStoreById(store_id);
    if (!storeExists) {
      return baseResponse(res, false, 404, "Store doesnt exist", null);
    }
    const items = await itemRepository.getItemsByStoreId(store_id);
    if (items && items.length > 0) {
      baseResponse(res, true, 200, "Items found", items);
    } else {
      baseResponse(res, true, 200, "No items found for this store", []);
    }
  } catch (error) {
    console.error("Error fetching items by store ID:", error);
    baseResponse(res, false, 500, "Failed to fetch items", error.message);
  }
};

exports.updateItem = async (req, res) => {
  try {
    const itemId = req.body.id;
    // Cek jika item ada
    const itemExists = await itemRepository.getItemById(itemId);
    if (!itemExists) {
      return baseResponse(res, false, 404, "Item not found", null);
    }
    // Cek juga jika store ada
    if (req.body.store_id) {
      const storeExists = await storeRepository.getStoreById(req.body.store_id);
      if (!storeExists) {
        return baseResponse(res, false, 404, "Store doesnt exist", null);
      }
    }
    // Upload new image
    let imageUrl = itemExists.image_url; // Default : image lama
    if (req.file) {
      const result = await new Promise((resolve, reject) => 
      {
        const uploadStream = cloudinary.uploader.upload_stream
        (
          { folder: 'items' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }
    // Update item object
    const updatedItem = {
      name: req.body.name || itemExists.name,
      price: req.body.price ? parseFloat(req.body.price) : itemExists.price,
      stock: req.body.stock ? parseInt(req.body.stock) : itemExists.stock,
      store_id: req.body.store_id || itemExists.store_id,
      image_url: imageUrl
    };
    const result = await itemRepository.updateItem(itemId, updatedItem);
    baseResponse(res, true, 200, "Item updated", result);
  } catch (error) {
    console.error("Error update:", error);
    baseResponse(res, false, 500, "Failed to update!", error.message);
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    // Cek jika item ada
    const itemExists = await itemRepository.getItemById(id);
    if (!itemExists) {
      return baseResponse(res, false, 404, "Item not found", null);
    }
    // Hapus gambar dari Cloudinary
    if (itemExists.image_url) {
      try {
        // Format standar: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
        const urlParts = itemExists.image_url.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const folder = urlParts[urlParts.length - 2];
        // Remove file extension
        const publicId = publicIdWithExtension.split('.')[0];
        // Hapus image dari Cloudinary
        await cloudinary.uploader.destroy(`${folder}/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Image delete error:", cloudinaryError);
      }
    }
    
    const deletedItem = await itemRepository.deleteItem(id);
    baseResponse(res, true, 200, "Item deleted", deletedItem);
  } catch (error) {
    console.error("Error deleting item:", error);
    baseResponse(res, false, 500, "Failed to delete item", error.message);
  }
};