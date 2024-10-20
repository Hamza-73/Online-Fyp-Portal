const { body, validationResult } = require('express-validator');
const Admin = require('../models/admin.model.js'); // Adjust the import based on your project structure
const Student = require('../models/student.model.js'); // Adjust the import based on your project structure

module.exports.registerStudent = async (req, res) => {
    try {
        // Fetch the user details from the database using the ID from req.user
        const adminUser = await Admin.findById(req.user.id);

        // Check if the user exists and has admin permissions
        if (!adminUser || !(adminUser.superAdmin || adminUser.write_permission)) {
            return res.status(403).json({ message: 'You do not have permission to register students.', success: false });
        }

        // Validation logic using express-validator
        await body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long').run(req);
        await body('father').isLength({ min: 3 }).withMessage('Father\'s name must be at least 3 characters long').run(req);
        await body('email').isEmail().withMessage('Invalid email format').run(req);
        await body('rollNo')
            .matches(/^\d{4}(-RE-R)?(-R)?-BSCS-\d{2}$/)
            .withMessage('Roll number format is invalid')
            .run(req);
        await body('batch').matches(/^\d{4}-\d{4}$/).withMessage('Batch must be in the format XXXX-XXXX').run(req);
        await body('semester')
            .isNumeric().withMessage('Semester must be a number')
            .isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8')
            .run(req);
        await body('cnic').isLength({ min: 13, max: 13 }).withMessage('CNIC must be exactly 13 digits').run(req);
        await body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').run(req);
        await body('department').notEmpty().withMessage('Department is required').run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, father, email, rollNo, batch, department, cnic, semester, password } = req.body;

        // Check if email or CNIC already exists
        const existingStudent = await Student.findOne({ $or: [{ email }, { cnic },] });
        if (existingStudent) {
            return res.status(400).json({ message: 'Email or CNIC already exists' });
        }
        // Check if email or CNIC already exists
        const existingRollo = await Student.findOne({ rollNo });
        if (existingRollo) {
            return res.status(400).json({ message: 'Roll No already exists' });
        }

        // Create a new student instance
        const newStudent = new Student({
            name: name.trim(), father: father.trim(), email,
            rollNo, batch, department,
            cnic, semester, password, // Password will be hashed in the schema
        });

        // Save the new student to the database
        await newStudent.save();

        // Respond with success message
        res.status(201).json({ success: true, message: 'Student registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
