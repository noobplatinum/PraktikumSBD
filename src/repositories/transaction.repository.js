const db = require('../database/pg.database');

exports.createTransaction = async (transactionData) => {
    try {
        const { user_id, item_id, quantity, total } = transactionData;
        const result = await db.query(
            'INSERT INTO transactions (user_id, item_id, quantity, total, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, item_id, quantity, total, 'pending']
        );
        
        return result.rows[0];
    } catch (error) {
        console.error('Failed to create transaction', error);
        throw error;
    }
};

exports.getTransactionById = async (id) => {
    try {
        const result = await db.query(
            'SELECT * FROM transactions WHERE id = $1',
            [id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Failed to get transaction', error);
        throw error;
    }
};

exports.updateTransactionStatus = async (id, status) => {
    try {
        const result = await db.query(
            'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Failed to update transaction status', error);
        throw error;
    }
};

exports.payTransaction = async (transactionId) => {
    try {
        await db.query('BEGIN');
        const transactionResult = await db.query(
            `SELECT t.*,
                    i.price, i.stock,
                    u.balance
            FROM transactions t
            JOIN items i ON t.item_id = i.id
            JOIN users u ON t.user_id = u.id
            WHERE t.id = $1`,
            [transactionId]
        );
        
        if (transactionResult.rows.length === 0) {
            await db.query('ROLLBACK');
            throw new Error('Transaction not found');
        }
        
        const transaction = transactionResult.rows[0];
        console.log('Transaction data:', transaction);
        
        if (transaction.status === 'paid') {
            await db.query('ROLLBACK');
            throw new Error('Transaction is already paid');
        }
        
        if (parseInt(transaction.balance, 10) < parseInt(transaction.total, 10)) {
            await db.query('ROLLBACK');
            throw new Error('Insufficient balance');
        }
        
        if (parseInt(transaction.stock, 10) < parseInt(transaction.quantity, 10)) {
            await db.query('ROLLBACK');
            throw new Error('Insufficient stock');
        }
        
        await db.query(
            'UPDATE transactions SET status = $1 WHERE id = $2',
            ['paid', transactionId]
        );
        
        await db.query(
            'UPDATE users SET balance = balance - $1 WHERE id = $2',
            [transaction.total, transaction.user_id]
        );
        await db.query(
            'UPDATE items SET stock = stock - $1 WHERE id = $2',
            [transaction.quantity, transaction.item_id]
        );
        const updatedTransactionResult = await db.query(
            'SELECT * FROM transactions WHERE id = $1',
            [transactionId]
        );
        
        await db.query('COMMIT');
        return updatedTransactionResult.rows[0];
        
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Payment failed:', error);
        throw error;
    }
};

exports.deleteTransaction = async (id) => {
    try {
        const result = await db.query(
            'DELETE FROM transactions WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Failed to delete transaction', error);
        throw error;
    }
};

exports.getAllTransactions = async () => {
    try {
        const result = await db.query(`SELECT
                t.*,
                json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'email', u.email,
                    'password', u.password,
                    'balance', u.balance,
                    'created_at', u.created_at
                ) as user,
                json_build_object(
                    'id', i.id,
                    'name', i.name,
                    'price', i.price,
                    'store_id', i.store_id,
                    'image_url', i.image_url,
                    'stock', i.stock,
                    'created_at', i.created_at
                ) as item
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            JOIN items i ON t.item_id = i.id
            ORDER BY t.created_at DESC`);
       
        return result.rows;
    } catch (error) {
        console.error('Failed to get transactions', error);
        throw error;
    }
};
