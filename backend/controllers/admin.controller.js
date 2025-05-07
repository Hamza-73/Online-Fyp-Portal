const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model.js");
const Group = require("../models/group.model.js");
const Supervisor = require("../models/supervisor.model.js");
const Student = require("../models/student.model.js");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports.register = [
  // Validation middleware
  body("username", "Enter a valid username").isLength({ min: 3 }),
  body("fname", "Enter a valid first name").isLength({ min: 3 }),
  body("lname", "Enter a valid last name").isLength({ min: 3 }),
  body("email", "Enter a valid email address").isEmail(),
  body("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),

  // Controller logic
  async (req, res) => {
    const { fname, lname, username, email, password } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if any admins already exist
      const checkAdmin = await Admin.find();

      // Check if email or username already exists
      const existingAdmin = await Admin.findOne({
        $or: [
          { email },
          {
            username: { $regex: new RegExp("^" + username.toLowerCase(), "i") },
          },
        ],
      });

      if (existingAdmin) {
        return res
          .status(400)
          .json({ message: "Email or Username already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create the new admin
      const newAdmin = new Admin({
        fname,
        lname,
        username,
        email,
        password: hashedPassword,
      });

      // If this is the first admin, make them the super admin
      if (checkAdmin.length === 0) {
        newAdmin.superAdmin = true;
        newAdmin.write_permission = true;
      }

      await newAdmin.save();

      // Respond with success message only, without token
      res.json({
        success: true,
        message: "Admin registration successful",
        newAdmin,
      });
    } catch (err) {
      console.error("Error in admin registration:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

module.exports.registerFromFile = async (req, res) => {
  if (!req.files || !req.files.excelFile) {
    return res
      .status(400)
      .json({ success: false, message: "No files were uploaded." });
  }

  const excelFile = req.files.excelFile;
  console.log("file is ", excelFile);

  try {
    // Read the file directly from the buffer (excelFile.data)
    const workbook = XLSX.read(excelFile.data, {
      type: "buffer",
      cellDates: true,
    });
    const sheetName = workbook.SheetNames[0];
    const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log("data is ", excelData);

    // Check if there are any existing admins in the database
    const existingAdmins = await Admin.find({});
    let isSuperAdminSet = existingAdmins.length > 0; // Flag to check if superAdmin is needed (if no admins exist, it's false)

    // To check for unique email and username
    const uniqueEmails = new Set();
    const uniqueUsernames = new Set();

    // Array to store newly created admins
    const newAdmins = [];

    // Iterate over the data to validate and process each user
    for (let i = 0; i < excelData.length; i++) {
      const user = excelData[i];

      // Check for duplicate email in the file
      if (uniqueEmails.has(user.email)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate email found in row ${i + 1}: ${user.email}`,
        });
      }
      uniqueEmails.add(user.email);

      // Validate alphanumeric username
      if (user.username && !/^[a-zA-Z0-9]+$/.test(user.username)) {
        return res.status(400).json({
          success: false,
          message: `Username should be alphanumeric for user at row ${i + 1}`,
        });
      }

      // Check for duplicate username in the file
      if (
        user.username &&
        uniqueUsernames.has(user.username.toLowerCase().replace(/\s+/g, ""))
      ) {
        return res.status(400).json({
          success: false,
          message: `Duplicate username found in row ${i + 1}: ${user.username}`,
        });
      }
      uniqueUsernames.add(user.username);

      // Validate password length (at least 6 characters)
      if (!user.password || user.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: `Password must be at least 6 characters for user at row ${
            i + 1
          }`,
        });
      }

      // Check if the user already exists in the database
      const isValid = await Admin.findOne({
        $or: [{ email: user.email }, { username: user.username }],
      });
      if (isValid) {
        return res.status(400).json({
          success: false,
          message: `User with email/username already exists in the database at row ${
            i + 1
          }.`,
        });
      }

      // Hash the password before storing it in the database
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password.toString(), salt);

      // Determine if the user should be a superAdmin
      const isSuperAdmin = !isSuperAdminSet && i === 0;
      if (isSuperAdmin) {
        isSuperAdminSet = true; // Set the flag to true after assigning the first user as superAdmin
      }

      // Prepare the admin object
      const newUser = new Admin({
        fname: user.fname,
        lname: user.lname,
        username: user.username,
        email: user.email,
        password: hashedPassword,
        superAdmin: isSuperAdmin, // Set superAdmin true for the first user if no admins exist
        write_permission: isSuperAdmin ? true : false, // Super admin gets write permissions
        requests: user.requests || [], // Set any requests provided in the Excel data
      });

      // Save user to the database
      await newUser.save();

      // Add the newly created user to the array
      newAdmins.push(newUser);
    }

    return res.json({
      success: true,
      message: "File uploaded and users registered successfully.",
      newAdmins,
    });
  } catch (error) {
    console.error("Error occurred while processing data:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Function to check if the user already exists (based on email or username)
const userExist = async (user) => {
  const existingUser = await Admin.findOne({
    $or: [
      { email: user.email },
      {
        username: {
          $regex: new RegExp("^" + user.username.toLowerCase(), "i"),
        },
      },
    ],
  });

  return existingUser ? true : false;
};

module.exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username: username.trim() });

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    // Create JWT token
    const token = jwt.sign({ id: admin.id, role: "admin" }, JWT_SECRET, {
      expiresIn: "48h",
    });

    // Prepare user data (excluding password)
    const userData = { ...admin._doc }; // Spread the document data
    delete userData.password; // Remove password from the data
    delete userData.requests; // Remove password from the data

    const tokenWithRole = JSON.stringify({ token, role: "admin" });

    // Set userData in the cookie
    res.cookie("auth", tokenWithRole, {
      httpOnly: false, // Set to true if you don't want JS access to the cookie
      secure: process.env.NODE_ENV === "production", // Only sent over HTTPS in production
      sameSite: "strict", // Prevent CSRF attacks
      maxAge: 3600000 * 24, // Cookie expiry in 48 hours
    });

    // Send success response
    res.status(200).json({
      success: true,
      message: "Admin login successful",
    });
  } catch (err) {
    console.error("Error in admin login:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports.getAdmins = async (req, res) => {
  const admin = await Admin.find();
  return res.json({
    message: "Admin Fteched successful",
    success: true,
    admin,
  });
};

module.exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params; // Destructure id from req.params
    const admin = await Admin.findById(id);

    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });
    }

    // Check if the admin is a super admin
    if (admin.superAdmin) {
      return res
        .status(403)
        .json({ message: "Super admin cannot be deleted", success: false });
    }

    // Proceed to delete if found and not a super admin
    await Admin.findByIdAndDelete(id);
    return res.json({ message: "Admin deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.editProfile = [
  // Validation for fields to be updated (all optional)
  body("fname")
    .optional()
    .isLength({ min: 3 })
    .withMessage("First name must be at least 3 characters"),
  body("lname")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Last name must be at least 3 characters"),
  body("username")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email").optional().isEmail().withMessage("Enter a valid email address"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  // Controller logic
  async (req, res) => {
    const {
      fname,
      lname,
      username,
      email,
      password,
      write_permission,
      superAdmin,
    } = req.body;
    const { id } = req.params; // The ID of the admin being edited

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Find the admin to edit
      const adminToEdit = await Admin.findById(id);
      if (!adminToEdit) {
        return res.status(404).json({ message: "Admin to edit not found" });
      }

      // Find the logged-in admin to check permissions
      const loggedInAdmin = await Admin.findById(req.user.id); // Fetch the logged-in admin object
      if (!loggedInAdmin) {
        return res.status(404).json({ message: "Logged-in admin not found" });
      }

      // Check permissions
      const isEditingOwnProfile = adminToEdit.id === loggedInAdmin.id; // If the admin is editing their own profile
      const isSuperAdmin = loggedInAdmin.superAdmin; // Check if the logged-in admin is a super admin

      // If not editing own profile and not a super admin, check permissions
      if (
        !isEditingOwnProfile &&
        !isSuperAdmin &&
        !loggedInAdmin.write_permission
      ) {
        return res.status(403).json({
          message: "You do not have permission to edit other admins.",
        });
      }

      // Check if username or email already exists (if being updated)
      if (email || username) {
        const existingAdmin = await Admin.findOne({
          $or: [
            email ? { email } : {},
            username
              ? {
                  username: {
                    $regex: new RegExp("^" + username.toLowerCase(), "i"),
                  },
                }
              : {},
          ],
          _id: { $ne: adminToEdit._id }, // Exclude the current admin being edited
        });

        if (existingAdmin) {
          return res
            .status(400)
            .json({ message: "Email or Username already exists" });
        }
      }

      // Update fields only if provided in the request
      ["fname", "lname", "username", "email"].forEach((field) => {
        if (req.body[field]) adminToEdit[field] = req.body[field].trim();
      });

      // If editing own profile, allow to change all but write_permission and superAdmin
      if (isEditingOwnProfile) {
        // Only superAdmin can update 'write_permission' or 'superAdmin' status
        if (isSuperAdmin) {
          if (write_permission !== undefined)
            adminToEdit.write_permission = write_permission;
          if (superAdmin !== undefined) adminToEdit.superAdmin = superAdmin;
        }
      } else if (!isSuperAdmin) {
        // If not editing own profile and not a super admin, do not allow changing write_permission or superAdmin
        if (write_permission !== undefined || superAdmin !== undefined) {
          return res.status(403).json({
            message:
              "You are not allowed to change write_permission or superAdmin status.",
          });
        }
      } else {
        // Super admin can update all fields, including write_permission and superAdmin
        if (write_permission !== undefined)
          adminToEdit.write_permission = write_permission;
        if (superAdmin !== undefined) adminToEdit.superAdmin = superAdmin;
      }

      // Hash the password if it's being updated
      if (password) {
        const salt = await bcrypt.genSalt(10);
        adminToEdit.password = await bcrypt.hash(password, salt);
      }

      // Save the updated admin data
      await adminToEdit.save();

      res.json({
        success: true,
        message: "Admin updated successfully",
        admin: adminToEdit,
      });
    } catch (err) {
      console.error("Error updating admin:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

module.exports.profile = async (req, res) => {
  try {
    // Assuming `req.user` contains the decoded token data, including the admin ID
    const { id } = req.user; // Extract the user ID from the token

    // Fetch the admin profile based on the ID from the token
    const adminData = await Admin.findById(id);

    if (!adminData) {
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });
    }

    const admin = { ...adminData._doc };
    delete admin.password;

    return res.json({ message: "Admin Profile", success: true, admin });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.getProfile = async (req, res) => {
  try {
    // Extract logged-in admin's ID and write_permission from the token
    const { id: loggedInAdminId, write_permission } = req.user;

    // Get the admin ID from the URL parameters (if provided)
    const { id: profileId } = req.params;

    // Determine which admin profile to retrieve: either the one from URL or the logged-in admin's own profile
    const targetId = profileId || loggedInAdminId;

    // Fetch the admin data by ID
    const adminData = await Admin.findById(targetId);

    // Check if admin exists
    if (!adminData) {
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });
    }

    // Fetch the superAdmin property of the logged-in admin from the database
    const loggedInAdmin = await Admin.findById(loggedInAdminId);

    // Convert ObjectId to string for comparison
    const isOwnProfile =
      loggedInAdminId.toString() === adminData._id.toString();

    // Allow access if the logged-in admin is the owner, or if they are a superAdmin or have write_permission
    if (isOwnProfile || loggedInAdmin.superAdmin || write_permission) {
      const admin = { ...adminData._doc };
      delete admin.password; // Exclude password from the response

      return res.json({ message: "Admin Profile", success: true, admin });
    }

    // If none of the conditions are met, deny access
    return res.status(403).json({
      message: "You do not have permission to view this profile",
      success: false,
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.approveOrRejectGroup = async (req, res) => {
  try {
    const { isApproved, groupId } = req.params;
    const id = req.user.id;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group Not Found", group });
    }

    if (
      group?.students?.length === 0 ||
      group?.students === undefined ||
      group?.students?.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Group must have at least 2 students",
      });
    }

    group.isApproved = isApproved;

    //notify group students
    const notifyUsers = async () => {
      // send notifications to students
      const students = await Student.find({}).populate("group");
      if (students && students.length > 0) {
        students.forEach(async (student) => {
          student.notifications.unseen.push({
            message: `You're Group "${group.title}" has been Approved`,
            type: "Important",
          });
          await student.save();
        });
      }

      // notify supervisors
      const supervisors = await Supervisor.find({});
      if (supervisors && supervisors.length > 0) {
        supervisors.forEach(async (supervisor) => {
          supervisor.notifications.unseen.push({
            message: `You're Group "${group.title}" has been Approved`,
            type: "Important",
          });
          await supervisor.save();
        });
      }
    };

    notifyUsers();

    await group.save();

    return res
      .status(200)
      .json({ success: true, message: "Group status changed successfully!" });
  } catch (error) {
    console.error("Error chaning group status:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
