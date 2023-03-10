const express = require("express");
const router = express.Router();
const uuid = require("uuid");

const adminModule = require("../common/adminModule");
const historyModule = require("../common/historyModule");

const goodsModel = require("../model/goods");
const userModel = require("../model/user");
const commentModel = require("../model/comment");
const favoriteModel = require("../model/favorite");
const exchangeModel = require("../model/exchange");

// Write the router here.

router.post("/add_goods", async (req, res) => {
    const { new_goods } = req.body;

    const user = await userModel.findOne({userid: new_goods.owner}).exec();

    if(!user) return res.status(400).json({"error": "用户不存在"});
//    检查是否有图片


    const e_r = await new goodsModel({
        goods_id: "goods:" + uuid.v4(),
        owner: new_goods.owner,
        goods_name: new_goods.goods_name,
        desc: new_goods.desc,
        price: new_goods.price,
        status: new_goods.status,
        imgs: new_goods.imgs,
        post_date: new Date(),
        isDel: false
    }).save();

    console.log(e_r);

    res.status(200).json(e_r);
});

//修改商品的部分属性
router.post("/modify_goods", async (req, res) => {
    const { modify_form, userid } = req.body;

    const result = await goodsModel.findOne({
        goods_id: modify_form.goods_id
    }).exec();
    let out;

    out =
        result && (result._doc.owner === userid) ?
        await result.set(modify_form).save() :
        {
            error:
                result._doc.owner !== userid ?
                    "必须由商品拥有者修改" :
                    "商品不存在"
        };
    console.log(out);

    res.status(200).json(out);
});

router.post("/remove_goods", async (req, res) => {
//修改商品的isDel属性
//    在客户端，不会显示isDel属性为真的商品；而在管理端中请求的会忽略该条件，故还可以恢复商品
    const { goods_id, userid, admin_token } = req.body;

    //检索商品
    const result = await goodsModel.findOne({goods_id: goods_id}).exec();
//    验证admin_token
    const isAdmin = await adminModule.tokenValidation(admin_token);
//    变更为false（需要有效的admin_token）
    if(isAdmin && result._doc.isDel) {

    }
//    确认商品拥有者后，执行删除
    if(result._doc.owner === userid) {
        await result.set({isDel: true}).save();
    }

});

router.post("/goods_display", async (req, res) => {
//使用isClient（或admin token）控制是否显示isDel为真的商品数据
    const { admin_token, filter } = req.body;

    const isDel = !(await adminModule.tokenValidation(admin_token));

    const result = await goodsModel.find(isDel && {isDel: false})
        .skip(filter.start_at)
        .limit(filter.amount)
        .sort("-post_date")
        .exec();

    //批量替换owner
    for (let i in result.length) {
        const tmp = await userModel.findOne({userid: result[i]._doc.owner}).exec();
        console.log(tmp);
        if (tmp !== null) result[i]._doc.owner = tmp;
    }

    // console.log(result);

    res.status(200).json({
        data: result,
        next_index: (filter.start_at + filter.amount)
    });

    /*
    * filter应包含：
    * 1.start_at
    * 2.amount
    *
    *
    * 返回的：
    * 1.data本身
    * 2.最后一个索引
    * */

});

router.post("/goods_info", async (req, res) => {
    const { userid, goods_id, isEdit, admin_token } = req.body;

    const filter = { goods_id: goods_id };
    //没有admin_token时，不查找被假删除的数据
    if(!await adminModule.tokenValidation(admin_token)) filter.isDel = false;

    const result = await goodsModel.findOne(filter).exec();

    if(result) {
        //是否由编辑页面发起请求
        if(!isEdit) {
            const tmp_user = await userModel
                .findOne({userid: result.owner})
                .sort("-post_date")
                .exec();
            if(tmp_user) result._doc.owner = tmp_user;

            const tmp_comments = await commentModel.find({comment_to: result.goods_id, isDel: false}).exec();

            for (let i in tmp_comments){
                const tmp_by = await userModel.findOne({userid: tmp_comments[i].comment_by}).exec();
                if( tmp_by !== null ) tmp_comments[i]._doc.comment_by = tmp_by;
            }
            result._doc.comments = tmp_comments;
        }

        if(userid) {
            const favor = await favoriteModel.findOne({
                favorite_by: userid,
                refer_to: goods_id
            }).exec();

            result._doc.isFavorite = (favor !== null);

            await historyModule.addHistory({
                viewer: userid,
                history_to: goods_id
            });
        }
    }



    res.status(result ? 200 : 400).json(result ? result : {"error":"商品不存在"});
});

router.post("/create_deal", async (req, res) => {
//    创建交易
    const { exchange_form } = req.body;

//    记录买卖双方及商品信息

//    根据操作代码处理
});

router.post("/request_deal", async (req, res) => {
//    处理交易
    const { buyer, goods } = req.body;


});

//
router.post("/get_deal", async (req, res) => {
    // isClient（或admin token）忽略isDel属性
    const { userid, admin_token, filter } = req.body;

    const user = await userModel.findOne({userid: userid}).exec();
    // filter.isOwner控制查看买方或卖方
    const query = function () {
        if (filter.isOwner) return {owner: userid};
        return {buyer: userid};
    }();

    const result = await exchangeModel.find(query).exec();


    res.status(200).json({});
});

module.exports = router;