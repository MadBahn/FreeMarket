const mongoose = require('mongoose');

const goodsSchema = mongoose.Schema({
    goods_id : { type: String, unique: true },
    owner: { type: String },
    goods_name: { type: String },
    desc: { type: String },
    price: { type: Number },
    status: { type: String },
    imgs: { type: Array },
    post_date: { type: Date },
    isDel: { type: Boolean }
});

const goodsModel = mongoose.model('goodsModel',
    goodsSchema,
    'goods');

module.exports = goodsModel;