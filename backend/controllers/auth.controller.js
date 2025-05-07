const { body, validationResult } = require("express-validator");
const Admin = require("../models/admin.model.js");
const Student = require("../models/student.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Supervisor = require("../models/supervisor.model.js");
const Group = require("../models/group.model.js");
const Announcement = require("../models/announcement.model.js");
const External = require("../models/external.model.js");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports.registerStudent = async (req, res) => {
  try {
    // Fetch the admin details to verify permission
    const adminUser = await Admin.findById(req.user.id);

    // Check if the admin has permission
    if (!adminUser || !(adminUser.superAdmin || adminUser.write_permission)) {
      return res.status(403).json({
        message: "You do not have permission to register students.",
        success: false,
      });
    }

    // Perform validation
    await body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long")
      .run(req);
    await body("father")
      .isLength({ min: 3 })
      .withMessage("Father's name must be at least 3 characters long")
      .run(req);
    await body("email").isEmail().withMessage("Invalid email format").run(req);
    await body("rollNo")
      .matches(/^\d{4}(-RE-R)?(-R)?-BSCS-\d{2}$/)
      .withMessage("Roll number format is invalid")
      .run(req);
    await body("batch")
      .matches(/^\d{4}-\d{4}$/)
      .withMessage("Batch must be in the format XXXX-XXXX")
      .run(req);
    await body("semester")
      .isNumeric()
      .withMessage("Semester must be a number")
      .isInt({ min: 1, max: 8 })
      .withMessage("Semester must be between 1 and 8")
      .run(req);
    await body("cnic")
      .isLength({ min: 13, max: 13 })
      .withMessage("CNIC must be exactly 13 digits")
      .run(req);
    await body("department")
      .notEmpty()
      .withMessage("Department is required")
      .run(req);

    // Validate the input and check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, father, email, rollNo, batch, department, cnic, semester } =
      req.body;

    // Check if email, CNIC, or roll number already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { cnic }],
    });
    if (existingStudent) {
      return res.status(400).json({ message: "Email or CNIC already exists" });
    }
    const existingRollNo = await Student.findOne({ rollNo });
    if (existingRollNo) {
      return res.status(400).json({ message: "Roll No already exists" });
    }

    // Create a new student with CNIC as the password
    const newStudent = new Student({
      name: name.trim(),
      father: father.trim(),
      email,
      rollNo,
      batch,
      department,
      cnic,
      semester,
      password: cnic, // Use CNIC as the password
    });

    // Save the new student to the database
    await newStudent.save();

    // Return success message
    res
      .status(201)
      .json({ success: true, message: "Student registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports.registerSupervisor = async (req, res) => {
  try {
    // Fetch the admin details to verify permission
    const adminUser = await Admin.findById(req.user.id);

    // Check if the admin has permission
    if (!adminUser || !(adminUser.superAdmin || adminUser.write_permission)) {
      return res.status(403).json({
        message: "You do not have permission to register supervisor.",
        success: false,
      });
    }

    // Perform validation
    await body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long")
      .run(req);
    await body("email").isEmail().withMessage("Invalid email format").run(req);
    await body("cnic")
      .isLength({ min: 13, max: 13 })
      .withMessage("CNIC must be exactly 13 digits")
      .run(req);
    await body("username")
      .notEmpty()
      .withMessage("Username is required")
      .run(req);
    await body("department")
      .notEmpty()
      .withMessage("Department is required")
      .run(req);
    await body("designation")
      .notEmpty()
      .withMessage("Designation is required")
      .run(req);

    // Validate the input and check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, username, email, department, cnic, designation, slots } =
      req.body;

    // Check if email, CNIC, or roll number already exists
    const existingSupervisor = await Supervisor.findOne({
      $or: [{ email }, { cnic }],
    });
    if (existingSupervisor) {
      return res.status(400).json({ message: "Email or CNIC already exists" });
    }

    // Create a new student with CNIC as the password
    const newSupervisor = new Supervisor({
      name: name.trim(),
      email,
      designation,
      department,
      cnic,
      password: cnic, // Use CNIC as the password
      username,
      slots: slots || 0,
    });

    // Save the new student to the database
    await newSupervisor.save();

    // Return success message
    res
      .status(201)
      .json({ success: true, message: "Supervisor registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports.login = async (req, res) => {
  const { password, username } = req.body;

  try {
    let user;
    let role;

    // Check if username is a rollNo or CNIC for students
    if (/^\d{4}(-RE-R)?(-R)?-BSCS-\d{2}$/.test(username)) {
      // Check if user exists in the student collection by rollNo
      user = await Student.findOne({ rollNo: username });
      if (user) {
        role = "student";
      }
    } else if (/^\d{13}$/.test(username)) {
      // Check if user exists in the student collection by CNIC
      user = await Student.findOne({ cnic: username });
      if (user) {
        role = "student";
      }
    }

    if (!user) {
      // Check if user exists in the supervisor collection
      user = await Supervisor.findOne({ username });
      if (user) {
        role = "supervisor";
      }
    }

    // If no user found in either collection
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role }, JWT_SECRET, {
      expiresIn: "48h",
    });

    // Prepare token and role for storing in the cookie
    const tokenWithRole = JSON.stringify({ token, role });

    // Set the token and role in a cookie with appropriate settings
    res.cookie("auth", tokenWithRole, {
      httpOnly: false, // Set httpOnly to true for better security
      secure: process.env.NODE_ENV === "production", // Set to true for HTTPS in production
      sameSite: "strict", // 'lax' or 'none' could be used if 'strict' causes issues
      maxAge: 3600000 * 24, // Cookie expiry: 24 hours
      path: "/", // Make cookie accessible across all routes
    });

    // Send the response without the token in the body
    res.status(200).json({
      success: true,
      message: "Login successful",
      role, // Send the role only in response, not the token,
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.getGroups = async (req, res) => {
  try {
    // Fetch all groups and populate supervisor and students details
    const groups = await Group.find({})
      .populate({
        path: "students",
        select: "name rollNo batch semester email department",
      })
      .populate({
        path: "supervisor",
        select: "name email department designation", // Include relevant supervisor fields
      });

    if (!groups || groups.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "No groups found" });
    }

    // Group data by supervisor
    const groupedData = groups.reduce((acc, group) => {
      const supervisor = group.supervisor;
      if (!supervisor) {
        return acc; // Skip groups without a supervisor
      }

      const supervisorId = supervisor._id.toString();
      if (!acc[supervisorId]) {
        acc[supervisorId] = {
          supervisorId,
          supervisorName: supervisor.name,
          email: supervisor.email,
          department: supervisor.department,
          designation: supervisor.designation,
          groups: [],
        };
      }

      acc[supervisorId].groups.push({
        groupId: group._id,
        title: group.title,
        description: group.description,
        scope: group.scope,
        students: group.students,
        marks: group.marks,
        deadlines: group.deadlines,
        submissions: group.submissions,
        viva: group.viva,
        isApproved: group.isApproved,
      });

      return acc;
    }, {});

    // Convert grouped data from an object to an array
    const result = Object.values(groupedData);

    res.status(200).json({
      success: true,
      message: "Data grouped by supervisor",
      data: result,
    });
  } catch (error) {
    console.error("Error grouping data by supervisor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.getNotifications = async (req, res) => {
  try {
    const supervisor = await Supervisor.findById(req.user.id);
    if (supervisor)
      return res
        .status(200)
        .json({ success: true, notifications: supervisor.notifications });

    const student = await Student.findById(req.user.id);
    if (student)
      return res
        .status(200)
        .json({ success: true, notifications: student.notifications });

    return res.status(404).json({ success: false, message: "User Not Found" });
  } catch (error) {
    console.error("Error grouping data by supervisor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.markSeenNotification = async (req, res) => {
  try {
    const { index } = req.params; // Get the notification index from params
    const userId = req.user.id; // Get logged-in user ID

    // Find the user in either Supervisor or Student collection
    const user =
      (await Supervisor.findById(userId).exec()) ||
      (await Student.findById(userId).exec());

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const notificationToMove = user.notifications.unseen[index];

    if (!notificationToMove) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    // Move notification from unseen to seen
    user.notifications.unseen.splice(index, 1);
    user.notifications.seen.push(notificationToMove);

    // Save the changes
    await user.save();

    // Return the updated notifications
    return res.status(200).json({
      success: true,
      message: "Notification marked as seen",
      notifications: user.notifications, // Include the updated notifications
    });
  } catch (error) {
    console.error("Error marking notification as seen:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.removeNotification = async (req, res) => {
  try {
    const { type, index } = req.params; // Get the notification type and index from params
    const userId = req.user.id; // Get logged-in user ID

    // Find the user in either Supervisor or Student collection
    const user =
      (await Supervisor.findById(userId).exec()) ||
      (await Student.findById(userId).exec());

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check the type (either "seen" or "unseen") and find the notification in the correct array
    if (type !== "seen" && type !== "unseen") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid notification type" });
    }

    const notificationsArray = user.notifications[type]; // Get the array based on the type

    if (!notificationsArray || notificationsArray.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } notifications not found`,
      });
    }

    const notificationToRemove = notificationsArray[index]; // Find the notification by index

    if (!notificationToRemove) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    // Remove the notification from the array
    notificationsArray.splice(index, 1);

    // Save the changes
    await user.save();

    // Return the updated notifications
    return res.status(200).json({
      success: true,
      message: "Notification removed successfully",
      notifications: user.notifications, // Include the updated notifications
    });
  } catch (error) {
    console.error("Error removing notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.find({});
    res.json({ announcement });
  } catch (error) {
    console.error("Error getting announcement :", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.registerExternal = async (req, res) => {
  try {
    const adminId = req.user.id; // Extract admin ID from the token
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { name, username, email, phone } = req.body;
    // Check if the email or username already exists
    const existingUser = await External.findOne({
      $or: [
        { email },
        {
          username: {
            $regex: new RegExp("^" + username.toLowerCase(), "i"),
          },
        },
      ],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or Username already exists" });
    }
    // Create the new external user
    const newExternal = new External({
      name,
      username,
      email,
      phone,
    });
    await newExternal.save();

    return res.status(200).json({
      success: true,
      message: "External user registered successfully",
      external: newExternal,
    });
  } catch (error) {
    console.error("Error in registerExternal:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.editExternal = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const updates = {};
    const allowedFields = ["name", "username", "email", "phone"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updates[field] = req.body[field];
      }
    });

    // Check for unique email or username if they are being updated
    if (updates.email || updates.username) {
      const existingUser = await External.findOne({
        $or: [
          updates.email ? { email: updates.email } : {},
          updates.username
            ? {
                username: {
                  $regex: new RegExp("^" + updates.username.toLowerCase(), "i"),
                },
              }
            : {},
        ],
        _id: { $ne: id },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email or Username already exists" });
      }
    }

    const updatedExternal = await External.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedExternal) {
      return res.status(404).json({ message: "External user not found" });
    }

    return res.status(200).json({
      success: true,
      message: "External user updated successfully",
      external: updatedExternal,
    });
  } catch (error) {
    console.error("Error in editExternal:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.getExternals = async (req, res) => {
  try {
    const externals = await External.find({});
    return res.status(200).json({ success: true, externals });
  } catch (error) {
    console.error("Error in registerExternal:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.deleteExternal = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { id } = req.params;
    const external = await External.findByIdAndDelete(id);
    if (!external) {
      return res.status(404).json({ message: "External user not found" });
    }
    return res
      .status(200)
      .json({ message: "External user deleted successfully", success: true });
  } catch (error) {
    console.error("Error in registerExternal:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
