const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Student = require('../models/student.model.js');
const Supervisor = require('../models/supervisor.model.js');
const Admin = require('../models/admin.model.js'); // Assuming you have a User model
const Project = require('../models/project.model.js');
const Group = require('../models/group.model.js');
const XLSX = require('xlsx');
const cloudinary = require('cloudinary').v2;
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        console.log(file)
        cb(null, file.originalname)
    }
})

module.exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find();
        return res.json({ message: 'Students Fteched successful', success: true, students });
    } catch (error) {

    }
};

module.exports.registerFromFile = async (req, res) => {
    if (!req.files || !req.files.excelFile) {
        return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }

    const excelFile = req.files.excelFile;

    try {
        // Read the file directly from the buffer (excelFile.data)
        const workbook = XLSX.read(excelFile.data, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        console.log("Sheet names:", workbook.SheetNames);
        const sheet = workbook.Sheets[sheetName];
        console.log("Raw sheet data:", sheet);

        const excelData = XLSX.utils.sheet_to_json(sheet);
        console.log("Parsed excel data:", excelData);


        // To check for unique email and rollNo
        const uniqueEmails = new Set();
        const uniqueRollNos = new Set();

        // Array to store newly created students
        const newStudents = [];

        console.log("excel data is ", excelData)

        // Iterate over the data to validate and process each student
        for (let i = 0; i < excelData.length; i++) {
            const student = excelData[i];

            // Validate name
            if (!student.name || student.name.length < 3) {
                return res.status(400).json({ success: false, message: `Name must be at least 3 characters for student at row ${i + 1}` });
            }

            // Validate rollNo format
            if (!student.rollNo || !/^\d{4}(-RE-R)?(-R)?-BSCS-\d{2}$/.test(student.rollNo)) {
                return res.status(400).json({ success: false, message: `Invalid rollNo format for student at row ${i + 1}` });
            }

            // Check for duplicate rollNo in the file
            if (uniqueRollNos.has(student.rollNo)) {
                return res.status(400).json({ success: false, message: `Duplicate rollNo found in row ${i + 1}: ${student.rollNo}` });
            }
            uniqueRollNos.add(student.rollNo);

            // Validate email format using regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!student.email || !emailRegex.test(student.email)) {
                return res.status(400).json({ success: false, message: `Invalid email format for student at row ${i + 1}` });
            }

            // Check for duplicate email in the file
            if (uniqueEmails.has(student.email)) {
                return res.status(400).json({ success: false, message: `Duplicate email found in row ${i + 1}: ${student.email}` });
            }
            uniqueEmails.add(student.email);

            // Validate batch format
            if (!student.batch || !/^\d{4}-\d{4}$/.test(student.batch)) {
                return res.status(400).json({ success: false, message: `Invalid batch format for student at row ${i + 1}` });
            }

            // Validate CNIC format
            if (!student.cnic || !/^\d{13}$/.test(student.cnic.toString())) {
                return res.status(400).json({ success: false, message: `CNIC must be exactly 13 digits for student at row ${i + 1}` });
            }

            // Check if the student already exists in the database
            const isValid = await Student.findOne({
                $or: [{ email: student.email }, { rollNo: student.rollNo }]
            });
            if (isValid) {
                return res.status(400).json({ success: false, message: `Student with email/rollNo already exists in the database at row ${i + 1}.` });
            }

            // Hash the password before storing it in the database
            // const salt = await bcrypt.genSalt(10);
            // const hashedPassword = await bcrypt.hash(student.cnic.toString(), salt);

            // Prepare the student object
            const newStudent = new Student({
                name: student.name,
                rollNo: student.rollNo,
                email: student.email,
                father: student.father,
                batch: student.batch,
                semester: student.semester,
                cnic: student.cnic,
                password: student.cnic,
                department: student.department,
                notifications: student.notifications || { seen: [], unseen: [] },
                marks: student.marks || { externalMarks: 0, internalMarks: 0, hodMarks: 0 },
                requests: student.requests || { receivedRequests: [], pendingRequests: [], rejectedRequests: [] }
            });

            // Save student to the database
            await newStudent.save();

            // Add the newly created student to the array
            newStudents.push(newStudent);
        }

        return res.json({ success: true, message: 'File uploaded and students registered successfully.', newStudents });
    } catch (error) {
        console.error('Error occurred while processing data:', error);
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports.profile = async (req, res) => {
    try {
        // Assuming `req.user` contains the decoded token data, including the admin ID
        const id = req.user.id;  // Extract the user ID from the token

        // Fetch the admin profile based on the ID from the token
        const studentData = await Student.findById(id);

        if (!studentData) {
            return res.status(404).json({ message: 'Student not found', success: false });
        }

        const student = { ...studentData._doc };
        delete student.password;

        return res.json({ message: 'Student Profile', success: true, student });
    } catch (error) {
        console.error('Error fetching student profile:', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

module.exports.getProfile = async (req, res) => {
    try {
        const adminId = req.user.id; // Assuming the admin's ID is available from req.user after authentication
        const studentId = req.params.id; // Get student ID from URL params

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
        const student = await Student.findById(studentId).select('-password');

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // If everything is fine, return the student profile
        return res.status(200).json({ success: true, student });
    } catch (error) {
        console.error("Error fetching student profile:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


module.exports.editStudentProfile = [
    // Optional validation for fields to be updated
    body('email').optional().isEmail().withMessage('Enter a valid email address'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('rollNo')
        .optional().matches(/^\d{4}(-RE-R)?(-R)?-BSCS-\d{2}$/)
        .withMessage('Roll number format is invalid')
    ,
    body('batch').optional().matches(/^\d{4}-\d{4}$/).withMessage('Batch must be in the format XXXX-XXXX'),
    body('semester')
        .optional().isNumeric().withMessage('Semester must be a number')
        .isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8')
    ,
    body('cnic').optional().isLength({ min: 13, max: 13 }).withMessage('CNIC must be exactly 13 digits'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('department').optional().notEmpty().withMessage('Department is required'),

    // Controller logic
    async (req, res) => {
        const { id } = req.params; // Student ID to be edited
        const { password, email } = req.body; // Fields to be updated

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Fetch student and admin details
            const [studentToEdit, loggedInAdmin] = await Promise.all([
                Student.findById(id),
                Admin.findById(req.user.id)
            ]);

            // Check if both the student and admin exist
            if (!studentToEdit) return res.status(404).json({ message: 'Student not found' });
            if (!loggedInAdmin) return res.status(404).json({ message: 'Logged-in admin not found' });

            // Determine if the logged-in user is the owner or an authorized admin
            const isOwner = studentToEdit._id.equals(req.user.id);
            const isAdmin = loggedInAdmin.superAdmin || loggedInAdmin.write_permission;

            // Only allow the owner to edit their email and password, or admin to edit any detail
            if (!isOwner && !isAdmin) {
                return res.status(403).json({ message: 'You do not have permission to edit this student\'s profile.' });
            }

            // Update fields based on permissions
            if (isOwner) {
                // Only allow email and password to be updated by the owner
                if (email) studentToEdit.email = email.trim();
                if (password) {
                    const salt = await bcrypt.genSalt(10);
                    studentToEdit.password = await bcrypt.hash(password, salt);
                }
            } else if (isAdmin) {
                // Allow admin to update all fields
                if (email) studentToEdit.email = email.trim();
                if (password) {
                    const salt = await bcrypt.genSalt(10);
                    studentToEdit.password = await bcrypt.hash(password, salt);
                }
                // Update other fields (add any additional fields if needed)
                const allowedFields = ['name', 'father', 'rollNo', 'batch', 'semester', 'cnic', 'department'];
                allowedFields.forEach(field => {
                    if (req.body[field]) {
                        studentToEdit[field] = req.body[field];
                    }
                });
            }

            // Save the updated student data
            await studentToEdit.save();

            res.json({ success: true, message: 'Student profile updated successfully', student: studentToEdit });

        } catch (err) {
            console.error('Error updating student profile:', err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
];

module.exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params; // Destructure id from req.params
        const adminId = req.user.id;
        const student = await Student.findById(id);

        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(401).json({ message: 'Unauthorized', success: false });
        }

        // Check if the admin is a super admin
        if (!admin.superAdmin || !admin.write_permission) {
            return res.status(403).json({ message: 'Super admin cannot be deleted', success: false });
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found', success: false });
        }


        // Proceed to delete if found and not a super admin
        await Student.findByIdAndDelete(id);
        return res.json({ message: 'Student deleted successfully', success: true });

    } catch (error) {
        console.error('Error deleting student:', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

module.exports.sendProjectRequest = async (req, res) => {
    const { projectTitle, description, scope } = req.body;
    const { supervisorId } = req.params;

    try {
        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        // Ensure requests is an object
        if (!student.requests || typeof student.requests !== 'object') {
            student.requests = {
                receivedRequests: [],
                pendingRequests: [],
                rejectedRequests: []
            };
        }

        if (student.isGroupMember) {
            return res.status(500).json({ success: false, message: 'You are already in a group' });
        }

        //check the limit of requests send
        if (student.requests.pendingRequests.length >= 2) {
            return res.status(500).json({ success: false, message: "You can only send request to 2 supervisors at a time" });
        }

        const supervisor = await Supervisor.findById(supervisorId);
        if (!supervisor) return res.status(404).json({ success: false, message: 'Supervisor not found' });
        if (supervisor.slots <= 0) return res.status(500).json({ success: false, message: 'Supervisor slots are full' });

        // check if supervisor has already rejected request
        if (student.requests.rejectedRequests.some(req => req.equals(supervisor._id))) {
            return res.status(500).json({ success: false, message: "You cannot send a request to this supervisor as he rejected your request before." });
        }

        if (student.requests.pendingRequests.some(req => req.equals(supervisor._id))) {
            return res.status(400).json({ success: false, message: 'Request already sent to this supervisor' });
        }

        const existingProject = await Project.findOne({ projectTitle });
        if (existingProject) {
            return res.status(500).json({ success: false, message: "Request with this project Title already exists" });
        }

        //push student id in students array
        const students = [];
        students.push(req.user.id)

        const projectRequest = new Project({ title: projectTitle, description, students, scope, status: 'pending' });
        student.requests.pendingRequests.push(supervisor._id);
        student.notifications.unseen.push({ type: "Important", message: `Project request sent to ${supervisor.name}` });
        console.log("prohect id is ", projectRequest._id)
        supervisor.projectRequest.push({
            isAccepted: false,
            project: projectRequest._id,
            student: req.user.id,
            createdAt: Date.now()
        });
        supervisor.notifications.unseen.push({ type: "Important", message: `A new proposal for ${projectTitle}` });

        await Promise.all([student.save(), supervisor.save(), projectRequest.save()]);

        return res.json({ success: true, message: `Project request sent to ${supervisor.name}` });

    } catch (err) {
        console.error('Error sending request:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports.requestToJoinGroup = async (req, res) => {
    const { groupId } = req.params;

    try {
        // Find the student making the request
        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        if (student.isGroupMember) {
            return res.status(400).json({ success: false, message: "You're already in a Group" });
        }

        if (student.requests.pendingRequests.length >= 2) {
            return res.status(400).json({ success: false, message: `You can only send to 2 supervisors at a time` })
        }

        // Find the group and its supervisor
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

        const supervisor = await Supervisor.findById(group.supervisor);
        if (!supervisor) return res.status(404).json({ success: false, message: 'Supervisor not found' });

        // Check if the supervisor has previously rejected the student
        if (student.requests.rejectedRequests.some(request => request.equals(supervisor._id))) {
            return res.status(400).json({ success: false, message: "You cannot send a request to this supervisor as they rejected your request before." });
        }

        // Check if the group is already filled
        if (group.students.length >= 3) {
            return res.status(400).json({ success: false, message: 'The Group is already filled' });
        }

        // Check if the student has already sent a request to this supervisor
        if (student.requests.pendingRequests.some(request => request.equals(supervisor._id))) {
            return res.status(400).json({ success: false, message: "You've already sent a request to this supervisor" });
        }

        // Add notifications and update pending requests
        const notificationMessage = `${student.name} has requested to join the group: ${group.title}`;
        supervisor.notifications.unseen.push({ type: 'Important', message: notificationMessage });
        supervisor.projectRequest.push({ project: group.project, student: student._id });

        student.requests.pendingRequests.push(supervisor._id);
        student.notifications.unseen.push({
            type: 'Important',
            message: `You've sent a request to ${supervisor.name} to join the group: ${group.title}`
        });

        // Save changes
        await Promise.all([supervisor.save(), student.save()]);

        res.json({ success: true, message: `Request sent to ${supervisor.name} for ${group.title}` });
    } catch (err) {
        console.error('Error sending join request:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports.getSupervisorDetail = async (req, res) => {
    try {
        const { supervisorId } = req.params;

        // Find the supervisor and populate groups and students
        const supervisor = await Supervisor.findById(supervisorId)
            .select('name designation department slots groups') // Select only groups field
            .populate({
                path: 'groups', // Populate the groups field
                select: 'title', // Select only the title of the group
                populate: {
                    path: 'students', // Nested population for students
                    select: 'name batch rollNo', // Select required student fields
                },
            });

        // If supervisor is not found, return 404
        if (!supervisor) {
            return res.status(404).json({ success: false, message: 'Supervisor not found' });
        }

        // Map the groups to include only the desired data
        const groups = supervisor.groups.map(group => ({
            title: group.title,
            students: group.students.map(student => ({
                name: student.name,
                batch: student.batch,
                rollNo: student.rollNo,
            })),
        }));

        return res.status(200).json({
            success: true,
            supervisor,
            groups, // Respond with only group titles and student details
        });
    } catch (error) {
        console.error('Error fetching supervisor details:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

module.exports.myGroup = async (req, res) => {
    try {
        // Ensure req.user is not null or undefined before accessing req.user.id
        if (!req.user || !req.user.id) {
            return res.status(400).json({ success: false, message: 'User not authenticated' });
        }

        // Find the student by ID, populate the group and all referenced fields (supervisor, project, students)
        const student = await Student.findById(req.user.id).populate({
            path: 'group', // Populate the group field
            populate: [
                { path: 'supervisor', select: 'name email department designation slots' },
                { path: 'project', select: 'title description scope' },
                { path: 'students', select: 'name email rollNo batch semester department' },
                { path: 'deadlines' },
                { 
                    path: 'submissions.proposal.submittedBy', 
                    select: 'name email rollNo' 
                },
                { 
                    path: 'submissions.documentation.submittedBy', 
                    select: 'name email rollNo' 
                },
                { 
                    path: 'submissions.project.submittedBy', 
                    select: 'name email rollNo' 
                },
            ]
        });
        

        // console.log("group is ", student.group);

        // Return the group data if found
        if (!student || !student.group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        res.json({ success: true, group: student.group });
    } catch (error) {
        // Log the error message for debugging
        console.error('Error retrieving group:', error);

        // Send a generic server error message to the client
        res.status(500).json({ success: false, message: 'Server error, try refreshing or logging in again' });
    }
};

module.exports.uploadDocument = async (req, res) => {
    try {
        const { comment, webLink } = req.body;
        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ error: 'Student Not Found' });

        const group = await Group.findById(student.group);
        if (!group) return res.status(404).json({ success: false, message: 'Group Not Found' });

        let docLink = "";

        if (req.files?.doc) {
            try {
                const result = await cloudinary.uploader.upload(req.files.doc.tempFilePath);
                docLink = result.secure_url;  // Use `secure_url` for a valid HTTPS link
                // console.log("Upload result:", result);
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                return res.status(500).json({ success: false, message: "Error uploading document" });
            }
        }

        if (!docLink && !webLink) {
            return res.status(400).json({ success: false, message: "Either a document or web link must be provided" });
        }

        group.docs = group.docs || [];
        group.docs.push({
            docLink,
            review: "",
            comment: comment || "",
            webLink: webLink || ""
        });

        await group.save();

        const notifyUsers = async (users, message) => {
            await Promise.all(users.map(async (stu) => {
                const studentObj = await Student.findById(stu);
                if (studentObj) {
                    studentObj.notifications = studentObj.notifications || { seen: [], unseen: [] };
                    studentObj.notifications.unseen.push({ type: "Important", message });
                    await studentObj.save();
                }
            }));
        };

        await notifyUsers(group.students, `Document has been uploaded`);

        const supervisor = await Supervisor.findById(group.supervisor);
        if (supervisor) {
            supervisor.notifications = supervisor.notifications || { seen: [], unseen: [] };
            supervisor.notifications.unseen.push({
                type: "Reminder",
                message: `A document has been uploaded by group: ${group.title}`,
            });
            await supervisor.save();
        }

        return res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            doc: { webLink: webLink || "", comment: comment || "", docLink }
        });

    } catch (error) {
        console.error('Error uploading document:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports.uploadProjectSubmission = async (req, res) => {
    try {
        let { submissionType, webLink } = req.body;

        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ error: 'Student Not Found' });

        const group = await Group.findById(student.group).populate('deadlines');
        if (!group) return res.status(404).json({ success: false, message: 'Group Not Found' });

        // Ensure submissions object exists
        if (!group.submissions) {
            group.submissions = {};
        }

        // Ensure submissionType exists within submissions
        if (!group.submissions[submissionType]) {
            group.submissions[submissionType] = {
                submitted: false,
                submittedAt: null,
                submittedBy: null,
                documentLink: "",
                webLink: "",
            };
        }

        const { proposal, documentation, project } = group.deadlines?.deadlines || {};
        const checkDeadline = (deadlineDate) => new Date(deadlineDate) < new Date();

        if (
            (submissionType.toLowerCase() === 'proposal' && proposal && checkDeadline(proposal)) ||
            (submissionType.toLowerCase() === 'documentation' && documentation && checkDeadline(documentation)) ||
            (submissionType.toLowerCase() === 'project' && project && checkDeadline(project))
        ) {
            return res.status(400).json({ success: false, message: `${submissionType.charAt(0).toUpperCase() + submissionType.slice(1)} deadline has passed.` });
        }

        if (req.files?.doc) {
            try {
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(req.files.doc.tempFilePath);
                const docLink = result.secure_url;
                console.log("Cloudinary upload result:", docLink);

                // Update the submission in the group object
                group.submissions[submissionType].documentLink = docLink;
                group.submissions[submissionType].submittedAt = new Date();
                group.submissions[submissionType].submittedBy = student.id;
                group.submissions[submissionType].submitted = true;
                group.submissions[submissionType].webLink = webLink || "";

                // Mark the submissions field as modified
                group.markModified(`submissions.${submissionType}`);

                // Save the updated group
                await group.save();

                console.log("Updated group submission:", group.submissions[submissionType]);

                // Notify students
                await Promise.all(group.students.map(async (stuId) => {
                    const studentObj = await Student.findById(stuId);
                    if (studentObj) {
                        studentObj.notifications = studentObj.notifications || { seen: [], unseen: [] };
                        studentObj.notifications.unseen.push({ type: "Important", message: `${submissionType.charAt(0).toUpperCase() + submissionType.slice(1)} has been uploaded by ${student.name}` });
                        await studentObj.save();
                    }
                }));

                // Notify supervisor
                const supervisor = await Supervisor.findById(group.supervisor);
                if (supervisor) {
                    supervisor.notifications = supervisor.notifications || { seen: [], unseen: [] };
                    supervisor.notifications.unseen.push({
                        type: "Reminder",
                        message: `${submissionType.charAt(0).toUpperCase() + submissionType.slice(1)} has been uploaded by ${student.name} for group: ${group.title}`
                    });
                    await supervisor.save();
                }

                // Respond with success
                return res.status(201).json({
                    success: true,
                    message: `${submissionType.charAt(0).toUpperCase() + submissionType.slice(1)} uploaded successfully`,
                    doc: { webLink: webLink || "", docLink }
                });

            } catch (error) {
                console.error("Cloudinary upload error:", error);
                return res.status(500).json({ success: false, message: "Error uploading document" });
            }
        } else {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

    } catch (error) {
        console.error('Error uploading document:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
