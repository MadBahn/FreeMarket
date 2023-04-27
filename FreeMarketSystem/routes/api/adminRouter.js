const os = require("os");
const express = require("express");
const uuid = require("uuid");

const router = express.Router();

const adminModule = require("../common/adminModule");
const commonModule = require("../common/commonModule");

const tokenModel = require("../model/auth_token");
const reportModel = require("../model/report");
const blacklistModel = require("../model/blacklist");
const userModel = require("../model/user");
const redis = require("redis");

//admin中间件

router.use(async (req, res, next) => {
    const { token } = req.body;
    console.log(req.originalUrl);
    //验证token
    if(!await adminModule.tokenValidation(token) && (req.originalUrl !== "/api/admin/login")) {
        console.log("no valid token");
        res.status(403).json(commonModule.responseUnifier(403, "no valid token"));
    } else {
        next();
    //    根据操作发送socket.io消息
    }
});


// Write the router here.
router.post("/login", async (req, res) => {
    const { admin_form } = req.body;

    const redis = require("redis");
    const client = redis.createClient();
    client.on('error', err => console.log("Redis Client Error:", err));

    if(admin_form.admin_name === 'admin' && admin_form.password === '123456') {
        const result = await new tokenModel({
            token_id: "token:" + uuid.v4(),
            valid_time: (new Date(new Date().getTime() + (1000*60*60*24)))
        }).save();
        //    生成redis缓存数据
        await client.connect();
        await client.set("admin", JSON.stringify(result._doc), {
            EX: 60 * 60 * 4
        });

        await client.disconnect();
    //    生成一个admin_token并写入库（后期可用redis数据库代替），默认有效期为一天
        res.status(200).json(result);

    } else {
        res.status(400).json({"error": "bad auth"});
    }
});

//管理端验证
router.post("/verify", async (req, res) => {
    const { token } = req.body;
    res.send(await adminModule.tokenValidation(token));
});

//注销
router.post("/logout", async (req, res) => {
    const { token } = req.body;
    //mongodb
    await tokenModel.findOneAndRemove({token_id: token}).exec();

    //redis
    const redis = require("redis");
    const client = redis.createClient();
    client.on('error', err => console.log("Redis Client Error:", err));

    await client.connect();
    await client.del("admin");

    await client.disconnect();
    res.send({msg: "logout"});
});

//彻底删除一条数据
router.post("/remove_complete", async (req, res) => {
    const { target } = req.body;

    let out;
    const model = target.split(":")[0];

    const query = ( () => {
        switch (model) {
            case "goods": return {goods_id: target};
            case "post": return {post_id: target};
            case "exchange": return {exchange_id: target};
            case "comment": return {comment_id: target};
        }
    })();

    const result = await require(`../model/${model}`).findOneAndRemove(query).exec();

    if(result) {
        out = commonModule.responseUnifier(200, "删除成功");
    } else {
        out = commonModule.responseUnifier(400, "没有找到要删除的数据");
    }

    res.status(out.code).json(out);
});

//
router.post("/get_report", async (req, res) => {
    const { isRecent, filter } = req.body;

    let out;
    console.log(filter);

    if(isRecent) filter.isDone = false;
    if(filter.other_reason) filter.other_reason = new RegExp(filter.other_reason);
    console.log(filter);
    const result = await reportModel.find(filter)
        .sort("-post_date")
        .limit(isRecent ? 3 : 0)
        .exec();

    console.log(result);



    for (let i in result) {
        const sub_filter = (() => {
            switch (result[i]._doc.refer_to.split(":")[0]) {
                case "goods": return {goods_id: result[i]._doc.refer_to};
                case "post": return {post_id: result[i]._doc.refer_to};
                case "comment": return {comment_id: result[i]._doc.refer_to};
            }
        })();

        console.log(sub_filter);

        const tmp = await commonModule
            .subQuery(
                require(`../model/${result[i]._doc.refer_to.split(":")[0]}`),
                sub_filter);
        const user = await userModel.findOne({userid: result[i]._doc.report_by}).exec();
        console.log(tmp);
        if(tmp) result[i]._doc.refer_to_obj = tmp;
        if(user) result[i]._doc.report_by = commonModule.removePassword(user);
    }

    // console.log(result);

    res.status(200).json(result);

});

