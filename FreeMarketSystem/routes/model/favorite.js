const mongoose = require('mongoose');

const favoriteSchema = mongoose.Schema({
    favorite_id: { type: String, unique: true },
    favorite_by: { type: String },
    refer_to: { type: String },
    post_date: { type: Date }
});

const favoriteModel = mongoose.model('favoriteModel',
    favoriteSchema,
    'favorite');

module.exports = favoriteModel;