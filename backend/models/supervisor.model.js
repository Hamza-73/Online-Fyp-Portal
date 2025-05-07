const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Add bcrypt for hashing
const Schema = mongoose.Schema;

const supervisorSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    cnic: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^\d{13}$/.test(v); // Regex to ensure exactly 13 digits
            },
            message: props => `${props.value} is not a valid CNIC! CNIC must be exactly 13 digits.`
        }
    },
    email: { type: String, unique: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    slots: { type: Number, required: true, default: 0 },
    isCommittee: { type: Boolean, required: true, default: false },
    password: { type: String, required: true },
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }], // Store group IDs here
    projectRequest: [
        {
            isAccepted: { type: Boolean, default: false },
            project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
            student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    notifications: {
        seen: { type: Array, default: [] },
        unseen: { type: Array, default: [] }
    },
    deadlines: { type: mongoose.Schema.Types.ObjectId, ref: "Deadline" },
    myIdeas: [{
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        active: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    }],
});

// Pre-save middleware to hash the password
supervisorSchema.pre('save', async function (next) {
    const supervisor = this;

    // Only hash the password if it has been modified (or is new)
    if (!supervisor.isModified('password')) return next();

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        supervisor.password = await bcrypt.hash(supervisor.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Supervisor', supervisorSchema);
