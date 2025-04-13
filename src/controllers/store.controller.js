const storeRepository = require('../repositories/store.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.getAllStores = async (req, res) => {
    try {
        const stores = await storeRepository.getAllStores();
        baseResponse(res, true, 200, 'Stores retrieved successfully', stores);
    } catch (error) {
        baseResponse(res, false, 500, 'Failed to retrieve stores', error);
    }
};

exports.createStore = async (req, res) => {
    if(!req.body.name || !req.body.address) {
        return baseResponse(res, false, 400, 'Name and address are required');
    }
    try {
        const store = await storeRepository.createStore(req.body);
        baseResponse(res, true, 201, 'Store created successfully', store);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server Error", error);
    }
}

exports.getStoreById = async (req, res) => {
    try {
        const storeId = req.params.id;
        if(!storeId) {
            return baseResponse(res, false, 400, 'Store ID is required');
        }
        const store = await storeRepository.getStoreById(storeId);
        if(!store) {
            return baseResponse(res, false, 404, 'Store not found', null);
        }
        baseResponse(res, true, 200, 'Store retrieved successfully', store);
    }
    catch (error) {
        baseResponse(res, false, 500, 'Failed to retrieve store', error);
    }
}

exports.updateStore = async (req, res) => {
    try {
        const storeId = req.body.id; 
        if (!storeId) {
            return baseResponse(res, false, 400, 'Store ID is required');
        }
        if (!req.body.name || !req.body.address) {
            return baseResponse(res, false, 400, 'Name and address are required');
        }
        const existingStore = await storeRepository.getStoreById(storeId);
        if (!existingStore) {
            return baseResponse(res, false, 404, 'Store not found', null);
        }
        const updatedStore = await storeRepository.updateStore(storeId, {
            name: req.body.name,
            address: req.body.address
        });
        baseResponse(res, true, 200, 'Store updated', updatedStore);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server Error", error);
    }
};

exports.deleteStore = async (req, res) => {
    try {
        const storeId = req.params.id; 
        if (!storeId) {
            return baseResponse(res, false, 400, 'Store ID is required');
        }
        const existingStore = await storeRepository.getStoreById(storeId);
        if (!existingStore) {
            return baseResponse(res, false, 404, 'Store not found', null);
        }
        const deletedStore = await storeRepository.deleteStore(storeId);
        baseResponse(res, true, 200, 'Store deleted', deletedStore);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server Error", error);
    }
};