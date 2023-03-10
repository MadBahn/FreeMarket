const express = require("express");
const router = express.Router();

const uuid = require("uuid");

const userModel = require("../model/user");
const postModel = require("../model/post");
const adminModule = require("../common/adminModule");
const favoriteModel = require("../model/favorite");
const historyModule = require("../common/historyModule");
const commentModel = require("../model/comment");

// Write the router here.
router.post("/create_post", async (req, res) => {
    const { post_data, userid } = req.body;

//    查询用户是否存在
    const user = await userModel.findOne({userid: userid}).exec();

    if(!user) return res.status(400).json({error: "用户不存在"});
//    检查是否有图片


//    生成帖子数据并存入
    const result = await new postModel({
        post_id: "post:" + uuid.v4(),
        post_by: userid,
        title: post_data.title,
        content: post_data.content,
        imgs: post_data.imgs,
        post_date: new Date(),
        isDel: false
    }).save();

//    检查结果
    console.log(result);

    res.status(200).json(result);
});

router.post("/modify_post", async (req, res) => {
    const { modify_form, userid } = req.body;

    const result = await postModel.findOne({
        post_id: modify_form.post_id
    }).exec();
    let out;

    out =
        result && (result._doc.post_by === userid) ?
            await result.set(modify_form).save() :
            {
                error:
                    ( result._doc.post_by !== userid ?
                        "必须由发帖者修改" :
                        "帖子不存在" )
            };
    console.log(out);

    res.status(200).json(out);
});

router.post("/remove_post", async (req, res) => {
    //更改帖子的isDel属性
    const { post_id, userid, admin_token } = req.body;

    const result = postModel.findOne({post_id: post_id}).exec();

    const isAdmin = await adminModule.tokenValidation(admin_token);

    //拥有有效的令牌并且isDel为true时，执行恢复操作
    if(isAdmin && result._doc.isDel) {

    }
    //确保为发帖者本人操作
    if(result._doc.post_by === userid) {
        await result.set({isDel: true}).save();
    }
});

//显示帖子列表
router.post("/post_display", async (req, res) => {
    const { admin_token, filter } = req.body;

    const isDel = !(await adminModule.tokenValidation(admin_token));

    const result = await postModel.find(isDel && {isDel: false})
        .skip(filter.start_at)
        .limit(filter.amount)
        .sort("-post_date")
        .exec();

    for (let i in result.length) {
        const tmp = await userModel.findOne({userid: result[i]._doc.post_by}).exec();
        console.log(tmp);
        if (tmp !== null) result[i]._doc.post_by = tmp;
    }

    res.status(200).json({
        data: result,
        next_index: (filter.start_at + filter.amount)
    });
});

router.post("/read_post", async (req, res) => {
    const { userid, post_id, isEdit, admin_token } = req.body;

    const filter = { post_id: post_id };

    if(!await adminModule.tokenValidation(admin_token)) filter.isDel = false;

    const result = await postModel.findOne(filter).exec();

    if(result) {
        if(!isEdit) {
            const tmp_user = await userModel
                .findOne({userid: result.owner})
                .sort("-post_date")
                .exec();
            if(tmp_user) result._doc.owner = tmp_user;

            const tmp_comments = await commentModel.find({comment_to: result.post_id, isDel: false}).exec();

            //批量替换userid
            for (let i in tmp_comments){
                const tmp_by = await userModel.findOne({userid: tmp_comments[i].comment_by}).exec();
                if( tmp_by !== null ) tmp_comments[i]._doc.comment_by = tmp_by;
            }
            result._doc.comments = tmp_comments;
        }

        if(userid) {
            //查找是否收藏之
            const favor = await favoriteModel.findOne({
                favorite_by: userid,
                refer_to: post_id
            }).exec();

            result._doc.isFavorite = (favor !== null);

            //添加历史记录
            await historyModule.addHistory({
                viewer: userid,
                history_to: post_id
            });
        }

        res.status(200).json({ data: result });
    } else {
        res.status(400).json({ error: "error" });
    }
});

module.exports = router;