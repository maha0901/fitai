const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', authController.registerValidation, authController.register);
router.post('/login', authController.loginValidation, authController.login);
router.get('/me', authenticateToken, authController.me);

module.exports = router;
