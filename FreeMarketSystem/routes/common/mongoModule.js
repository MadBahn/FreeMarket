const userModel = require("../model/user");
const goodsModel = require("../model/goods");
const postModel = require("../model/post");
const commentModel = require("../model/comment");
const favoriteModel = require("../model/favorite");


const mongo_module = {};

mongo_module.find_one = async (id) => {
    switch (id.split(":")[0]) {
        case "user": return await userModel.findOne({userid: id}).exec();
        case "goods": return await goodsModel.findOne({goods_id: id}).exec();
        case "post": return await postModel.findOne({post_id: id}).exec();
    }
}