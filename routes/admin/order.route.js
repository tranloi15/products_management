const express = require("express");
const router = express.Router();
const controller = require("../../controller/admin/order.controller");

// [GET] /admin/orders
router.get("/", controller.index);

// [GET] /admin/orders/detail/:id
router.get("/detail/:id", controller.detail);

// [PATCH] /admin/orders/change-status/:status/:id
router.patch("/change-status/:status/:id", controller.changeStatus);

module.exports = router;