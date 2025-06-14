const express = require("express");
const authenticateToken = require("../middleware/auth");
const {
  getStudents,
  getProfile,
  editStudentProfile,
  deleteStudent,
  profile,
  sendProjectRequest,
  getSupervisorDetail,
  myGroup,
  requestToJoinGroup,
  registerFromFile,
  uploadDocument,
  uploadProjectSubmission,
  requestMeeting,
  requestExtension,
} = require("../controllers/student.controller");
const router = express.Router();

router.post("/register-from-file", registerFromFile);
router.get("/students", getStudents);
router.get("/get-profile/:id", authenticateToken, getProfile);
router.get("/get-profile", authenticateToken, profile);
router.put("/edit-profile/:id", authenticateToken, editStudentProfile);
router.delete("/delete-student/:id", authenticateToken, deleteStudent);
router.post(
  "/send-project-request/:supervisorId",
  authenticateToken,
  sendProjectRequest
);
router.post(
  "/request-to-join-group/:groupId",
  authenticateToken,
  requestToJoinGroup
);
router.get("/get-supervisor-detail/:supervisorId", getSupervisorDetail);
router.get("/my-group", authenticateToken, myGroup);
router.post("/upload-document", authenticateToken, uploadDocument);
router.post("/upload-project", authenticateToken, uploadProjectSubmission);
router.post("/request-meeting", authenticateToken, requestMeeting);
router.post("/request-extension", authenticateToken, requestExtension);

module.exports = router;
