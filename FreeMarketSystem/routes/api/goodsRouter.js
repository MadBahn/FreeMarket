const express = require("express");
const router = express.Router();
const uuid = require("uuid");

const historyModule = require("../common/historyModule");
const commonModule = require("../common/commonModule");

const goodsModel = require("../model/goods");
const userModel = require("../model/user");
const commentModel = require("../model/comment");
const favoriteModel = require("../model/favorite");
const exchangeModel = require("../model/exchange");
const redis = require("redis");
const payModel = require("../model/pay");
const {common} = require("../common/commonData");

//检查用户是否被封禁
router.use(async (req, res, next) => {
    // 一些接口可不需要有效的用户
    const exclude_url = ["/api/goods/goods_display", "/api/goods/goods_info", "/api/goods/hot_goods"];
    //一些接口允许被封禁的账户继续使用
    const blacklist_exclude = [...exclude_url, "/api/goods/get_deal", "/api/goods/deal_info", "/api/goods/favorite"];
    //请求
    // console.log("original_url", req.originalUrl);
    // console.log("login exclude:",exclude_url.includes(req.originalUrl));
    // console.log("black exclude:",blacklist_exclude.includes(req.originalUrl));
    //遍历
    if(true)
        next();
    else res.status(400).json(commonModule.responseUnifier(400,"此账号目前被封禁"));
});


// Write the router here.

router.post("/add_goods", async (req, res) => {
    const { new_goods } = req.body;

    let out;

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

    const out =
        result && (result._doc.owner === userid) ?
            commonModule.responseUnifier(200, "修改成功",await result.set(modify_form).save()) :
            commonModule.responseUnifier(400, (result._doc.owner !== userid) ? "必须由商品拥有者修改" : "商品不存在");
    // console.log(out);

    res.status(out.code).json(out);
});

router.post("/remove_goods", async (req, res) => {
//修改商品的isDel属性
//    在客户端，不会显示isDel属性为真的商品；而在管理端中请求的会忽略该条件，故还可以恢复商品
    const { goods_id, userid } = req.body;

    let out;
    //检索商品
    const result = await goodsModel.findOne({goods_id: goods_id}).exec();
    const user = await userModel.findOne({userid: userid}).exec();
//    确认商品拥有者后，执行删除

    console.log(result, user);
    if((result && user) && (result._doc.owner === userid)) {
        const status = await result.set({isDel: true}).save();
        out = commonModule.responseUnifier(200, "删除成功");
    } else {
        out = commonModule.responseUnifier(400, "删除失败");
    }

    res.status(out.code).json(out);
});

