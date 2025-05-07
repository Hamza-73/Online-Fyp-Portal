const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  scope: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  supervisor: { type: Schema.Types.ObjectId, ref: "Supervisor" },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", projectSchema);
