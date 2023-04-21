const express = require("express");
const uuid = require("uuid");
//生成密码
const sha1 = require("js-sha1");
const router = express.Router();

const adminModule = require("../common/adminModule");
const historyModule = require("../common/historyModule");
const commonModule = require("../common/commonModule");

const userModel = require("../model/user");
const favoriteModel = require("../model/favorite");
const goodsModel = require("../model/goods");
const postModel = require("../model/post");
const commentModel = require("../model/comment");
const reportModel = require("../model/report");
const messageModel = require("../model/message");

// Write the router here.
// router.get("/:txt", (req, res) => {
//     const {txt} = req.params;
//     const base64txt = new Buffer(txt).toString("base64");
//     const sha1txt = sha1(txt);
//     res.status(200).json({txt: sha1txt});
// });

// 清除password属性
router.use((req, res, next) => {
    next();

    // console.log("request:",req);
    // console.log("response:",res);

});

router.get("/verify_email/:email", (req, res) => {
    // /\b[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,6}\b/g

    const { email } = req.params;
    const patten = /\b[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,6}\b/g;
    console.log("match:",email.match(patten));
    //uni-app前端部分为data: ""
    res.send(email.match(patten).length === 1);
});

//登录
router.post("/login", async (req, res) => {
    const { login_form } = req.body;

    let out = {};

    const query = {
        ...login_form,
        password: sha1(login_form.password)
    };
    let result = await userModel.findOne(query).exec();

    if(result) {
        result = commonModule.removePassword(result);
        out = commonModule.responseUnifier(200, "登录成功", result);
    } else {
        out = commonModule.responseUnifier(400, "用户名或密码错误")
    }

    // const out = result ? result : {"error": "用户名或密码错误"};
    res.status(out.code).json(out);
});

//注册
router.post("/register", ( async (req, res) => {
    const { register_form } = req.body;

    console.log(register_form.username, ":", register_form.password);

    if (register_form.username !== "" &&
        register_form.password !== "" &&
        register_form.password_confirm === register_form.password) {
        const _new = {
            userid: "user:" + uuid.v4(),
            username: register_form.username,
            headImg: "",
            password: sha1(register_form.password),
            gender: "",
            birthday: new Date(),
            email: register_form.email,
            city: "",
            desc: "这个人有点懒，什么都没有写",
            isDel: false
        }
        await new userModel(_new).save((e) => {
            const out = e ? { "error": "用户名已存在" } : {"res": "OK"}
            res.status(e ? 400 : 200).json(out);
        });
    } else {
        res.status(400).json({
            "error": "前后密码不一致"
        });
    }
}));

//修改个人信息
router.post("/modify_info", (async (req, res) => {
    //id、登录信息（不需要验证）不变，其他可变
    const { modify_form } = req.body;

    const result = await userModel.findOne({userid: modify_form.userid}).exec();

    let out = {};
    if(!result) {
        out = commonModule.responseUnifier(400, "用户不存在");
    } else {
        let r = await result.set({...modify_form}).save();
        r = commonModule.removePassword(r);
        console.log(r);
        out = commonModule.responseUnifier(200, "修改成功",r);
    }
    res.status(out.code).json(out);
}));

//修改密码
router.post("/modify_auth", async (req,res) => {
    const { auth_form } = req.body;

    auth_form.pwd_cur = sha1(auth_form.pwd_cur);
    auth_form.pwd_new = sha1(auth_form.pwd_new);
    auth_form.repwd = sha1(auth_form.repwd);

//    1.验证原密码 2.确认新密码和确认密码相同
    const mod_user = await userModel.findOne({userid: auth_form.userid}).exec();

    let out = {};

    console.log(mod_user);
    if(mod_user) {
        if(auth_form.pwd_cur === mod_user._doc.password) {
            if(auth_form.pwd_new === auth_form.repwd) {
                console.log("ok");
                await mod_user.set({password: auth_form.pwd_new}).save();
                mod_user._doc = commonModule.removePassword(mod_user);
                out = commonModule.responseUnifier(200, "密码修改成功");
            } else {
                out = commonModule.responseUnifier(400, "新密码与确认密码不一致");
            }
        } else {
            console.log("cur_err");
            out = commonModule.responseUnifier(400, "原密码错误");
        }
    } else {
        console.log("user_err");
        out = commonModule.responseUnifier(400, "找不到用户");
    }

    res.status(out.code).json(out);
});

