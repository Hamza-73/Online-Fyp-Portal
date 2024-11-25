const express = require('express');
const authenticateToken = require('../middleware/auth');
const { getStudents, getProfile, editStudentProfile, deleteStudent, profile, sendProjectRequest, getSupervisorDetail, myGroup, requestToJoinGroup } = require('../controllers/student.controller');
const router = express.Router();

router.get('/students',  getStudents);
router.get('/get-profile/:id', authenticateToken,  getProfile);
router.get('/get-profile', authenticateToken, profile);
router.put('/edit-profile/:id', authenticateToken,  editStudentProfile);
router.delete('/delete-student/:id', authenticateToken,  deleteStudent);
router.post('/send-project-request/:supervisorId', authenticateToken,  sendProjectRequest);
router.post('/request-to-join-group/:groupId', authenticateToken,  requestToJoinGroup);
router.get('/get-supervisor-detail/:supervisorId',  getSupervisorDetail);
router.get('/my-group', authenticateToken,  myGroup);

module.exports = router;