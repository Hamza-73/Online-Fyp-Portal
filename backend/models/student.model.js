const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3, // Minimum length of 3 characters
    },
    rollNo: {
        type: String,
        required: true,
        unique: true,
        match: /^\d{4}(-RE-R)?(-R)?-BSCS-\d{2}$/, // Updated regex for roll number format
    },  
    email: {
        type: String,
        unique: true,
        validate: {
            validator: (email) => validator.isEmail(email), // Validates if it's a valid email
            message: 'Invalid email format',
        },
    },
    father: {
        type: String,
        required: true,
        minlength: 3, // Minimum length of 3 characters
    },
    batch: {
        type: String,
        required: true,
        match: /^\d{4}-\d{4}$/, // Ensures batch follows the XXXX-XXXX format
        message: 'Batch must be in the format XXXX-XXXX',
    },
    semester: {
        type: Number,
        required: true,
    },
    cnic: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: (cnic) => /^\d{13}$/.test(cnic.toString()), // Ensures it's 13 digits
            message: 'CNIC must be exactly 13 digits',
        },
    },
    password: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    seenNotifications: {
        type: Array,
        default: []
    },
    unseenNotifications: {
        type: Array,
        default: []
    },

    // supervisor: { type: Schema.Types.ObjectId, ref: 'Supervisor' }, // Reference to the Supervisor model

    // group: { type: Schema.Types.ObjectId, ref: 'Group' },

    marks: {
        externalMarks: { type: Number, default: 0 },
        internalMarks: { type: Number, default: 0 },
        hodMarks: { type: Number, default: 0 },
    },
    // isMember: { type: Boolean, default: false },

    // Separate fields for different deadlines and submission dates
    deadlines: {
        proposalSubmission: { type: Date },
        documentationSubmission: { type: Date },
        projectSubmission: { type: Date },
    },
    submissions: {
        proposalSubmitted: { type: Date },
        documentationSubmitted: { type: Date },
        projectSubmitted: { type: Date },
    },

    // viva: { type: Schema.Types.ObjectId, ref: 'Viva' },

    requests: { type: Array, default: [] },
    // pendingRequests: [{ type: Schema.Types.ObjectId, ref: 'Supervisor' }],
    // rejectedRequest: [{ type: Schema.Types.ObjectId, ref: 'Supervisor' }]
});

// Pre-save hook to hash the password before saving
studentSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            // Generate salt and hash the password
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next(); // Continue if password is not modified
    }
});

module.exports = mongoose.model('Student', studentSchema);
