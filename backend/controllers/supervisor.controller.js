const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const Student = require("../models/student.model.js");
const Supervisor = require("../models/supervisor.model.js");
const Admin = require("../models/admin.model.js");
const Group = require("../models/group.model.js");
const Project = require("../models/project.model.js");
const Deadline = require("../models/deadline.model.js");
const Announcement = require("../models/announcement.model.js");
const XLSX = require("xlsx");
const Viva = require("../models/viva.model.js");

module.exports.getSupervisors = async (req, res) => {
  try {
    const supervisors = await Supervisor.find();
    return res.json({
      message: "Students Fteched successful",
      success: true,
      supervisors,
    });
  } catch (error) {}
};

module.exports.profile = async (req, res) => {
  try {
    // Assuming `req.user` contains the decoded token data, including the admin ID
    const id = req.user.id; // Extract the user ID from the token

    // Fetch the supervisor profile based on the ID from the token
    const supervisorData = await Supervisor.findById(id).populate("deadlines");

    if (!supervisorData) {
      return res
        .status(404)
        .json({ message: "Supervisor not found", success: false });
    }

    const supervisor = { ...supervisorData._doc };
    delete supervisor.password;

    return res.json({
      message: "Supervisor Profile",
      success: true,
      supervisor,
    });
  } catch (error) {
    console.error("Error fetching supervisor profile:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.getProfile = async (req, res) => {
  try {
    const adminId = req.user.id; // Assuming the admin's ID is available from req.user after authentication
    const supervisorId = req.params.id; // Get student ID from URL params

    // Fetch the admin details to check for permission
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Admin not found" });
    }

    // Check if admin is SuperAdmin or has write permission
    if (!admin.superAdmin || !admin.write_permission) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You do not have the required permissions",
      });
    }

    // Fetch the student details by ID, excluding the password field
    const supervisor = await Supervisor.findById(supervisorId).select(
      "-password"
    );

    if (!supervisor) {
      return res
        .status(404)
        .json({ success: false, message: "Supervisor not found" });
    }

    // If everything is fine, return the student profile
    return res.status(200).json({ success: true, supervisor });
  } catch (error) {
    console.error("Error fetching supervisor profile:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports.registerFromFile = async (req, res) => {
  if (!req.files || !req.files.excelFile) {
    return res
      .status(400)
      .json({ success: false, message: "No files were uploaded." });
  }

  const excelFile = req.files.excelFile;

  try {
    // Read the file directly from the buffer (excelFile.data)
    const workbook = XLSX.read(excelFile.data, {
      type: "buffer",
      cellDates: true,
    });
    const sheetName = workbook.SheetNames[0];
    const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // To check for unique email and username
    const uniqueEmails = new Set();
    const uniqueUsernames = new Set();

    // Array to store newly created supervisors
    const newSupervisors = [];

    // Iterate over the data to validate and process each supervisor
    for (let i = 0; i < excelData.length; i++) {
      const supervisor = excelData[i];

      // Validate name
      if (!supervisor.name || supervisor.name.length < 3) {
        return res.status(400).json({
          success: false,
          message: `Name must be at least 3 characters for supervisor at row ${
            i + 1
          }`,
        });
      }

      // Validate username
      if (!supervisor.username || supervisor.username.length < 3) {
        return res.status(400).json({
          success: false,
          message: `Username must be at least 3 characters for supervisor at row ${
            i + 1
          }`,
        });
      }

      // Check for duplicate username in the file
      if (uniqueUsernames.has(supervisor.username)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate username found in row ${i + 1}: ${
            supervisor.username
          }`,
        });
      }
      uniqueUsernames.add(supervisor.username);

      // Validate email format using regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!supervisor.email || !emailRegex.test(supervisor.email)) {
        return res.status(400).json({
          success: false,
          message: `Invalid email format for supervisor at row ${i + 1}`,
        });
      }

      // Check for duplicate email in the file
      if (uniqueEmails.has(supervisor.email)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate email found in row ${i + 1}: ${supervisor.email}`,
        });
      }
      uniqueEmails.add(supervisor.email);

      // Validate CNIC format (13 digits)
      if (!supervisor.cnic || !/^\d{13}$/.test(supervisor.cnic.toString())) {
        return res.status(400).json({
          success: false,
          message: `CNIC must be exactly 13 digits for supervisor at row ${
            i + 1
          }`,
        });
      }

      // Validate password length
      if (!supervisor.password || supervisor.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: `Password must be at least 6 characters for supervisor at row ${
            i + 1
          }`,
        });
      }

      // Validate designation and department
      if (!supervisor.designation || !supervisor.department) {
        return res.status(400).json({
          success: false,
          message: `Designation and department are required for supervisor at row ${
            i + 1
          }`,
        });
      }

      // Check if the supervisor already exists in the database
      const isValid = await Supervisor.findOne({
        $or: [{ email: supervisor.email }, { username: supervisor.username }],
      });
      if (isValid) {
        return res.status(400).json({
          success: false,
          message: `Supervisor with email/username already exists in the database at row ${
            i + 1
          }.`,
        });
      }

      // Hash the password before storing it in the database
      // const salt = await bcrypt.genSalt(10);
      // const hashedPassword = await bcrypt.hash(supervisor.cnic.toString(), salt);

      // Prepare the supervisor object
      const newSupervisor = new Supervisor({
        name: supervisor.name,
        username: supervisor.username,
        email: supervisor.email,
        cnic: supervisor.cnic,
        designation: supervisor.designation,
        department: supervisor.department,
        slots: supervisor.slots || 0,
        password: supervisor.cnic,
        isCommittee: supervisor.isCommittee || false,
        notifications: supervisor.notifications || { seen: [], unseen: [] },
        myIdeas: supervisor.myIdeas || [],
      });

      // Save supervisor to the database
      await newSupervisor.save();

      // Add the newly created supervisor to the array
      newSupervisors.push(newSupervisor);
    }

    return res.json({
      success: true,
      message: "File uploaded and supervisors registered successfully.",
      newSupervisors,
    });
  } catch (error) {
    console.error("Error occurred while processing data:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.editSupervisorProfile = [
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),
  body("username")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email").optional().isEmail().withMessage("Enter a valid email address"),
  body("cnic")
    .optional()
    .isLength({ min: 13, max: 13 })
    .withMessage("CNIC must be exactly 13 digits"),

  async (req, res) => {
    const { id } = req.params; // Supervisor ID
    const { password, email } = req.body; // Fields to be updated

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Fetch the supervisor to edit
      const supervisorToEdit = await Supervisor.findById(id);
      if (!supervisorToEdit) {
        return res
          .status(404)
          .json({ success: false, message: "Supervisor not found" });
      }

      // Check if the logged-in user is the supervisor or an admin
      const isOwner = supervisorToEdit._id.equals(req.user.id);

      let isAdmin = false;
      let loggedInAdmin = null;

      // Fetch admin details only if the user is not the supervisor (optimization)
      if (!isOwner) {
        loggedInAdmin = await Admin.findById(req.user.id);
        if (!loggedInAdmin) {
          return res.status(403).json({
            success: false,
            message:
              "You do not have permission to edit this supervisor's profile.",
          });
        }
        isAdmin = loggedInAdmin.superAdmin || loggedInAdmin.write_permission;
      }

      // If neither owner nor admin, deny access
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to edit this supervisor's profile.",
        });
      }

      // Update logic based on user role
      if (isOwner) {
        // Allow supervisor to edit their email and password
        if (email) supervisorToEdit.email = email.trim();
        if (password) {
          const salt = await bcrypt.genSalt(10);
          supervisorToEdit.password = await bcrypt.hash(password, salt);
        }
      } else if (isAdmin) {
        // Allow admin to update all fields
        if (email) supervisorToEdit.email = email.trim();
        if (password) {
          const salt = await bcrypt.genSalt(10);
          supervisorToEdit.password = await bcrypt.hash(password, salt);
        }

        Object.keys(req.body).forEach((field) => {
          if (field !== "password") {
            supervisorToEdit[field] = req.body[field];
          }
        });
      }

      await supervisorToEdit.save();
      res.json({
        success: true,
        message: "Supervisor profile updated successfully",
        supervisor: supervisorToEdit,
      });
    } catch (err) {
      console.error("Error updating supervisor profile:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
];

module.exports.deleteSupervisor = async (req, res) => {
  try {
    const { id } = req.params; // Destructure id from req.params
    const adminId = req.user.id;
    const supervisor = await Supervisor.findById(id);

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    // Check if the admin is a super admin
    if (!admin.superAdmin || !admin.write_permission) {
      return res.status(403).json({
        message: `You don't have permission to delete`,
        success: false,
      });
    }

    if (!supervisor) {
      return res
        .status(404)
        .json({ message: "Student not found", success: false });
    }

    // Proceed to delete if found and not a super admin
    await Supervisor.findByIdAndDelete(id);
    return res.json({
      message: "Supervisor deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting Supervisor:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.viewRequests = async (req, res) => {
  try {
    const id = req.user.id; // Get the supervisor ID from the request user

    // Find the supervisor and populate the required fields
    const supervisor = await Supervisor.findById(id)
      .populate({
        path: "projectRequest.project", // Populate project details
        select: "title description scope status", // Select specific fields
      })
      .populate({
        path: "projectRequest.student", // Populate student details
        select: "name rollNo semester department batch email", // Select specific fields
      });

    if (!supervisor) {
      return res
        .status(404)
        .json({ success: false, message: "Supervisor not found" });
    }

    // Retrieve and format the project requests
    const requests = supervisor.projectRequest.map((request) => ({
      isAccepted: request.isAccepted,
      project: request.project, // Populated project data
      student: request.student, // Populated student data
      createdAt: request.createdAt,
    }));

    return res.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const supervisorId = req.user.id;

    const supervisor = await Supervisor.findById(supervisorId).populate(
      "projectRequest"
    );
    if (!supervisor) {
      return res
        .status(404)
        .json({ success: false, message: "Supervisor not found" });
    }

    const projectRequest = supervisor.projectRequest.find((request) =>
      request.project.equals(requestId)
    );
    if (!projectRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Project request not found" });
    }

    const project = await Project.findById(projectRequest.project);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Check if the project already has a supervisor
    if (project.supervisor && !project.supervisor.equals(supervisorId)) {
      const currentSupervisor = await Supervisor.findById(project.supervisor);
      return res.status(400).json({
        success: false,
        message: `Project is already supervised by ${
          currentSupervisor?.name || "another supervisor"
        }`,
      });
    }

    const student = await Student.findById(projectRequest.student);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (student.isGroupMember) {
      return res
        .status(400)
        .json({ success: false, message: "Student is already in a group" });
    }

    // Remove the project request from supervisor
    supervisor.projectRequest = supervisor.projectRequest.filter(
      (request) => !request.student.equals(student._id)
    );
    await supervisor.save();

    const existingGroup = await Group.findOne({
      title: project.title,
      supervisor: supervisorId,
    });
    if (existingGroup) {
      if (existingGroup.students.length >= 3) {
        return res
          .status(400)
          .json({ success: false, message: "The group is already full" });
      }

      //if group exists and it isn't full then add this student to the group
      existingGroup.students.push(student._id);
      project.students.push(student._id);
      student.group = existingGroup._id;
      student.isGroupMember = true;
      project.status = "accepted";

      await Promise.all([existingGroup.save(), project.save(), student.save()]);
      supervisor.notifications.unseen.push({
        type: "Important",
        message: `Added ${student.name} to your group for project: ${project.title}.`,
      });
      return res.json({
        success: true,
        message: "Request accepted and student added to the group.",
        notifications: supervisor.notifications,
        requests: supervisor.projectRequest,
      });
    }

    // Create a new group if none exists
    if (supervisor.slots <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Your slots are full" });
    }

    const newGroup = new Group({
      title: project.title,
      description: project.description,
      scope: project.scope,
      supervisor: supervisor._id,
      project: project._id,
    });

    newGroup.students.push(student._id);
    supervisor.groups.push(newGroup._id);

    student.group = newGroup._id;
    student.isGroupMember = true;
    project.students.push(student._id);
    project.supervisor = supervisor._id;
    project.status = "accepted";

    // if group is formed after the deadline has been announced than add deadline id to new group
    const deadline = await Deadline.find({});
    // console.log("deadline is ", deadline)
    if (deadline && deadline[0]) {
      // console.log("runing")
      newGroup.deadlines = deadline[0]?._id;
    }

    supervisor.slots--;
    if (supervisor.slots === 0) {
      await Promise.all(
        supervisor.myIdeas.map(async (idea) => {
          const projectIdea = await Project.findById(idea.projectId);
          if (projectIdea) {
            projectIdea.active = false;
            await projectIdea.save();
          }
        })
      );
    }

    student.requests.pendingRequests = [];
    student.requests.receivedRequests = [];
    student.requests.rejectedRequests = [];
    student.notifications.unseen.push({
      type: "Important",
      message: `${supervisor.name} accepted your proposal for ${project.title}.`,
    });

    await Promise.all([
      newGroup.save(),
      student.save(),
      supervisor.save(),
      project.save(),
    ]);
    return res.json({
      success: true,
      message: "Project request accepted and group created.",
      notifications: supervisor.notifications,
      requests: supervisor.projectRequest,
    });
  } catch (err) {
    console.error("Error in accepting request:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const supervisorId = req.user.id;

    const supervisor = await Supervisor.findById(supervisorId).populate(
      "projectRequest"
    );
    if (!supervisor) {
      return res
        .status(404)
        .json({ success: false, message: "Supervisor not found" });
    }

    const projectRequest = supervisor.projectRequest.find((request) =>
      request.project.equals(requestId)
    );
    if (!projectRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Project request not found" });
    }

    const project = await Project.findById(projectRequest.project);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Check if the project already has a supervisor
    if (project.supervisor && !project.supervisor.equals(supervisorId)) {
      const currentSupervisor = await Supervisor.findById(project.supervisor);
      return res.status(400).json({
        success: false,
        message: `Project is already supervised by ${
          currentSupervisor?.name || "another supervisor"
        }`,
      });
    }

    const student = await Student.findById(projectRequest.student);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // Remove the project request from student's pendingRequests array
    if (student) {
      // console.log('student is ', student);
      const updatedPendingRequests = student.requests.pendingRequests.filter(
        (request) => !request.equals(supervisor._id)
      );
      student.requests.pendingRequests = updatedPendingRequests;
      console.log("project request ", supervisor.projectRequest);
      console.log("project request 2", requestId);
      const updateSupervisorRequests = supervisor.projectRequest.filter(
        (request) => !request.project.equals(requestId)
      );
      console.log("request is ", updateSupervisorRequests);
      supervisor.projectRequest = updateSupervisorRequests;

      student.requests.rejectedRequests.push(supervisor._id);
      student.notifications.unseen.push({
        type: "Important",
        message: `${supervisor.name} rejected your request, You cannot send request to this supervisor Anymore.`,
      });

      // Optionally, you can perform additional actions after the delete if needed.
      if (projectRequest && !projectRequest.supervisor) {
        await Project.findByIdAndDelete(requestId);
        // console.log('deleting');
      }
      await Promise.all([student.save(), supervisor.save()]);
      console.log("supervisor requests ", supervisor.projectRequest);
      // This line sends a response to the client.
      return res.json({
        success: true,
        message: "Project request rejected successfully",
        notifications: supervisor.notifications,
        requests: supervisor.projectRequest,
      });
    }
  } catch (err) {
    console.error("Error accepting project request:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Supervisor.findById(req.user.id).populate({
      path: "groups",
      populate: [
        {
          path: "supervisor",
          select: "name email department designation slots",
        },
        { path: "project", select: "title description scope" },
        {
          path: "students",
          select: "name email rollNo batch semester department",
        },
        { path: "deadlines" },
        {
          path: "submissions.proposal.submittedBy",
          select: "name email rollNo",
        },
        {
          path: "submissions.documentation.submittedBy",
          select: "name email rollNo",
        },
        {
          path: "viva",
        },
      ],
    });

    if (groups.groups || groups.groups.length > 0)
      return res.status(200).json({ success: true, groups: groups.groups });

    return res.status(404).json({ success: false, message: "No Groups Found" });
  } catch (error) {
    console.error("Error getting groups :", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports.makeAnncouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const supervisor = await Supervisor.findById(req.user.id);
    if (!supervisor.isCommittee)
      return res.status(505).json({
        success: false,
        message: "Only Committee Members can make announcement",
      });

    const announcement = new Announcement({ title, content });
    await announcement.save();
    return res
      .status(200)
      .json({ success: true, message: "Announcement made successfully" });
  } catch (error) {
    console.error("Error making announcement :", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports.reviewDocument = async (req, res) => {
  try {
    const { groupId, index } = req.params;
    const { review } = req.body;
    const supervisor = await Supervisor.findById(req.user.id);
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.docs[index]) {
      return res.json({ message: "invalid index" });
    }
    group.docs[index].review = review;
    group.students.map(async (stu) => {
      const studentObj = await Student.findById(stu);
      studentObj.notifications.unseen.push({
        type: "Important",
        message: `Reviews has been given by the supervisor to your document`,
      });
      await studentObj.save();
    });
    await group.save();
    console.log("revis is ", group);

    return res.json({ success: true, message: `Reviews Given Sucessfully` });
  } catch (error) {
    console.error("error in giving reviw", error);
    return res.json({ message: "Internal Server Error" });
  }
};

module.exports.setDeadline = async (req, res) => {
  try {
    const { submissionType, deadlineDate } = req.body;

    const supervisor = await Supervisor.findById(req.user.id);

    if (!supervisor || !supervisor.isCommittee) {
      return res.status(500).json({
        success: false,
        message: "Only A Committee Member can Set Deadline",
      });
    }

    if (!["proposal", "documentation"].includes(submissionType)) {
      return res.status(400).json({ message: "Invalid submission type" });
    }

    let deadline =
      (await Deadline.findOne()) || new Deadline({ deadlines: {} });

    const isDeadlineValid = (type, requiredType) => {
      if (requiredType && !deadline.deadlines[requiredType]) {
        return res.status(400).json({
          message: `${
            requiredType.charAt(0).toUpperCase() + requiredType.slice(1)
          } deadline must be set first`,
        });
      }
      if (
        deadline.deadlines[type] &&
        new Date(deadline.deadlines[requiredType]) > new Date()
      ) {
        return res.status(400).json({
          message: `${
            requiredType.charAt(0).toUpperCase() + requiredType.slice(1)
          } deadline has not passed yet`,
        });
      }
      return true;
    };

    const extendOrSetDeadline = (type) => {
      const existingDeadline = deadline.deadlines[type];

      if (existingDeadline && new Date(existingDeadline) > new Date()) {
        return res.status(400).json({
          message: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } deadline is not expired yet, cannot be extended`,
        });
      }

      if (deadline.deadlines[type]) {
        deadline.deadlines[type] = deadlineDate;
      } else {
        deadline.deadlines[type] = deadlineDate;
      }
    };

    const submissionTypes = {
      proposal: () => {
        if (
          deadline.deadlines.proposal &&
          new Date(deadline.deadlines.proposal) > new Date()
        ) {
          return res.status(400).json({
            message: "Proposal deadline is already set and has not passed yet",
          });
        }
        deadline.deadlines.proposal = deadlineDate;
      },
      documentation: () => {
        if (!isDeadlineValid("documentation", "proposal")) return;
        if (
          deadline.deadlines.documentation &&
          new Date(deadline.deadlines.documentation) > new Date()
        ) {
          return res.status(400).json({
            message:
              "Documentation deadline is already set and has not passed yet",
          });
        }

        if (
          deadline.deadlines.proposal &&
          new Date(deadline.deadlines.proposal) > new Date()
        ) {
          return res.status(400).json({
            message:
              "Proposal deadline has not passed yet, cannot set Documentation deadline",
          });
        }

        extendOrSetDeadline("documentation");
      },
    };

    if (submissionTypes[submissionType]) {
      submissionTypes[submissionType]();
    } else {
      return res.status(400).json({ message: "Invalid submission type" });
    }

    deadline.supervisor = req.user.id;

    await deadline.save();

    // **Create an Announcement**
    const announcement = new Announcement({
      title: `Deadline Announced for ${
        submissionType.charAt(0).toUpperCase() + submissionType.slice(1)
      }`,
      content: `The deadline for ${submissionType} has been set to ${new Date(
        deadlineDate
      ).toLocaleString()}. Please make sure to submit your work before this deadline.`,
    });

    await announcement.save();

    const notifyUsers = async () => {
      // send notifications to students
      const students = await Student.find({}).populate("group");
      if (students && students.length > 0) {
        students.forEach(async (student) => {
          student.notifications.unseen.push({
            message: `Deadline Announced for ${
              submissionType.charAt(0).toUpperCase() + submissionType.slice(1)
            } ${new Date(deadlineDate).toLocaleString()}`,
            type: "Important",
          });

          if (student.group) {
            await Group.findByIdAndUpdate(student.group._id, {
              $set: { deadlines: deadline._id },
            });
          }

          await student.save();
        });
      }

      // notify supervisors
      const supervisors = await Supervisor.find({});
      if (supervisors && supervisors.length > 0) {
        supervisors.forEach(async (supervisor) => {
          supervisor.notifications.unseen.push({
            message: `Deadline Announced for ${
              submissionType.charAt(0).toUpperCase() + submissionType.slice(1)
            } ${new Date(deadlineDate).toLocaleString()}`,
            type: "Important",
          });
          supervisor.deadlines = deadline._id;
          await supervisor.save();
        });
      }
    };

    notifyUsers();

    res.status(200).json({
      success: true,
      message: `${
        submissionType.charAt(0).toUpperCase() + submissionType.slice(1)
      } deadline set successfully`,
      deadline,
      announcement,
    });
  } catch (error) {
    console.log("error in setting deadline ", error);
    res.status(500).json({ success: false, messsage: "Internal Server Error" });
  }
};

module.exports.scheduleViva = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const { groupId, vivaDateTime, external } = req.body;

    // Check if viva already exists
    const existingViva = await Viva.findOne({ group: groupId });
    if (existingViva) {
      return res.status(400).json({
        success: false,
        message: "Viva has already been scheduled for this group",
      });
    }

    // Validate supervisor
    const supervisor = await Supervisor.findById(supervisorId);
    if (!supervisor || !supervisor.isCommittee) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Fetch group and validate
    const group = await Group.findById(groupId)
      .populate("supervisor")
      .populate("students")
      .populate("deadlines");

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    // Check if both proposal and documentation are submitted
    const { proposal, documentation } = group.submissions;
    const isEligible =
      proposal?.submitted &&
      proposal?.documentLink &&
      documentation?.submitted &&
      documentation?.documentLink;

    if (!isEligible) {
      return res.status(400).json({
        success: false,
        message: "Documentation or Proposal is pending",
      });
    }

    // Create and save viva
    const viva = new Viva({
      group: group._id,
      dateTime: vivaDateTime,
      external,
    });

    await viva.save();

    // Update group's viva reference
    group.viva = viva._id;
    await group.save();

    // Notify students of the group only
    const students = await Student.find({ group: groupId });
    const studentNotification = {
      message: `Your Viva has been scheduled on ${vivaDateTime}`,
      type: "Important",
    };

    await Promise.all(
      students.map((student) => {
        student.notifications.unseen.push(studentNotification);
        return student.save();
      })
    );

    // Notify supervisor
    const supervisorNotification = {
      message: `Viva has been scheduled for group "${group.title}" on ${vivaDateTime}`,
      type: "Important",
    };
    supervisor.notifications.unseen.push(supervisorNotification);
    await supervisor.save();

    return res
      .status(200)
      .json({ success: true, message: "Viva scheduled successfully" });
  } catch (error) {
    console.error("Error in scheduling viva:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