router.post("/goods_display", async (req, res) => {
//使用isClient（或admin token）控制是否显示isDel为真的商品数据
    const { filter } = req.body;

    let out;

    const result = await goodsModel.find({...filter.sub_filter, isDel: false})
        .skip(filter.start_at)
        .limit(filter.amount)
        .sort("-post_date")
        .exec();

    //批量替换owner
    for (let i in result) {
        const tmp = await userModel.findOne({userid: result[i]._doc.owner}).exec();
        console.log(tmp);
        if (tmp !== null) result[i]._doc.owner = tmp;
        result[i]._doc.imgs = await commonModule.check404Image(result[i]._doc.imgs);
    }

    // console.log(result);
    out = commonModule.responseUnifier(200, "正常访问", {
        data: result,
        next_index: (filter.start_at + filter.amount)
    });

    res.status(out.code).json(out);

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
    const { userid, goods_id, isEdit } = req.body;

    const filter = { goods_id: goods_id };

    let out;
    //没有admin_token时，不查找被假删除的数据

    const result = await goodsModel.findOne(filter).exec();

    if(result) {
        //是否由编辑页面发起请求
        result._doc.imgs = await commonModule.check404Image(result._doc.imgs);
        if(!isEdit) {
            let tmp_user = await userModel
                .findOne({userid: result.owner})
                .sort("-post_date")
                .exec();
            if(tmp_user) {
                tmp_user = commonModule.removePassword(tmp_user);
                result._doc.owner = tmp_user;
            }

            const tmp_comments = await commentModel.find({comment_to: result.goods_id, isDel: false}).exec();

            for (let i in tmp_comments){
                let tmp_by = await userModel.findOne({userid: tmp_comments[i].comment_by}).exec();
                if( tmp_by !== null ) {
                    tmp_by = commonModule.removePassword(tmp_by);
                    tmp_comments[i]._doc.comment_by = tmp_by;
                }
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
        out = commonModule.responseUnifier(200, "找到商品了", result);
    } else {
        out = commonModule.responseUnifier(400, "商品不存在");
    }
    res.status(out.code).json(out);
});

router.post("/hot_goods", async (req, res) => {
//    热门商品，根据历史记录排序
//     const history = await historyModule.loadHistory().then();
//    聚合管道随机查询
    const data = await goodsModel
        .aggregate()
        .match({isDel: false})
        .sample(4)
        .exec();
    console.log(data);
    for (let i in data) {
        console.log(data[i].imgs);

        data[i].imgs = await commonModule.check404Image(data[i].imgs);
    }
    res.send(data);
});

router.post("/create_deal", async (req, res) => {
//    创建交易
    const { exchange_form } = req.body;

    let out;
    //检查买卖双方及商品是否存在且有效
    const isBuyer = (await userModel.findOne({userid: exchange_form.buyer}).exec());
    const isSeller = (await userModel.findOne({userid: exchange_form.seller}).exec())
    const isGoods = (await goodsModel.findOne({goods_id: exchange_form.goods}).exec());

    console.log(isBuyer, isSeller, isGoods);

    if((isBuyer && isSeller && isGoods) && (isBuyer._doc.userid !== isSeller._doc.userid)) {
        //买卖不能同为一人
        //同一个商品在一定时间内只能发起一次交易

        isGoods.imgs = await commonModule.check404Image(isGoods.imgs);
        const exchange = await new exchangeModel({
            exchange_id: `exchange:${uuid.v4()}`,
            ...exchange_form,
            goods_snapshot: isGoods,
            status: 0,
            pay: "未确认",
            desc: "",
            post_date: new Date(),
            // log: {
            //     log_active: 0,
            //     list: [{title:'已发起',desc: new Date()}]
            // },
            isDel: false
        }).save();
        out = commonModule.responseUnifier(200,"创建成功", exchange);

        await commonModule.sendMsg(isSeller._doc.userid, "您有一个新交易", `${isSeller._doc.userid}，您有一个新的交易需要处理：${exchange._doc.exchange_id}`, "goods");
    } else {
        out = commonModule.responseUnifier(400, "买卖双方或商品至少有一项无效");
    }
//向卖家发送消息

//    记录买卖双方及商品信息
    res.status(out.code).json(out);
});

//双方已协商好了，可以继续交易了
router.post("/proceed_deal", async (req, res) => {
    const { proceed_form } = req.body;

    let out;

    const has_exchange = await exchangeModel.findOne({exchange_id: proceed_form.exchange_id, isDel: false}).exec();

    if(has_exchange && has_exchange._doc.status === 0) {
        await has_exchange.set({ ...proceed_form.setter}).save();

        if(proceed_form.isProceed) {
            console.log("set status 1");
            await has_exchange.set({pay: proceed_form.pay});
        //是否为卖方确认，符合则直接设状态为2
        //     has_exchange._doc.log.log_active = 1;
        //     await has_exchange.set({log: {log_active: 1}});
            if(proceed_form.pay === "卖家确认"){
                // has_exchange._doc.log.list.push({title: "待收货", desc: new Date()});
                await has_exchange.set({status: 2}).save();
            } else {
                // has_exchange._doc.log.list.push({title: "待付款", desc: new Date()});
                await commonModule.sendMsg(has_exchange._doc.buyer, "您有一个待支付的交易", `${has_exchange._doc.buyer}，您有一个待支付的交易：${has_exchange._doc.exchange_id}`, "goods");
                await has_exchange.set({status: 1}).save();
            }
        }

        //向买家发送消息
        out = commonModule.responseUnifier(200, "该让买家支付了");
    } else {
        out = commonModule.responseUnifier(400, "没有该交易");
    }

    res.status(out.code).json(out);
});
//付款
router.post("/pay_deal", async (req, res) => {
    const { pay_form } = req.body;

    let out;

    const has_exchange = await exchangeModel.findOne({exchange_id: pay_form.exchange_id, isDel: false}).exec();

    if(has_exchange && has_exchange._doc.status === 1) {
    //    此处可添加第三方API（如支付宝，微信支付）查询支付结果。
        const paid = await new payModel({
            pay_id: `pay:${uuid.v4()}`,
            pay_to: pay_form.exchange_id,
            pay_content: {
                pay_method: pay_form.pay_method,
                price: pay_form.price
            },
            post_date: new Date()
        }).save();
        if(paid) {
            await has_exchange.set({status: 2}).save();
            //向卖家发送消息
            await commonModule.sendMsg(has_exchange._doc.seller, "您有一个尚未发货的交易", `${has_exchange._doc.exchange_id}：买家支付成功，等待收货`, "goods");
            out = commonModule.responseUnifier(200, `${has_exchange._doc.exchange_id}：付款成功，接下来等待卖家发货了`);
        } else {
            out = commonModule.responseUnifier(500, "付款失败了");
        }

    } else {
        out = commonModule.responseUnifier(400, "没有该交易");
    }

    res.status(out.code).json(out);

});
//交易完成
router.post("/finish_deal", async (req, res) => {
    const { finish_form } = req.body;

    let out;

    const has_exchange = await exchangeModel.findOne({exchange_id: finish_form.exchange_id, isDel: false}).exec();

    if(has_exchange && has_exchange._doc.status === 2) {
        await has_exchange.set({status: 3}).save();
        //向买家、卖家发送消息
        await commonModule.sendMsg(has_exchange._doc.seller, "交易完成",`${has_exchange._doc.exchange_id}：买家已确认收货，交易完成`,"goods");
        await commonModule.sendMsg(has_exchange._doc.buyer, "交易完成",`${has_exchange._doc.exchange_id}：您已收货`,"goods");
        out = commonModule.responseUnifier(200, "交易完成了");
    } else {
        out = commonModule.responseUnifier(400, "没有该交易");
    }

    res.status(out.code).json(out);

});

//一般由买方发起取消请求
router.post("/cancel_deal", async (req, res) => {
    const { cancel_form } = req.body;

    let out;

    const has_exchange = await exchangeModel.findOne({exchange_id: cancel_form.exchange_id, isDel: false}).exec();
    // await has_exchange.set({status: -1}).save();
    if(has_exchange && (has_exchange._doc.status !== -1 || has_exchange._doc.status !== 3)) {
        //向卖家发送消息
        await commonModule.sendMsg(has_exchange.seller, "交易取消",`买家${has_exchange.buyer}已取消支付`, "goods");
        //添加log
        await has_exchange.set({status: -1}).save();

        out = commonModule.responseUnifier(200, "交易取消成功");
    } else {
        out = commonModule.responseUnifier(400, "不是可取消的交易");
    }
    res.status(out.code).json(out);
});

//获取所有交易信息
router.post("/get_deal", async (req, res) => {
    // isClient（或admin token）忽略isDel属性
    const { userid, filter } = req.body;

    console.log(userid, filter);
    let out;
    const user = await userModel.findOne({userid: userid}).exec();
    // filter.isOwner控制查看买方或卖方
    console.log(user);
    if(user) {
        const query = function () {
            if (filter.isSeller) return {seller: userid};
            return {buyer: userid};
        }();

        const result = await exchangeModel.find({
            ...query,
            status: filter.status
        })
            .skip(filter.start_at)
            .limit(filter.amount)
            .sort("-post_date")
            .exec();
        //替换图片
        for (let r in result) {
            console.log(result[r]._doc);
            // const _goods = await goodsModel.findOne({goods_id: result[r]._doc.goods}).exec();
            //根据买卖方选择决定查询条件
            const _query = function () {
                if (!filter.isSeller) return {userid: result[r]._doc.seller};
                return {userid: result[r]._doc.buyer};
            }();

            console.log(_query);

            const _target = await userModel.findOne({..._query}).exec();

            console.log(_target);

            result[r]._doc.goods_snapshot.imgs = await commonModule.check404Image(result[r]._doc.goods_snapshot.imgs);

            result[r]._doc._target = (() => {
                if(filter.isSeller) return result[r]._doc.seller;
                return result[r]._doc.buyer;
            })();

            delete result[r]._doc.seller;
            delete result[r]._doc.buyer;

            if(_target) {
                _target.headImg = await commonModule.check404Avatar(_target.headImg);
               result[r]._doc._target = _target;
            }
        }

        out = commonModule.responseUnifier(200, "拿到交易数据了", {
            data: result,
            next_index: (filter.start_at + filter.amount)
        });
    } else {
        out = commonModule.responseUnifier(403, "必须是有效用户");
    }

    res.status(out.code).json(out);
});

router.post("/deal_info", async (req, res) => {
    const { exchange_id, type } = req.body;

    let out;
//    查询交易
    const result = await exchangeModel.findOne({exchange_id: exchange_id, isDel: false}).exec();
//    查询商品
    if(result) {
        result._doc.goods_snapshot.imgs = await commonModule.check404Image(result._doc.goods_snapshot.imgs);
        const filter = {userid: (type === "seller" ? result._doc.seller : result._doc.buyer)};
        const tmp_user = await userModel.findOne(filter).exec();

        if(tmp_user) {
            delete result._doc.seller
            delete result._doc.buyer
            tmp_user.headImg = await commonModule.check404Avatar(tmp_user.headImg);
            result._doc._target = tmp_user;
        }

        out = commonModule.responseUnifier(200, "OK", result);
    }

//    返回之
    res.status(out.code).json(out);
});

module.exports = router;