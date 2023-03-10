const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    message_id: { type: String, unique: true },
    sender: { type: String },
    receiver: { type: String },
    post_date: { type: Date }
});

const messageModel = mongoose.model('messageModel',
    messageSchema,
    'message');

module.exports = messageModel;