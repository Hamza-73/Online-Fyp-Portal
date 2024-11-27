const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Student = require('../models/student.model.js');
const Supervisor = require('../models/supervisor.model.js');
const Admin = require('../models/admin.model.js'); // Assuming you have a User model
const Group = require('../models/group.model.js'); // Assuming you have a User model
const Project = require('../models/project.model.js'); // Assuming you have a User model

module.exports.getSupervisors = async (req, res) => {
  try {
    const supervisors = await Supervisor.find();
    return res.json({ message: 'Students Fteched successful', success: true, supervisors });
  } catch (error) {

  }
}

module.exports.profile = async (req, res) => {
  try {
    // Assuming `req.user` contains the decoded token data, including the admin ID
    const id = req.user.id;  // Extract the user ID from the token

    // Fetch the supervisor profile based on the ID from the token
    const supervisorData = await Supervisor.findById(id);

    if (!supervisorData) {
      return res.status(404).json({ message: 'Supervisor not found', success: false });
    }

    const supervisor = { ...supervisorData._doc };
    delete supervisor.password;

    return res.json({ message: 'Supervisor Profile', success: true, supervisor });
  } catch (error) {
    console.error('Error fetching supervisor profile:', error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
};

module.exports.getProfile = async (req, res) => {
  try {
    const adminId = req.user.id; // Assuming the admin's ID is available from req.user after authentication
    const supervisorId = req.params.id; // Get student ID from URL params

    // Fetch the admin details to check for permission
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized: Admin not found" });
    }

    // Check if admin is SuperAdmin or has write permission
    if (!admin.superAdmin || !admin.write_permission) {
      return res.status(403).json({ success: false, message: "Access denied: You do not have the required permissions" });
    }

    // Fetch the student details by ID, excluding the password field
    const supervisor = await Supervisor.findById(supervisorId).select('-password');

    if (!supervisor) {
      return res.status(404).json({ success: false, message: "Supervisor not found" });
    }

    // If everything is fine, return the student profile
    return res.status(200).json({ success: true, supervisor });
  } catch (error) {
    console.error("Error fetching supervisor profile:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


module.exports.editSupervisorProfile = [
  body('name').optional().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Enter a valid email address'),
  body('cnic').optional().isLength({ min: 13, max: 13 }).withMessage('CNIC must be exactly 13 digits'),

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
        return res.status(404).json({ success: false, message: 'Supervisor not found' });
      }

      // Check if the logged-in user is the supervisor or an admin
      const isOwner = supervisorToEdit._id.equals(req.user.id);

      let isAdmin = false;
      let loggedInAdmin = null;

      // Fetch admin details only if the user is not the supervisor (optimization)
      if (!isOwner) {
        loggedInAdmin = await Admin.findById(req.user.id);
        if (!loggedInAdmin) {
          return res.status(403).json({ success: false, message: 'You do not have permission to edit this supervisor\'s profile.' });
        }
        isAdmin = loggedInAdmin.superAdmin || loggedInAdmin.write_permission;
      }

      // If neither owner nor admin, deny access
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'You do not have permission to edit this supervisor\'s profile.' });
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

        Object.keys(req.body).forEach(field => {
          if (field !== 'password') {
            supervisorToEdit[field] = req.body[field];
          }
        });
      }

      await supervisorToEdit.save();
      res.json({ success: true, message: 'Supervisor profile updated successfully', supervisor: supervisorToEdit });

    } catch (err) {
      console.error('Error updating supervisor profile:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
];


module.exports.deleteSupervisor = async (req, res) => {
  try {
    const { id } = req.params; // Destructure id from req.params
    const adminId = req.user.id;
    const supervisor = await Supervisor.findById(id);

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized', success: false });
    }

    // Check if the admin is a super admin
    if (!admin.superAdmin || !admin.write_permission) {
      return res.status(403).json({ message: `You don't have permission to delete`, success: false });
    }

    if (!supervisor) {
      return res.status(404).json({ message: 'Student not found', success: false });
    }


    // Proceed to delete if found and not a super admin
    await Supervisor.findByIdAndDelete(id);
    return res.json({ message: 'Supervisor deleted successfully', success: true });

  } catch (error) {
    console.error('Error deleting Supervisor:', error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
};

module.exports.viewRequests = async (req, res) => {
  try {
    const id = req.user.id; // Get the supervisor ID from the request user

    // Find the supervisor and populate the required fields
    const supervisor = await Supervisor.findById(id)
      .populate({
        path: 'projectRequest.project', // Populate project details
        select: 'title description scope status', // Select specific fields
      })
      .populate({
        path: 'projectRequest.student', // Populate student details
        select: 'name rollNo semester department batch email', // Select specific fields
      });

    if (!supervisor) {
      return res.status(404).json({ success: false, message: "Supervisor not found" });
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
    console.error('Error fetching requests:', error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
};

module.exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const supervisorId = req.user.id;

    const supervisor = await Supervisor.findById(supervisorId).populate('projectRequest');
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const projectRequest = supervisor.projectRequest.find(request => request.project.equals(requestId));
    if (!projectRequest) {
      return res.status(404).json({ success: false, message: 'Project request not found' });
    }

    const project = await Project.findById(projectRequest.project);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if the project already has a supervisor
    if (project.supervisor && !project.supervisor.equals(supervisorId)) {
      const currentSupervisor = await Supervisor.findById(project.supervisor);
      return res.status(400).json({
        success: false,
        message: `Project is already supervised by ${currentSupervisor?.name || 'another supervisor'}`,
      });
    }

    const student = await Student.findById(projectRequest.student);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.isGroupMember) {
      return res.status(400).json({ success: false, message: 'Student is already in a group' });
    }

    // Remove the project request from supervisor
    supervisor.projectRequest = supervisor.projectRequest.filter(request => !request.student.equals(student._id));
    await supervisor.save();

    const existingGroup = await Group.findOne({ title: project.title, supervisor: supervisorId });
    if (existingGroup) {
      if (existingGroup.students.length >= 3) {
        return res.status(400).json({ success: false, message: 'The group is already full' });
      }

      //if group exists and it isn't full then add this student to the group
      existingGroup.students.push(student._id);
      project.students.push(student._id);
      student.group = existingGroup._id;
      student.isGroupMember = true;
      project.status = 'accepted';

      await Promise.all([existingGroup.save(), project.save(), student.save()]);
      supervisor.notifications.unseen.push({
        type: 'Important',
        message: `Added ${student.name} to your group for project: ${project.title}.`,
      });
      return res.json({ success: true, message: 'Request accepted and student added to the group.' });
    }

    // Create a new group if none exists
    if (supervisor.slots <= 0) {
      return res.status(400).json({ success: false, message: 'Your slots are full' });
    }

    const newGroup = new Group({
      title: project.title,
      description: project.description,
      scope: project.scope,
      supervisor: supervisor._id,
      project: project._id
    });

    newGroup.students.push(student._id);
    supervisor.groups.push(newGroup._id);

    student.group = newGroup._id;
    student.isGroupMember = true;
    project.students.push(student._id);
    project.supervisor = supervisor._id;
    project.status = 'accepted';

    supervisor.slots--;
    if (supervisor.slots === 0) {
      await Promise.all(
        supervisor.myIdeas.map(async idea => {
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
      type: 'Important',
      message: `${supervisor.name} accepted your proposal for ${project.title}.`,
    });

    await Promise.all([newGroup.save(), student.save(), supervisor.save(), project.save()]);
    return res.json({ success: true, message: 'Project request accepted and group created.' });

  } catch (err) {
    console.error('Error in accepting request:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const supervisorId = req.user.id;

    const supervisor = await Supervisor.findById(supervisorId).populate('projectRequest');
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const projectRequest = supervisor.projectRequest.find(request => request.project.equals(requestId));
    if (!projectRequest) {
      return res.status(404).json({ success: false, message: 'Project request not found' });
    }

    const project = await Project.findById(projectRequest.project);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if the project already has a supervisor
    if (project.supervisor && !project.supervisor.equals(supervisorId)) {
      const currentSupervisor = await Supervisor.findById(project.supervisor);
      return res.status(400).json({
        success: false,
        message: `Project is already supervised by ${currentSupervisor?.name || 'another supervisor'}`,
      });
    }

    const student = await Student.findById(projectRequest.student);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Remove the project request from student's pendingRequests array
    if (student) {
      // console.log('student is ', student);
      const updatedPendingRequests = student.requests.pendingRequests.filter(request => !request.equals(supervisor._id));
      student.requests.pendingRequests = updatedPendingRequests;
      console.log("project request ", supervisor.projectRequest)
      console.log("project request 2", requestId)
      const updateSupervisorRequests = supervisor.projectRequest.filter(request => !request.project.equals(requestId))
      console.log("request is ", updateSupervisorRequests)
      supervisor.projectRequest = updateSupervisorRequests;

      student.requests.rejectedRequests.push(supervisor._id);
      student.notifications.unseen.push({
        type: "Important",
        message: `${supervisor.name} rejected your request, You cannot send request to this supervisor Anymore.`
      });

      // Optionally, you can perform additional actions after the delete if needed.
      if (projectRequest && !projectRequest.supervisor) {
        await Project.findByIdAndDelete(requestId);
        // console.log('deleting');
      }
      await Promise.all([student.save(), supervisor.save()]);
      console.log("supervisor requests ", supervisor.projectRequest)
      // This line sends a response to the client.
      return res.json({ success: true, message: 'Project request rejected successfully' });
    }
  } catch (err) {
    console.error('Error accepting project request:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Supervisor.findById(req.user.id)
    .populate({
        path: 'groups',
        populate: {
            path: 'students', // This will populate the students in each group
            model: 'Student'  // Ensure the 'Student' model is correctly referenced
        }
    });


    if (groups.groups || groups.groups.length > 0) return res.status(200).json({ success: true, groups: groups.groups });

    return res.status(404).json({ success: false, message: 'No Groups Found' })
  } catch (error) {
    console.error('Error getting groups :', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}