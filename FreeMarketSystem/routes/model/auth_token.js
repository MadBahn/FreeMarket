const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
    token_id: { type: String, unique: true },
    valid_time: { type: Date }
});

const tokenModel = mongoose.model('tokenModel',
    tokenSchema,
    'auth_token');

module.exports = tokenModel;