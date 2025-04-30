const db = require('../database/pg.database');
exports.registerUser = async (user) => {
    try {
        const res = await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [user.name, user.email, user.password]);
        console.log(res);
        return res.rows[0];
    } catch (error) {
        console.error('Gagal Eksekusi Query!', error);
    }
};

exports.loginUser = async (email, password) => {
    try {
        const res = await db.query('SELECT * FROM users WHERE email = $1', 
            [email]);
        return res.rows[0]; 
    } catch (error) {
        console.error('Gagal Eksekusi Query!', error);
        throw error;
    }
};

exports.getUserById = async (id) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0]; 
    } catch (error) {
        console.error('Gagal Eksekusi Query!', error);
        throw error;
    }
};

exports.getUserByEmail = async (email) => {
    try {
        const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0]; 
    } catch (error) {
        console.error('Gagal Eksekusi Query!', error);
        throw error;
    }
};

exports.updateUser = async (id, userData) => {
    try {
        const result = await db.query(
            'UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *',
            [userData.name, userData.email, userData.password, id]
        );
        
        return result.rows[0];
    } catch (error) {
        console.error('Gagal Eksekusi Query!', error);
        throw error;
    }
};

exports.deleteUser = async (id) => {
    try {
        const result = await db.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0]; 
    } catch (error) {
        console.error('Gagal Eksekusi Query!', error);
        throw error;
    }
};

exports.topUpUserBalance = async (id, amount) => {
    try {
        await db.query('BEGIN'); 
        const currentUser = await db.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        if (currentUser.rows.length === 0) {
            await db.query('ROLLBACK');
            throw new Error('User not found');
        }
        const currentBalance = currentUser.rows[0].balance || 0;
        const newBalance = currentBalance + parseInt(amount, 10);
        const result = await db.query(
            'UPDATE users SET balance = $1 WHERE id = $2 RETURNING *',
            [newBalance, id]
        );
        await db.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Gagal Top Up!', error);
        throw error;
    }
};