const express = require("express");
const {
  register,
  registerFromFile,
  login,
  getAdmins,
  deleteAdmin,
  editAdmin,
  profile,
  editProfile,
  getProfile,
  approveOrRejectGroup,
} = require("../controllers/admin.controller");
const authenticateToken = require("../middleware/auth");
const router = express.Router();

router.post("/register", register);
router.post("/register-from-file", registerFromFile);
router.post("/login", login);
router.get("/admins", getAdmins);
router.get("/get-profile/:id", authenticateToken, getProfile);
router.get("/profile", authenticateToken, profile);
router.put("/edit-profile/:id", authenticateToken, editProfile);
router.delete("/delete/:id", deleteAdmin);
router.post(
  "/toggle-group-status/:groupId/:isApproved",
  authenticateToken,
  approveOrRejectGroup
);

module.exports = router;
