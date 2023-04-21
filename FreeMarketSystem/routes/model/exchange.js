const mongoose = require('mongoose');

const exchangeSchema = mongoose.Schema({
    exchange_id: { type: String, unique: true },
    seller: { type: String },
    buyer: { type: String },
    addon: { type: String },
    goods: { type: String },
    //提供商品快照，以保证商品被删除时无法正常显示之问题
    goods_snapshot: { type: Object },
    desc: { type: String },
    price: { type: Number },
    pay: { type: String },
    status: { type: Number },
    //提供记录，以方便在前端渲染进度条
    //格式：{log_active: num, list: [{title:'xxx',desc:'xxx'},{title:'xxx',desc:'xxx'}]}
    log: { type: Object },
    post_date: { type: Date },
    isDel: { type: Boolean }
});

const exchangeModel = mongoose.model('exchangeModel',
    exchangeSchema,
    'exchange');

module.exports = exchangeModel;