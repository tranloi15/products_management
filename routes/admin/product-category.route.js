const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer();

const controller = require("../../controller/admin/product-category.controller");
const validate = require("../../validates/admin/product-category.validate");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

// [GET] /admin/products-category
router.get("/", controller.index);

// [GET] /admin/products-category/create
router.get("/create", controller.create);

// [POST] /admin/products-category/create
router.post(
    "/create",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    controller.createPost
);

// [PATCH] /admin/products-category/change-multi
router.patch("/change-multi", controller.changeMulti);

// [GET] /admin/products-category/edit/:id
router.get("/edit/:id", controller.edit);

// [PATCH] /admin/products-category/edit/:id
router.patch(
    "/edit/:id",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    controller.editPatch
);
// [GET] /admin/products-category/detail/:id
router.get("/detail/:id", controller.detail);
// [DELETE] /admin/products-category/delete/:id
router.delete("/delete/:id", controller.deleteItem);
module.exports = router;