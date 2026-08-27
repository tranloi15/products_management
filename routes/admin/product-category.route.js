const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer();

const controller = require("../../controller/admin/product-category.controller");

const validate = require("../../validates/admin/product-category.validate");

const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
    "/create",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    controller.createPost
);

router.patch("/change-multi", controller.changeMulti);
module.exports = router;