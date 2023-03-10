const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    comment_id: { type: String, unique: true },
    comment_by: { type: String },
    comment_to: { type: String },
    content: { type: String },
    post_date: { type: Date },
    isDel: { type: Boolean }
});

const commentModel = mongoose.model('commentModel',
    commentSchema,
    'comment');

module.exports = commentModel;