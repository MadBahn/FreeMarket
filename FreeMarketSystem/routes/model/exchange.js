const mongoose = require('mongoose');

const exchangeSchema = mongoose.Schema({
    exchange_id: { type: String, unique: true },
    owner: { type: String },
    buyer: { type: String },
    addon: { type: String },
    goods: { type: String },
    price: { type: Number },
    pay: { type: String },
    isDone: { type: Boolean },
    post_date: { type: Date },
    isDel: { type: Boolean }
});

const exchangeModel = mongoose.model('exchangeModel',
    exchangeSchema,
    'exchange');

module.exports = exchangeModel;