// 创建评论
router.post("/create_comment", async (req, res) => {
    const { comment_form } = req.body;
    //包含comment_by, comment_to, content
    // console.log(comment_form);

    const next = await commonModule.checkUserAndData(comment_form.comment_by, comment_form.comment_to);

    if (next.cond) {
        const out = await new commentModel({
            ...comment_form,
            comment_id: "comment:" + uuid.v4(),
            post_date: new Date(),
            isDel: false
        }).save();

        const id = (() => {
            switch (comment_form.comment_to.split(":")[0]) {
                case "goods": return next.to.owner.userid;
                case "post": return next.to.post_by.userid;
            }
        })();

        await commonModule.sendMsg(id,`${next.user.userid}评论了${comment_form.comment_to}，${comment_form.content}`,comment_form.comment_to.split(":")[0]);

        res.status(200).json(out);
    } else {
        res.status(400).json({"error": "用户或要评论的对象不存在"});
    }

});

//举报
router.post("/create_report", async (req, res) => {
    const { report_form } = req.body;

    console.log("form:",report_form);

    const next = await commonModule.checkUserAndData(report_form.report_by, report_form.refer_to, {});

    //检查表单
    if(report_form.reason === "other" && report_form.other_reason === "")
        res.status(400).json({"error": "请填写理由"});
    else if(report_form.reason === "" && report_form.other_reason === "")
        res.status(400).json({"error": "请选择原因"});

    else {
        //与创建评论相同的步骤
        const next = await commonModule.checkUserAndData(report_form.report_by, report_form.refer_to);

        //创建前检查
        if (next) {
            const out = await new reportModel({
                ...report_form,

                report_id: "report:" + uuid.v4(),
                post_date: new Date(),
                isDone: false
            }).save();

            res.status(200).json(out);

        } else {
            res.status(400).json({"error": "用户或要举报的对象不存在"});
        }
    }
});

//添加收藏
router.post("/favorite", async (req, res) => {
//    存在时删除之，否则添加
    const { favorite_form } = req.body;
//    查找条件：用户id、商品id（帖子id）

    const queryModel = function () {
        switch (favorite_form.refer_to.split(":")[0]) {
            default:
            case "goods": return {
                model: goodsModel,
                query: { goods_id: favorite_form.refer_to }
            };
            case "post": return {
                model: postModel,
                query: { post_id: favorite_form.refer_to }
            };
        }
    } ();

    //用户
    const user = await userModel.findOne({userid: favorite_form.userid}).exec();
    //商品或帖子
    const refer_to = await queryModel.model.findOne(queryModel.query).exec();

    if (user === null || refer_to === null) return res.status(400).json({"error": "找不到用户或商品（帖子），请检查参数"})

    const result = await favoriteModel.findOneAndRemove({
        favorite_by: favorite_form.userid,
        refer_to: favorite_form.refer_to
    }).exec();
    //result为null时添加
    console.log(result);

    result === null && await new favoriteModel({
        favorite_id: "favorite:" + uuid.v4(),
        favorite_by: favorite_form.userid,
        refer_to: favorite_form.refer_to,
        post_date: new Date()
    }).save();

    res.status(200).json(result === null ? {"msg":"添加成功"} : {"msg":"取消成功"});
});

