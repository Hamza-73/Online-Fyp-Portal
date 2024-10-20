const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Student = require('../models/student.model.js');
const Admin = require('../models/admin.model.js'); // Assuming you have a User model

module.exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find();
        return res.json({ message: 'Students Fteched successful', success: true, students });
    } catch (error) {

    }
}

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
            res.status(500).json({ message: 'Internal server error' });
        }
    }
];

