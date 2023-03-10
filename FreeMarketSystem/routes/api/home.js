const express = require("express");
const router = express.Router();

// Write the router here.
router.get("/", (req, res) => {
    res.status(200).json({
        msg: "good."
    });
})

module.exports = router;