const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vivaSchema = new Schema({
  group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  dateTime: { type: Date },
  external: { type: Schema.Types.ObjectId, ref: "External", required: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
});

module.exports = mongoose.model("Viva", vivaSchema);
