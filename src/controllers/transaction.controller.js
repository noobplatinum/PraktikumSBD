const transactionRepository = require('../repositories/transaction.repository');
const itemRepository = require('../repositories/item.repository');
const userRepository = require('../repositories/user.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.createTransaction = async (req, res) => {
    const { item_id, quantity, user_id } = req.body;
    if (!item_id || quantity === undefined || !user_id) {
        return baseResponse(res, false, 400, 'Item ID, quantity, and user ID are required', null);
    }
    
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return baseResponse(res, false, 400, 'Quantity harus valid number > 0', null);
    }
    
    try {
        const item = await itemRepository.getItemById(item_id);
        if (!item) {
            return baseResponse(res, false, 404, 'Item not found', null);
        }
        const itemStock = parseInt(item.stock, 10);
        
        if (itemStock < parsedQuantity) {
            return baseResponse(res, false, 400, `Insufficient stock. Available: ${itemStock}, Requested: ${parsedQuantity}`, null);
        }
        
        const user = await userRepository.getUserById(user_id);
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        
        const itemPrice = parseInt(item.price, 10);
        const total = itemPrice * parsedQuantity;
        
        const transaction = await transactionRepository.createTransaction({
            user_id,
            item_id,
            quantity: parsedQuantity,
            total
        });
        
        return baseResponse(res, true, 201, 'Transaction created', transaction);
    } catch (error) {
        console.error('Transaction creation error:', error);
        return baseResponse(res, false, 500, `Server error: ${error.message}`, null);
    }
};

exports.payTransaction = async (req, res) => {
    const transactionId = req.params.id;
    
    if (!transactionId) {
        return baseResponse(res, false, 400, 'Transaction ID is required', null);
    }
    
    try {
        const updatedTransaction = await transactionRepository.payTransaction(transactionId);
        return baseResponse(res, true, 200, 'Payment successful', updatedTransaction);
        
    } catch (error) {
        console.error('Payment processing error:', error);
        
        if (error.message === 'Transaction not found') {
            return baseResponse(res, false, 404, 'Transaction not found', null);
        } else if (error.message === 'Transaction is already paid') {
            return baseResponse(res, false, 400, 'Transaction is already paid', null);
        } else if (error.message === 'Insufficient balance') {
            return baseResponse(res, false, 400, 'User has insufficient balance', null);
        } else if (error.message === 'Insufficient stock') {
            return baseResponse(res, false, 400, 'Item has insufficient stock', null);
        }
        
        return baseResponse(res, false, 500, 'Failed to process payment', null);
    }
};

exports.deleteTransaction = async (req, res) => {
    const id = req.params.id;
    
    if (!id) {
        return baseResponse(res, false, 400, 'Transaction ID is required', null);
    }
    
    try {
        const transaction = await transactionRepository.getTransactionById(id);
        if (!transaction) {
            return baseResponse(res, false, 404, 'Transaction not found', null);
        }
        
        const deletedTransaction = await transactionRepository.deleteTransaction(id);
        return baseResponse(res, true, 200, 'Transaction deleted', deletedTransaction);
    } catch (error) {
        console.error('Delete transaction error:', error);
        return baseResponse(res, false, 500, 'Failed to delete transaction', null);
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await transactionRepository.getAllTransactions();
        return baseResponse(res, true, 200, 'Transactions found', transactions);
    } catch (error) {
        console.error('Transactions not found:', error);
        return baseResponse(res, false, 500, 'Failed to retrieve transactions', null);
    }
};
