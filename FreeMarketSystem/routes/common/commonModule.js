const userModel = require("../model/user");
const goodsModel = require("../model/goods");
const postModel = require("../model/post");

const commonModule = {};

//检查用户或数据是否存在，传递用户id、数据id及查询条件
commonModule.checkUserAndData = async (userid, dataid, query) => {
    //用户
    const result_user = await userModel.findOne({userid: userid}).exec();

    //数据
    const result_to = await (async function (){
        switch (dataid.split(":")[0]) {
            default:
            case "goods":
                return await goodsModel.findOne({goods_id: dataid}).exec();
            case "post":
                return await postModel.findOne({post_id: dataid}).exec();
        }
    }());

    return (result_user !== null && result_to !== null);
};

commonModule.subQuery = async (obj, filter) => {
    return await obj.findOne(filter).exec();
};

module.exports = commonModule;