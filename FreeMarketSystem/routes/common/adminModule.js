const tokenModel = require("../model/auth_token");

const goodsModel = require("../model/goods");
const exchangeModel = require("../model/exchange");
const postModel = require("../model/post");

const adminModule = {};

//移除token
adminModule.removeToken = async (token) => {
    return await tokenModel.findOneAndRemove({token_id: token}).exec();
}

// 验证token函数
adminModule.tokenValidation = async (token) => {
    const result = await tokenModel.findOne({token_id: token}).exec();
    //使差值为负数
    const isValid = result ? (new Date().getTime())
        - (new Date(result.valid_time).getTime()) : undefined;
    //返回一个验证结果（是否存在；是否在有效期内——指当前登录时间小于有效截止日期）

    //如果过期，立即移除——注意将UTC时间转换为东八区时间方便查看
    if (isValid && isValid < 0) return true;

    result && await adminModule.removeToken(token);
    return false;
};

adminModule.getDataCount = async (token) => {
    if(await adminModule.tokenValidation(token)) {
    //    获取数据条目
        return {
            g_count: await goodsModel.find().countDocuments().exec(),
            p_count: await postModel.find().countDocuments().exec(),
            e_count: await exchangeModel.find().countDocuments().exec()
        };
    }
    return null;
};

module.exports = adminModule;