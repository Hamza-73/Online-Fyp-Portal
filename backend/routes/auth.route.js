const express = require('express');
const authenticateToken = require('../middleware/auth');
const { registerStudent, login, registerSupervisor, getGroups, getNotifications, markSeenNotification, removeNotification, getAnnouncement } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register-student', authenticateToken,  registerStudent);
router.post('/register-supervisor', authenticateToken,  registerSupervisor);
router.post('/login', login);
router.get('/get-groups', getGroups);
router.get('/get-notifications', authenticateToken, getNotifications);
router.post('/mark-as-seen-notification/:index', authenticateToken, markSeenNotification);
router.post('/remove-notification/:index/:type', authenticateToken, removeNotification);
router.get('/get-announcement',  getAnnouncement);

module.exports = router;