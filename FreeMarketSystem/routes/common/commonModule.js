const pubSub = require("pubsub-js");

const userModel = require("../model/user");
const goodsModel = require("../model/goods");
const postModel = require("../model/post");
const commentModel = require("../model/comment");

const commonData = require("./commonData");
const messageModel = require("../model/message");
const uuid = require("uuid");

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
            case "comment":
                return await commentModel.findOne({comment_id: dataid}).exec();
        }
    }());

    return {
        user: result_user,
        to: result_to,
        cond: (result_user !== null && result_to !== null)
    }
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

commonModule.check404Avatar = async (avatar) => {
    const status = (await fetch(`${process.env.CUR_SERVER}:${process.env.PORT}\/${avatar}`));
    if(status.status === 404) {
        console.log("image does not exist.");
        avatar = commonData.common.emptyAvatar;
    }

    return avatar;
}

commonModule.check404Image = async (imgs) => {
//    如果有指向不存在的文件，立即替换之
    for(let i in imgs) {
        console.log(i);
        const status = (await fetch(`${process.env.CUR_SERVER}:${process.env.PORT}\/${imgs[i].url}`));
        if(status.status === 404) {
            console.log("image does not exist.");
        //    使用默认的图片对象替换之
            imgs[i] = commonData.common.emptyImage;
        }
    }
    return imgs;
}

//发送消息
commonModule.sendMsg = async (to, title, msg_body, type) => {
    await new messageModel({
        message_id: `msg:${uuid.v4()}`,
        receiver: to,
        type: type,
        title: title,
        content: msg_body,
        post_date: new Date()
    }).save();
    pubSub.publish("msg", { target: to, content: msg_body});
}

module.exports = commonModule;