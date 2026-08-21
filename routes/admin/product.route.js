const express = require("express");
const multer = require("multer");
const router = express.Router();
const storageMulter = require("../../helpers/storageMulter");
const upload = multer({ storage: storageMulter() });
const controller = require("../../controller/admin/product.controller");
const validate = require("../../validates/admin/products.validate");

// [GET] /admin/products 
router.get("/", controller.index);

// [PATCH] /admin/products/change-status/:status/:id
router.patch("/change-status/:status/:id", controller.changeStatus);

// [PATCH] /admin/products/change-multi
router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteItem);

router.get("/create", controller.create);

router.post("/create", controller.createPost);

router.post(
    "/create",
    upload.single("thumbnail"),
    validate.createPost,
    controller.createPost);

module.exports = router;