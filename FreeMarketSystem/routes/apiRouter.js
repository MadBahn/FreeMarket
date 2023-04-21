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

api.use((req, res, next) => {
    try {
        // console.log(req.originalUrl.split("/")[2]);
        //无需登录即可访问的
        const global_exclude = ["/api/goods/goods_display", "/api/goods/goods_info", "/api/goods/hot_goods", "/api/post/post_display", "/api/post/read_post", "/api/user/login", "/api/user/register"];
        //    用户处于封禁状态仍可访问的
        const blacklist_exclude = [...global_exclude];
        //user路由检查
        const user_reg = new RegExp(/user/);
        //goods路由检查
        const goods_reg = new RegExp(/goods/);
        //post路由
        const post_reg = new RegExp(/post/);

        console.log("Regex result:",user_reg.test(req.originalUrl));
        //对客户端进行检查
        if(true) {

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