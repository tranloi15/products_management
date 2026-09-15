const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer();

const controller = require("../../controller/admin/setting.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

// [GET] /admin/settings/general
router.get(
  "/general",
  (req, res, next) => {
    if (res.locals.role.permissions.includes("settings_view")) {
      next();
    } else {
      res.send("403 - Bạn không có quyền truy cập trang này!");
    }
  },
  controller.general
);

// [PATCH] /admin/settings/general
router.patch(
  "/general",
  (req, res, next) => {
    if (res.locals.role.permissions.includes("settings_edit")) {
      next();
    } else {
      res.send("403 - Bạn không có quyền chỉnh sửa cài đặt!");
    }
  },
  upload.single("logo"),
  uploadCloud.upload,
  controller.generalPatch
);

module.exports = router;