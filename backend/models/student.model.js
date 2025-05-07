const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{4}(-RE-R)?(-R)?-BSCS-\d{2}$/,
  },
  email: {
    type: String,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: "Invalid email format",
    },
  },
  father: {
    type: String,
    required: true,
    minlength: 3,
  },
  batch: {
    type: String,
    required: true,
    match: /^\d{4}-\d{4}$/,
    message: "Batch must be in the format XXXX-XXXX",
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
      validator: (cnic) => /^\d{13}$/.test(cnic.toString()),
      message: "CNIC must be exactly 13 digits",
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
  notifications: {
    seen: { type: Array, default: [] },
    unseen: { type: Array, default: [] },
  },
  supervisor: { type: Schema.Types.ObjectId, ref: "Supervisor" },
  group: { type: Schema.Types.ObjectId, ref: "Group" },
  projectRequests: [{ type: Schema.Types.ObjectId, ref: "ProjectRequest" }],
  marks: {
    externalMarks: { type: Number, default: 0 },
    internalMarks: { type: Number, default: 0 },
    hodMarks: { type: Number, default: 0 },
  },
  isGroupMember: { type: Boolean, default: false },
  requests: {
    receivedRequests: { type: Array, default: [] }, // Fixed typo here
    pendingRequests: [
      { type: Schema.Types.ObjectId, ref: "Supervisor", default: [] },
    ],
    rejectedRequests: [
      { type: Schema.Types.ObjectId, ref: "Supervisor", default: [] },
    ],
  },
});

// Pre-save hook to hash the password before saving
studentSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Student", studentSchema);
