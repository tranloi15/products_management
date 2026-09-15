const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer();

const controller = require("../../controller/client/user.controller");
const validate = require("../../validates/client/user.validate");
const authMiddleware = require("../../middlewares/client/auth.middleware");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

router.get("/register", controller.register);

router.post(
  "/register",
  validate.registerPost,
  controller.registerPost
);

router.get("/login", controller.login);

router.post(
  "/login",
  validate.loginPost,
  controller.loginPost
);

router.get("/logout", controller.logout);

router.get("/password/forgot", controller.forgotPassword);

router.post(
  "/password/forgot",
  validate.forgotPasswordPost,
  controller.forgotPasswordPost
);

router.get("/password/otp", controller.otpPassword);

router.post("/password/otp", controller.otpPasswordPost);

router.get("/password/reset", controller.resetPassword);

router.post(
  "/password/reset",
  validate.resetPasswordPost,
  controller.resetPasswordPost
);

// Xem thông tin cá nhân
router.get("/info", authMiddleware.requireAuth, controller.info);

// Chỉnh sửa thông tin cá nhân
router.get("/edit", authMiddleware.requireAuth, controller.edit);

router.patch(
  "/edit",
  authMiddleware.requireAuth,
  upload.single("avatar"),
  uploadCloud.upload,
  controller.editPatch
);

// [GET] /user/password/change
router.get("/password/change", authMiddleware.requireAuth, controller.changePassword);

// [PATCH] /user/password/change
router.patch("/password/change", authMiddleware.requireAuth, controller.changePasswordPatch);

module.exports = router;