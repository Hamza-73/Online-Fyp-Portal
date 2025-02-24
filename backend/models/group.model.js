const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    scope: { type: String, required: true },
    supervisor: { type: Schema.Types.ObjectId, ref: 'Supervisor' },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    createdAt: { type: Date, default: Date.now },
    marks: {
        externalMarks: { type: Number, default: 0 },
        internalMarks: { type: Number, default: 0 },
        hodMarks: { type: Number, default: 0 },
    },
    // deadlines: {
    //     proposalSubmission: { type: Date },
    //     documentationSubmission: { type: Date },
    //     projectSubmission: { type: Date },
    // },
    deadlines: { type: mongoose.Schema.Types.ObjectId, ref: "Deadline" },
    submissions: {
        proposal: {
            submitted: { type: Boolean, default: false },
            submittedAt: { type: Date, default: Date.now() },
            submittedBy: { type: Schema.Types.ObjectId, ref: 'Student' },
            documentLink: { type: String, default: "" },
            webLink: { type: String, default: "" }, // in case of external link
        },
        documentation: {
            submitted: { type: Boolean, default: false },
            submittedAt: { type: Date },
            submittedBy: { type: Schema.Types.ObjectId, ref: 'Student' },
            documentLink: { type: String, default: "" },
            webLink: { type: String, default: "" }, // in case of external link
        },
        project: {
            submitted: { type: Boolean, default: false },
            submittedAt: { type: Date },
            submittedBy: { type: Schema.Types.ObjectId, ref: 'Student' },
            documentLink: { type: String, default: "" },
            webLink: { type: String, default: "" }, // in case of external link
        },
    },
    docs: [{
        docLink: { type: String, default: "" },
        review: { type: String, default: "" },
        comment: { type: String, default: "" },
        webLink: { type: String, default: "" },
    }],
});


module.exports = mongoose.model('Group', groupSchema);