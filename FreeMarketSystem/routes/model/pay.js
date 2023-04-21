const mongoose = require('mongoose');

//针对立即交易
const paySchema = mongoose.Schema({
    pay_id: { type: String, unique: true },
    //指向哪个交易
    pay_to: { type: String },
    //包含支付方法名称和支付内容（价格或等值商品）
    pay_content: { type: Object },
    post_date: { type: Date }
});

const payModel = mongoose.model('payModel',
    paySchema,
    'pay');

module.exports = payModel;