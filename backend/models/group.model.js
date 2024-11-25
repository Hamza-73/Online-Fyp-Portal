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
    // docs: [{
    //     docLink: { type: String },
    //     review: { type: String },
    //     comment: { type: String },
    //     link: { type: String },
    // }],
});


module.exports = mongoose.model('Group', groupSchema);