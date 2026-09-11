const express = require("express");
const router = express.Router();

const controller = require("../../controller/client/post.controller");

router.get("/", controller.index);
router.get("/detail/:slugPost", controller.detail);

module.exports = router;