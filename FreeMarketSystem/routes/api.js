const express = require("express");
const api = express();

//连接数据库
const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_SERVER);

//import router
const home = require("../routes/api/home");
const user = require("../routes/api/user");
const goods = require("../routes/api/goods");
const admin = require("../routes/api/admin");
const post = require("../routes/api/post");
const files = require("../routes/api/files");

//use router
api.use("/home", home);
api.use("/user", user);
api.use("/goods", goods);
api.use("/admin", admin);
api.use("/files", files)
api.use("/post", post);

module.exports = api;