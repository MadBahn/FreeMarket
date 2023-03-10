const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
    history_id: { type: String, unique: true },
    viewer: { type: String },
    history_to: { type: String },
    post_date: { type: Date }
});

const historyModel = mongoose.model('historyModel',
    historySchema,
    'history');

module.exports = historyModel;