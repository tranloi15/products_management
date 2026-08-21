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

// [GET] /admin/products/create
router.get("/create", controller.create);

// [POST] /admin/products/create (Giữ lại route đầy đủ upload và validate)
router.post(
    "/create",
    upload.single("thumbnail"),
    validate.createPost,
    controller.createPost
);

// [GET] /admin/products/edit/:id
router.get("/edit/:id", controller.edit);

// [PATCH] /admin/products/edit/:id
router.patch(
    "/edit/:id",
    upload.single("thumbnail"),
    validate.createPost,
    controller.editPatch
);


module.exports = router;