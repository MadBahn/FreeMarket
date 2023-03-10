const mongoose = require('mongoose');

const blacklistSchema = mongoose.Schema({
    black_id: { type: String, unique: true },
    refer_to: { type: String },
});

const blacklistModel = mongoose.model('blacklistModel',
    blacklistSchema,
    'blacklist');

module.exports = blacklistModel;