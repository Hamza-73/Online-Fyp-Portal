const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const extensionSchema = new Schema({
  group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  reason: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

module.exports = mongoose.model("ExtensionRequest", extensionSchema);