// 获取收藏
router.post("/get_favorite", async (req, res) => {
    const { userid, type, admin_token } = req.body;

    const filter = {
        favorite_by: userid
    };

    const isAdmin = (!await adminModule.tokenValidation(admin_token));
    console.log(isAdmin);

    const result = await favoriteModel
        .find(filter)
        .sort("-post_date")
        .exec();

    //查询闭包
    const subQuery = async (obj, _filter) => {
        return await obj.findOne(_filter).exec();
    };

    const out = result.filter(i => i.refer_to.split(":")[0] === type);

    //model
    for (let i in out) {
        let tmp;
        if(type === "goods") tmp = await subQuery(goodsModel, {goods_id: result[i].refer_to});
        else if (type === "post") tmp = await subQuery(postModel, {post_id: result[i].refer_to});

        console.log(tmp);

        if(tmp) out[i]._doc.refer_to = tmp;
    }

    res.status(200).json(out);

});

//获取浏览历史
router.post("/get_history",async (req, res) => {
    const { filter } = req.body;

    //查询前获取相关用户信息
    const isExist = await userModel.findOne({userid: filter.query.userid}).exec();

    const data = await historyModule.loadHistory(filter);

    // console.log("filter:", filter, "data:", data);

    const query = async (kw, i) => {
        switch (kw) {
            case "goods":
                return await goodsModel.findOne({goods_id: i}).exec();
            case "post":
                return await postModel.findOne({post_id: i}).exec();
        }
    };

    for (let i in data) {
        //追加数据
        const tmp_arg = data[i].history_to.split(":")[0]
        const tmp = await query(tmp_arg, data[i].history_to);
        if(tmp) {
            tmp.imgs = await commonModule.check404Image(tmp.imgs);

            //用户查询
            const sub_filter = tmp_arg === "goods" ?
                {userid: tmp.owner} :
                {userid: tmp.post_by};

            const tmp_u = await userModel.findOne(sub_filter).exec();

            if (tmp_arg === "args") tmp._doc.owner = tmp_u;
            else tmp._doc.post_by = tmp_u;
        }
        if(tmp) data[i]._doc.detail = tmp;
    }

    //根据type过滤

    const format_data = data.filter(i => {
        return i.history_to.split(":")[0] === filter.type;
    });

    //计算下一次查询的索引值
    const out = {
        data: format_data,
        next_index : filter.start_at + filter.count
    };

    res.status(200).json(out);
});

//搜索
router.post("/search", async (req, res) => {
    //包含关键字、类型
    const { search_form } = req.body;
    //使用正则表达式以实现模糊查询
    const keyword = new RegExp((search_form.keyword.toString()));
    // const amount = 10;

   console.log(keyword);

    const data = await (async function () {
        //确认类型以确保返回正确的搜索结果
        switch (search_form.type) {
            case "goods":
                return await goodsModel.find({goods_name: keyword})
                    .skip(search_form.start_at)
                    .limit(search_form.amount)
                    .exec();
            case "post":
                return await postModel.find({title: keyword})
                    .skip(search_form.start_at)
                    .limit(search_form.amount)
                    .exec();
        }
    })();

    console.log(data);

    let query_type;

//    批量替换用户id为用户实体数据
    for(let i in data) {
//        确定替换条件
        if(search_form.type === "goods")
            query_type = data[i].owner;
        else if(search_form.type === "post")
            query_type = data[i].post_by;
//        检索用户
        const t = await userModel.findOne({userid: query_type}).exec();

//        如果结果不为null
        if(t !== null) {
            if(search_form.type === "goods")
                data[i]._doc.owner = t._doc;
            else if(search_form.type === "post")
                data[i]._doc.post_by = t._doc;
        }
    }
//
    const out = {
        data: data,
        next_index: search_form.start_at + search_form.amount
    }

    //返回检索数据、条数、索引值
    res.status(200).json(out);
});

//获取最新消息
router.post("/get_msg", async (req, res) => {
    const { userid } = req.body;

    let out;

    const result = await messageModel.find({ receiver: userid }).exec();
    console.log(result);
    res.send(result);
});

//获取不同类别的消息
router.post("/msg_detail", async (req, res) => {
    const { type, receiver, field } = req.body;

    let out;
    const result = await messageModel
        .find({type: type, receiver: receiver})
        .sort("-post_date")
        .skip(field.start_at)
        .limit(field.amount)
        .exec();

    out = commonModule.responseUnifier(200, "OK", result);

    res.status(out.code).json(out);

});

module.exports = router;