const express = require("express");
const api = express();

//连接数据库
const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_SERVER);

//import router
const home = require("../routes/api/home");
const user = require("./api/userRouter");
const goods = require("./api/goodsRouter");
const admin = require("./api/adminRouter");
const post = require("./api/postRouter");
const files = require("./api/filesRouter");
const userModel = require("./model/user");
const blacklistModel = require("./model/blacklist");

api.use(async (req, res, next) => {
    try {
        const { verify } = req.body;
        //无需登录即可访问的
        const global_exclude = ["/api/goods/goods_display", "/api/goods/goods_info", "/api/goods/hot_goods", "/api/post/post_display", "/api/post/read_post", "/api/user/login", "/api/user/register", "/api/user/user_info", "/api/user/get_published", "/api/files/upload_file"];
        //用户处于封禁状态仍可访问的
        const blacklist_exclude = [...global_exclude, "/api/goods/get_deal", "/api/goods/deal_info", "/api/goods/favorite", "/api/user/get_msg", "/api/user/msg_detail"];
        //admin单独检查
        const admin_reg = new RegExp(/admin/);

        // console.log("Regex result:",admin_reg.test(req.originalUrl));
        //
        // console.log("original_url", req.originalUrl);
        // console.log("login exclude:",global_exclude.includes(req.originalUrl));
        // console.log("black exclude:",blacklist_exclude.includes(req.originalUrl));

        // console.log(req);
        // console.log("verify:",verify);
        //对客户端进行检查
        if(!admin_reg.test(req.originalUrl)) {
            if(!global_exclude.includes(req.originalUrl)) {
                const user = await userModel.findOne({userid: verify}).exec();
                if(!user) {
                    return res.status(403).send({error: "没有有效用户"});
                }
            }
            if(!blacklist_exclude.includes(req.originalUrl)) {
                const has_black = await blacklistModel.findOne({ refer_to: verify}).exec();
                if(has_black) {
                    return res.status(403).send({error: "用户已被封禁，无法操作"});
                }
            }
        }
        next();
    } catch (e) {
        console.log(e);
    }
});

//use router
api.use("/home", home);
api.use("/user", user);
api.use("/goods", goods);
api.use("/admin", admin);
api.use("/files", files)
api.use("/post", post);



module.exports = api;