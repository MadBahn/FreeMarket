const userModel = require("../model/user");
const goodsModel = require("../model/goods");
const postModel = require("../model/post");
const commentModel = require("../model/comment");

const commonModule = {};

//检查用户或数据是否存在，传递用户id、数据id及查询条件
commonModule.checkUserAndData = async (userid, dataid, query) => {
    //用户
    const result_user = await userModel.findOne({userid: userid}).exec();

    console.log("dataid:",dataid);
    //数据
    const result_to = await (async function (){
        switch (dataid.split(":")[0]) {
            default:
            case "goods":
                return await goodsModel.findOne({goods_id: dataid}).exec();
            case "post":
                return await postModel.findOne({post_id: dataid}).exec();
            case "comment":
                return await commentModel.findOne({comment_id: dataid}).exec();
        }
    }());

    return (result_user !== null && result_to !== null);
};

commonModule.subQuery = async (obj, filter) => {
    return await obj.findOne(filter).exec();
};

//规范化响应数据
commonModule.responseUnifier = (code, msg, data) => {
    let out = {code: code, msg: msg};
    if(data) out.data= data;
    return out;
}

//移除用户数据中的密码属性
commonModule.removePassword = (data) => {
    delete data._doc.password;
    return data;
}

module.exports = commonModule;