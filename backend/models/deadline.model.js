const mongoose = require("mongoose");

const deadlineSchema = new mongoose.Schema({
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "Supervisor", required: true },
    deadlines: {
        proposal: { type: Date, default: null },
        documentation: { type: Date, default: null },
        finalReport: { type: Date, default: null }
    },
    status: {
        proposal: { type: Boolean, default: false }, // Becomes true once the proposal deadline has passed
        documentation: { type: Boolean, default: false }, // Becomes true once the documentation deadline has passed
        finalReport: { type: Boolean, default: false } // Becomes true once the final report deadline has passed
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Deadline", deadlineSchema);
