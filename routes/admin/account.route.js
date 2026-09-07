const express = require("express");
const multer = require("multer");
const router = express.Router();

const controller = require("../../controller/admin/account.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const validate = require("../../validates/admin/account.validate");
const upload = multer();

router.get("/", controller.index);

router.get("/create", controller.create);
// console.log("upload.single:", typeof upload.single("avatar"));
// console.log("uploadCloud.upload:", typeof uploadCloud?.upload);
// console.log("controller.createPost:", typeof controller?.createPost);

router.post(
    "/create",
    upload.single("avatar"),
    uploadCloud.upload,
    validate.createPost,
    controller.createPost
);

module.exports = router;