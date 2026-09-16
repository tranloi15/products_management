const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer();

const controller = require("../../controller/client/user.controller");
const validate = require("../../validates/client/user.validate");
const authMiddleware = require("../../middlewares/client/auth.middleware");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

// [GET] /user/register
router.get("/register", controller.register);

// [POST] /user/register
router.post(
  "/register",
  validate.registerPost,
  controller.registerPost
);

// [GET] /user/login
router.get("/login", controller.login);

// [POST] /user/login
router.post(
  "/login",
  validate.loginPost,
  controller.loginPost
);

// [GET] /user/logout
router.get("/logout", controller.logout);

// [GET] /user/password/forgot
router.get("/password/forgot", controller.forgotPassword);

// [POST] /user/password/forgot
router.post(
  "/password/forgot",
  validate.forgotPasswordPost,
  controller.forgotPasswordPost
);

// [GET] /user/password/otp
router.get("/password/otp", controller.otpPassword);

// [POST] /user/password/otp
router.post("/password/otp", controller.otpPasswordPost);

// [GET] /user/password/reset
router.get(
  "/password/reset",
  authMiddleware.requireAuth,
  controller.resetPassword
);

// [POST] /user/password/reset
router.post(
  "/password/reset",
  authMiddleware.requireAuth,
  controller.resetPasswordPost
);

// [GET] /user/info 
router.get(
  "/info",
  authMiddleware.requireAuth,
  controller.info 
);

// [GET] /user/edit
router.get(
  "/edit",
  authMiddleware.requireAuth,
  controller.edit
);

// [PATCH] /user/edit
router.patch(
  "/edit",
  authMiddleware.requireAuth,
  upload.single("avatar"),
  uploadCloud.upload,
  controller.editPatch
);

// [GET] /user/password/change
router.get(
  "/password/change",
  authMiddleware.requireAuth,
  controller.changePassword
);

// [PATCH] /user/password/change
router.patch(
  "/password/change",
  authMiddleware.requireAuth,
  controller.changePasswordPatch
);

module.exports = router;