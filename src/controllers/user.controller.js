const userRepository = require('../repositories/user.repository');
const baseResponse = require('../utils/baseResponse.util');
const bcrypt = require('bcryptjs');
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*.,?:;'"\-_+=()[\]{}|\\/<>~`])[A-Za-z0-9!@#$%^&*.,?:;'"\-_+=()[\]{}|\\/<>~`]{8,}$/
const SALT_ROUNDS = 10; // Salt rounds berguna untuk menentukan seberapa banyak proses enkripsi password yang akan dilakukan bcrypt

exports.registerUser = async (req, res) => {
    if (!req.query.email || !req.query.password || !req.query.name) {
        return baseResponse(res, false, 400, 'Email, password, and name are required', null);
    } 

    if(!EMAIL_REGEX.test(req.query.email)) {
        return baseResponse(res, false, 400, 'Invalid email format', null);
    }

    if(!PASSWORD_REGEX.test(req.query.password)) {
        return baseResponse(res, false, 400, 'Password min 8 char, ada 1 angka, dan 1 karakter khusus', null);
    }

    try {
        const existingUser = await userRepository.getUserByEmail(req.query.email);
        if (existingUser) {
            return baseResponse(res, false, 409, 'Email already in use', null);
        }

        const hashedPass = await bcrypt.hash(req.query.password, SALT_ROUNDS);
        
        const userData = {
            name: req.query.name,
            email: req.query.email,
            password: hashedPass
        }
        const newUser = await userRepository.registerUser(userData);
        baseResponse(res, true, 201, 'User created successfully', newUser);
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error.code === '23505' && error.constraint === 'users_email_key') {
            return baseResponse(res, false, 409, 'Email already in use', null);
        }
        baseResponse(res, false, 500, 'Server error occurred during registration', null);
    }
}

exports.loginUser = async (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    console.log("Login attempt:", { email, password, body: req.body, query: req.query });
    if (!email || !password) {
        return baseResponse(res, false, 400, 'Email and password are required');
    }
    try {
        const user = await userRepository.loginUser(email);
        if (!user) {
            return baseResponse(res, false, 401, 'Invalid email or password', null);
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return baseResponse(res, false, 401, 'Invalid email / password', null);
        }

        baseResponse(res, true, 200, 'Login success', user);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server Error", error);
    }
};

exports.getUserByEmail = async (req, res) => {
    const email = req.params.email;
    if (!email) {
        return baseResponse(res, false, 400, 'Email is required');
    }
    try {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        baseResponse(res, true, 200, 'User found', user);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server Error", error);
    }
};

exports.updateUser = async (req, res) => {
    const userData = req.body;
    console.log('Update User - Request Body:', userData);
    if (!userData || !userData.id || !userData.name || !userData.email || !userData.password) {
        return baseResponse(res, false, 400, 'ID, name, email, and password are required');
    }
    if(!EMAIL_REGEX.test(userData.email)) {
        return baseResponse(res, false, 400, 'Invalid email format', null);
    }

    if(!PASSWORD_REGEX.test(userData.password)) {
        return baseResponse(res, false, 400, 'Password min 8 char, ada 1 angka, dan 1 karakter khusus', null);
    }
    
    try {
        const existingUser = await userRepository.getUserById(userData.id);
        if (!existingUser) {
            return baseResponse(res, false, 404, 'User not found', null);
        }

        const hashedPass = await bcrypt.hash(userData.password, SALT_ROUNDS);

        const updatedUser = await userRepository.updateUser(userData.id, {
            name: userData.name,
            email: userData.email,
            password: hashedPass
        });
        baseResponse(res, true, 200, 'User updated', updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        baseResponse(res, false, 500, error.message || 'Server Error', null);
    }
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return baseResponse(res, false, 400, 'User ID is required');
    }
    try {
        const existingUser = await userRepository.getUserById(userId);
        if (!existingUser) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        const deletedUser = await userRepository.deleteUser(userId);
        baseResponse(res, true, 200, 'User deleted', deletedUser);
    } catch (error) {
        console.error('Error deleting user:', error);
        baseResponse(res, false, 500, error.message || 'Server Error', null);
    }
};

exports.topUpUser = async (req, res) => {
    const { id, amount } = req.query;
    if (!id || !amount) {
        return baseResponse(res, false, 400, 'User ID and amount are required', null);
    }
    const amountValue = parseInt(amount, 10);
    if (isNaN(amountValue) || amountValue <= 0) {
        return baseResponse(res, false, 400, 'Amount must be a positive number', null);
    }
    try {
        const user = await userRepository.getUserById(id);
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        const updatedUser = await userRepository.topUpUserBalance(id, amountValue);
        return baseResponse(res, true, 200, 'Top up successful', updatedUser);
    } catch (error) {
        console.error('Top up error:', error);
        return baseResponse(res, false, 500, 'Server error during top up', null);
    }
};