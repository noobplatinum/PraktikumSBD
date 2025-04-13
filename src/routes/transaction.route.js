const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

router.delete('/:id', transactionController.deleteTransaction);
router.post('/create', transactionController.createTransaction);
router.post('/pay/:id', transactionController.payTransaction);
router.get('/', transactionController.getAllTransactions);


module.exports = router;