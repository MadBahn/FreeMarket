const express = require("express");
const router = express.Router();
const uuid = require("uuid");

const adminModule = require("../common/adminModule");


const tokenModel = require("../model/auth_token");
const goodsModel = require("../model/goods");
const postModel = require("../model/post");
const commentModel = require("../model/comment");
const reportModel = require("../model/report");
const blacklistModel = require("../model/blacklist");


//其他数据模型




//admin中间件

router.use(async (req, res, next) => {
    console.log("middleware:",req.body, req.params);

    //验证token
    if(!await adminModule.tokenValidation(req.body.token)) console.log("no valid token");

    next();
});


// Write the router here.
router.post("/login", async (req, res) => {
    const { admin_form } = req.body;

    if(admin_form.admin_name === 'admin' && admin_form.password === '123456') {
    //    生成一个admin_token并写入库（后期可用redis数据库代替），默认有效期为一天
        res.status(200).json(
            await new tokenModel({
                token_id: "token:" + uuid.v4(),
                valid_time: (new Date(new Date().getTime() + (1000*60*60*24)))
            }).save());
    } else {
        res.status(400).json({"error": "bad auth"});
    }
});

//管理端验证
router.post("/verify", async (req, res) => {
    const { admin_token } = req.body;
    res.send(await adminModule.tokenValidation(admin_token));
});

//注销
router.post("/logout", async (req, res) => {
    const { admin_token } = req.body;

    await adminModule.removeToken(admin_token);

    res.send("logout");
});

//彻底删除一条数据
router.post("/remove_complete", async (req, res) => {
    const { admin_token, remove_id } = req.body;
//    验证token
    console.log(await adminModule.tokenValidation(admin_token));
    if(await adminModule.tokenValidation(admin_token)) {

    } else {

    }
});

router.post("/handle_report", async (req, res) => {
    const { admin_token, type } = req.body;
    // type可接受的值：拒绝、处理

    // console.log(await adminModule.removeToken(admin_token));

    if(await adminModule.tokenValidation(admin_token)) {

    } else {

    }
});

router.post("/remove_blacklist", async (req, res) => {
//移除黑名单
    const { admin_token, black_id } = req.body;

    const isValid = await adminModule.tokenValidation(admin_token);
    //
    if(await adminModule.tokenValidation(admin_token)) {
        const result = await blacklistModel.findOneAndRemove({black_id: black_id}).exec();
    } else {

    }
});

//数据条数
router.post("/count", async (req, res) => {
    //验证令牌
    const { admin_token, time, isChart } = req.body;

    //    日期查询条件——近30天


    //根据特定时间段获取数据条数
    if(await adminModule.tokenValidation(admin_token)) {
        const c_data = await adminModule.getDataCount(admin_token, time).then();

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
    } else {
        res.status(400).json("");
    }


});

router.post("/data_admin", async (req, res) => {
    const { admin_token, query } = req.body;

//    验证token
//    根据过滤器查询：goods, post, exchange
//    前二者会返回comments子数据

    const count = 0;

    const data = await adminModule
        .queryData(admin_token, require(`../model/${query.model}`), query.filter, query.field)
        .then();

    if(query.model !== "exchange"){

    }

    res.status(200).json({
        data: data
    });

});

router.post("/user_list", async (req, res) => {
    const { token } = req.body;
//    组合用户的基本信息及状态

});


module.exports = router;