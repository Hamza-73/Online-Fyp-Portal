const express = require('express');
const authenticateToken = require('../middleware/auth');
const { getStudents, getProfile, editStudentProfile } = require('../controllers/student.controller');
const router = express.Router();

router.get('/students',  getStudents);
router.get('/get-profile/:id', authenticateToken,  getProfile);
router.put('/edit-profile/:id', authenticateToken,  editStudentProfile);

module.exports = router;