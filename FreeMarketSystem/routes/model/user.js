const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userid: { type: String, unique: true },
    username: { type: String, unique: true },
    headImg: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    gender: { type: String },
    birthday: { type: Date },
    city: { type: String },
    desc: { type: String },
    isDel: { type: Boolean }
});

const userModel = mongoose.model('userModel',
    userSchema,
    'user');

module.exports = userModel;