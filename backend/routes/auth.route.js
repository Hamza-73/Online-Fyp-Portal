const express = require("express");
const authenticateToken = require("../middleware/auth");
const {
  registerStudent,
  login,
  registerSupervisor,
  getGroups,
  getNotifications,
  markSeenNotification,
  removeNotification,
  getAnnouncement,
  registerExternal,
  editExternal,
  deleteExternal,
  getExternals,
} = require("../controllers/auth.controller");
const router = express.Router();

router.post("/register-student", authenticateToken, registerStudent);
router.post("/register-supervisor", authenticateToken, registerSupervisor);
router.post("/login", login);
router.get("/get-groups", getGroups);
router.get("/get-notifications", authenticateToken, getNotifications);
router.post(
  "/mark-as-seen-notification/:index",
  authenticateToken,
  markSeenNotification
);
router.post(
  "/remove-notification/:index/:type",
  authenticateToken,
  removeNotification
);
router.get("/get-announcement", getAnnouncement);
router.post("/register-external", authenticateToken, registerExternal);
router.put("/edit-external/:id", authenticateToken, editExternal);
router.delete("/delete-external/:id", authenticateToken, deleteExternal);
router.get("/get-externals", authenticateToken, getExternals);

module.exports = router;
