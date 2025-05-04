const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vivaSchema = new Schema({
  group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  dateTime: { type: Date },
  external: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
});

module.exports = mongoose.model("Viva", vivaSchema);
