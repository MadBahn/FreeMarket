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
});

router.post("/handle_report", async (req, res) => {
    const { admin_token, type } = req.body;
    const isValid = await adminModule.tokenValidation(admin_token);

    console.log(isValid);
    // type可接受的值：拒绝、处理

    // console.log(await adminModule.removeToken(admin_token));
});

router.post("/remove_blacklist", async (req, res) => {
//移除黑名单
    const { admin_token, black_id } = req.body;

    const isValid = await adminModule.tokenValidation(admin_token);
    //


    const result = await blacklistModel.findOneAndRemove({black_id: black_id}).exec();

});

//数据条数
router.post("/count", async (req, res) => {

    //验证令牌
    const { admin_token } = req.body;

    const date = new Date();
    //    日期查询条件——近一个月
    const query = {post_date: { $gt: date.getTime() - (60*60*24*30*1000)}};

    //根据特定时间段获取数据条数
    const countG = await goodsModel
        .find(query)
        .countDocuments()
        .exec();
    const countP = await postModel
        .find(query)
        .countDocuments()
        .exec();
    const countC = await commentModel
        .find(query)
        .countDocuments()
        .exec();
    const countR = await reportModel
        .find(query)
        .countDocuments()
        .exec();

    console.log(countG, countP, countC, countR);

    //返回数据条目
    res.status(200).json({
        data: [
            ["商品", countG],
            ["帖子", countP],
            ["评论", countC],
            ["举报", countR]
        ]
    });
});

module.exports = router;