const redis = require("redis");
const pubSub = require("pubsub-js");

const tokenModel = require("../model/auth_token");

const goodsModel = require("../model/goods");
const exchangeModel = require("../model/exchange");
const commentModel = require("../model/comment");
const postModel = require("../model/post");
const reportModel = require("../model/report");
const userModel = require("../model/user");
const blacklistModel = require("../model/blacklist");

const adminModule = {};




//移除token
adminModule.removeToken = async (token) => {
    const client = redis.createClient();
    client.on('error', err => console.log("Redis Client Error:", err));
    //redis
    await client.connect();
    await client.del("admin");
    // await client.expire("admin");
    await client.disconnect();
    //mongodb
    return await tokenModel.findOneAndRemove({token_id: token}).exec();
}

// 验证token函数
adminModule.tokenValidation = async (token) => {
    //从redis获取

    const client = redis.createClient();
    client.on('error', err => console.log("Redis Client Error:", err));

    await client.connect();
    const result_redis = JSON.parse(await client.get("admin"));
    //从MongoDB获取
    const result = await tokenModel.findOne({token_id: token}).exec();
    //使差值为负数
    const isValid = (result) ? (new Date().getTime())
        - (new Date(result.valid_time).getTime()) : undefined;

    const isValid_redis = (result_redis) ? (new Date().getTime())
        - (new Date(result_redis.valid_time).getTime()) : undefined;
    //返回一个验证结果（是否存在；是否在有效期内——指当前登录时间小于有效截止日期）

    //如果redis没有但mongodb存在，则写入redis中。
    if((isValid && isValid < 0) && (isValid_redis && isValid_redis > 0)) {
        await client.set("admin", JSON.stringify(result._doc), {
            EX: 60 * 60 * 4
        });
    }
    await client.disconnect();

    //通过PubSub向socket.io模块通信，以实现操作中发送消息
    pubSub.publish("msg", { target: "", content: "asd"});

    //如果过期，立即移除——注意将UTC时间转换为东八区时间方便查看
    if ((isValid && isValid < 0) || (isValid_redis && isValid_redis < 0)) {
        return true;
    }

    result && await adminModule.removeToken(token);
    return false;
};

adminModule.getDataCount = async ( filter) => {
    //    获取数据条目
    return {
        g_count: await goodsModel.find(filter)
            .countDocuments()
            .exec(),
        p_count: await postModel.find(filter)
            .countDocuments()
            .exec(),
        c_count: await commentModel
            .find(filter)
            .countDocuments()
            .exec(),
        r_count: await reportModel
            .find(filter)
            .countDocuments()
            .exec(),
        e_count: await exchangeModel
            .find(filter)
            .countDocuments()
            .exec()
    };

};

//获取数据
adminModule.queryData = async ( model, filter, field) => {
    console.log(model, filter);

    const result = await require(`../model/${model}`)
        .find(filter)
        .sort("-post-date")
        .skip(field.start)
        .limit(field.limit)
        .exec();

    for(let i in result) {
        if(model === "exchange") {
        //    查询两次
            const t_buyer = await userModel.findOne({userid: result[i]._doc.buyer}).exec();
            const t_seller = await userModel.findOne({userid: result[i]._doc.seller}).exec();

            if(t_buyer) {
                // delete t_buyer._doc.password;
                result[i]._doc.buyer = t_buyer._doc.username;
            }
            if(t_seller) {
                // delete t_seller._doc.password;
                result[i]._doc.seller = t_seller._doc.username;
            }

        } else {
            const sub_filter = (() => {
                switch (model) {
                    case "goods": return {userid: result[i]._doc.owner};
                    case "post": return {userid: result[i]._doc.post_by};
                    case "comment": return {userid: result[i]._doc.comment_by};
                }
            })();

            const tmp = await userModel.findOne(sub_filter).exec();

            if(tmp) {
                // delete tmp.password;
                switch (model) {
                    case "goods": result[i]._doc.owner = tmp.username;break;
                    case "post": result[i]._doc.post_by = tmp.username;break;
                    case "comment": result[i]._doc.comment_by = tmp.username;break;
                }
            }
        }
        console.log(result[i]);
    }

    return result;
};

adminModule.queryUser = async (filter) => {
    const raw = await userModel
        .find(filter)
        .exec();

    //加工数据
    for (let i in raw) {
        delete raw[i]._doc.password;
        const _r = await blacklistModel.findOne({refer_to: raw[i].userid}).exec();
        raw[i]._doc.status = !!_r;
        console.log(raw[i]._doc);
    }

    return raw;

};

module.exports = adminModule;