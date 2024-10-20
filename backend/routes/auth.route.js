const express = require('express');
const authenticateToken = require('../middleware/auth');
const { registerStudent } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register-student', authenticateToken,  registerStudent);

module.exports = router;