router.post("/handle_report", async (req, res) => {
    const { type, report, target } = req.body;
    const model = target.split(":")[0];
    const query = ( () => {
        switch (model) {
            case "goods": return {goods_id: target};
            case "post": return {post_id: target};
            case "comment": return {comment_id: target};
        }
    })();
    // type可接受的值：拒绝、处理

    let out;

    const r = await reportModel.findOne({report_id: report}).exec();
    const result = await require(`../model/${model}`).findOne(query).exec();

    console.log(r, result);
    if(r && result) {
    //    根据type决定是否锁定目标数据，同时将发布者添加至黑名单

        const query2 = ( (d) => {
            switch (model) {
                case "goods": return {userid: d.owner};
                case "post": return {userid: d.post_by};
                case "comment": return {userid: d.comment_by};
            }
        })(result);

        const tmp_user = await userModel.findOne(query2).exec();
        console.log(tmp_user);
        if(type) {
            await result.set({isDel: true}).save();
        //    添加至黑名单
            await new blacklistModel({
                black_id: `black:${uuid.v4()}`,
                refer_to: tmp_user.userid
            }).save();
            await commonModule.sendMsg(tmp_user.userid, "账号违规", `你的账号由于违规，经举报，已被封禁`, "user");
        }
    //    无论type为何值，举报的isDel属性都会被更改
        await r.set({isDone: true}).save();

        out = commonModule.responseUnifier(200, "处理成功");
    } else {
        out = commonModule.responseUnifier(400, "举报不存在")
    }

    res.status(out.code).json(out);
});

router.post("/add_blacklist", async (req, res) => {
    const { target } = req.body;

    let out;
//    确保数据存在
    const model = target.split(":")[0];
    const is_exist = await commonModule.subQuery(require(`../model/${model}`),{});

    if(is_exist) {
        const result = await new blacklistModel({
            black_id: `black:${uuid.v4()}`,
            refer_to: target
        }).save();

        await commonModule.sendMsg(target, "账号被封禁", `${target}，您的账号已被封禁`, 'user');
        out = commonModule.responseUnifier(200, "封禁成功", result);
    } else {
        out = commonModule.responseUnifier(400, "封禁的对象不存在");
    }
    res.status(out.code).json(out);
});

router.post("/remove_blacklist", async (req, res) => {
//移除黑名单
    const { target } = req.body;

    let out;

    const result = await blacklistModel.findOneAndRemove({refer_to: target}).exec();

    out = commonModule.responseUnifier(200, "解封成功");

    await commonModule.sendMsg(target, "账号解封", `${target}，您的账号已被解封`, 'user');

    res.status(out.code).json(out);
});

//数据条数
router.post("/count", async (req, res) => {
    //验证令牌
    const { time, isChart } = req.body;

    //    日期查询条件——近30天
    //根据特定时间段获取数据条数
    const c_data = await adminModule.getDataCount(time).then();

    let out = isChart ? {
        data: [
            ["商品", c_data.g_count],
            ["帖子", c_data.p_count],
            ["评论", c_data.c_count],
            ["举报", c_data.r_count]
        ]
    } : {
        goods: c_data.g_count,
        post: c_data.p_count,
        exchange: c_data.e_count,
        comment: c_data.c_count
    }

    //返回数据条目
    res.status(200).json(out);
});

router.post("/data_admin", async (req, res) => {
    const { query } = req.body;

//    根据过滤器查询：goods, post, exchange
//    前二者会返回comments子数据

    const count = 0;

    const data = await adminModule
        .queryData( query.model, query.filter, query.field)
        .then();

    res.status(200).json({
        data: data
    });

});

router.post("/user_list", async (req, res) => {
//    组合用户的基本信息及状态
    const { filter = {} } = req.body;

    if(filter.username.length !== 0) filter.username = new RegExp(filter.username);
    else delete filter.username;

    const out = await adminModule.queryUser(filter).then();
    res.send(out);
});

router.post("/lock", async (req, res) => {
    const { target, filter } = req.body;

    //修改目标数据的isDel属性
    let out;
    if(target) {
        const coll = target.split(":")[0];
        console.log(filter);
        const result = await require(`../model/${coll}`).findOne({...filter}).exec();
        // console.log(result);
        if(result){
            // console.log(result.isDel);
            await result.set({isDel: !result._doc.isDel}).save();
            console.log(result);

            //bug
            const id = (() => {
                switch (coll) {
                    case "goods": return result._doc.owner;
                    case "post": return result._doc.post_by;
                    case "comment": return result._doc.comment_by;
                    case "exchange": return result._doc.seller;
                    case "user": return result._doc.userid;
                }
            })();

            console.log("id:",id);
            await commonModule.sendMsg(id, "数据被锁定", `你的数据已被${result._doc.isDel ? "锁定" : "解锁"}`, coll);

            out = commonModule.responseUnifier(200, "锁定成功", result);
        }

    } else {
        out = commonModule.responseUnifier(400, "没有提供数据id");
    }
    res.status(out.code).json(out);
});

router.post("/server_info", async (req, res) => {
//    CPU, RAM, OS
    const _package = require("../../package.json");
    console.log(_package);
    const cpu = os.cpus()[0];
    // process.stdout.write("\x07");
    res.send({
        CPU: {
            arch: os.arch(),
            model: cpu.model,
            frequency: cpu.speed
        },
        OS: {
            type: os.type(),
            platform: os.platform(),
            version: os.version()
        },
        RAM: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}GB`,
        Server: {
            name: _package.name,
            version: _package.version
        }
    });
});

module.exports = router;