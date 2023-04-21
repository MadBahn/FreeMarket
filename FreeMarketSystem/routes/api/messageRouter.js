const express = require("express");
const messageModel = require("../model/message");
const router = express.Router();

// Write the router here.
//发送消息
router.post("/send_msg", async (req, res) => {

});

//接收消息
router.post("/get_msg", async (req, res) => {
    const { receiver } = req.body;

    let out;

    messageModel.aggregate([
        {$match: {
            receiver: receiver
        }},
        {$limit: 1},
        {$sort: {
            "post_date": -1
        }}
    ]);

    res.json(out);

});

//
router.post("/get_chat", async (req, res) => {

});

//数据条数
router.post("/count", async (req, res) => {

});

module.exports = router;