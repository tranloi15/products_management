const express = require("express");
const router = express.Router();
const controller = require("../../controller/admin/product.controller");

// [GET] /admin/products 
router.get("/", controller.index);

// [PATCH] /admin/products/change-status/:status/:id
router.patch("/change-status/:status/:id", controller.changeStatus);

// [PATCH] /admin/products/change-multi
router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteItem);

module.exports = router;