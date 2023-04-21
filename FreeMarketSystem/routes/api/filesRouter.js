const express = require("express");
const router = express.Router();
const multer = require("multer");

// Write the router here.
//定义storage引擎
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.info(req, file, cb);
        cb(null, 'files');
    },
    filename: function (req, file, cb) {
        const s = (file.originalname.split('.'));
        cb(null, file.fieldname+"-"+Date.now()+"."+s[s.length-1]);
    }
});

//使用之
const upload = multer({storage:storage});

//通过路由调用
router.post("/upload_file", upload.any('file'), function (req, res) {
    res.send(req.files);
});

module.exports = router;