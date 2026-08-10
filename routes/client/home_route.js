const express = require("express");
const router = express.Router();

const controller = require("../../controller/client/home_controller");
router.get("/", controller.index);

module.exports = router;