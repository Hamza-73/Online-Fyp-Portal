const express = require('express');
const authenticateToken = require('../middleware/auth');
const { registerStudent, login, registerSupervisor, getGroups } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register-student', authenticateToken,  registerStudent);
router.post('/register-supervisor', authenticateToken,  registerSupervisor);
router.post('/login', login);
router.get('/get-groups', getGroups);

module.exports = router;