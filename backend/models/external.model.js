const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Add bcrypt for hashing
const Schema = mongoose.Schema;

const externalSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    phone: { type: String, required: true },
});

module.exports = mongoose.model('External', externalSchema);
