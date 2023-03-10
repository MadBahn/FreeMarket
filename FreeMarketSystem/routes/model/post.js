const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    post_id: { type: String, unique: true },
    post_by: { type: String },
    title: { type: String },
    content: { type: String },
    imgs: { type: Array },
    post_date: { type: Date },
    isDel: { type: Boolean }
});

const postModel = mongoose.model('postModel',
    postSchema,
    'post');

module.exports = postModel;