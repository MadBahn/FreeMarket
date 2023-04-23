const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    message_id: { type: String, unique: true },
    receiver: { type: String },
    //商品、帖子、交易、账号
    type: { type: String },
    title: {type: String },
    content: { type: String },
    post_date: { type: Date }
});

const messageModel = mongoose.model('messageModel',
    messageSchema,
    'message');

module.exports = messageModel;