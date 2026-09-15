const md5 = require("md5");
const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const generateHelper = require("../../helpers/generate.js");
const sendEmailHelper = require("../../helpers/sendEmail.js");
const Cart = require("../../models/cart.model");

// [GET] /user/register
module.exports.register = async (req, res) => {
  res.render("client/pages/user/register", {
    pageTitle: "Đăng ký tài khoản",
  });
};

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
  const existEmail = await User.findOne({
    email: req.body.email,
  });

  if (existEmail) {
    req.flash("error", "Email đã tồn tại!");
    res.redirect(req.get("Referrer") || "/user/register");
    return;
  }

  req.body.password = md5(req.body.password);

  const user = new User(req.body);
  await user.save();
  res.cookie("tokenUser", user.tokenUser);

  res.redirect("/");
};

// [GET] /user/login
module.exports.login = async (req, res) => {
  res.render("client/pages/user/login", {
    pageTitle: "Đăng nhập tài khoản",
  });
};

// [POST] /user/login
module.exports.loginPost = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Email không tồn tại!");
    res.redirect(req.get("Referrer") || "/user/login");
    return;
  }

  if (md5(req.body.password) != user.password) {
    req.flash("error", "Sai mật khẩu!");
    res.redirect(req.get("Referrer") || "/user/login");
    return;
  }

  if (user.status != "active") {
    req.flash("error", "Tài khoản đang bị khóa!");
    res.redirect(req.get("Referrer") || "/user/login");
    return;
  }

  // Xử lý giỏ hàng khi đăng nhập
  const cart = await Cart.findOne({
    user_id: user.id
  });

  if (cart) {
    res.cookie("cartId", cart.id);
  } else {
    await Cart.updateOne(
      {
        _id: req.cookies.cartId,
      },
      {
        user_id: user.id,
      }
    );
  }

  res.cookie("tokenUser", user.tokenUser);
  res.redirect("/");
};

// [GET] /user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");
  res.redirect("/");
};

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/user/forgot-password", {
    pageTitle: "Lấy lại mật khẩu",
  });
};

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Email không tồn tại trong hệ thống!");
    res.redirect(req.get("Referrer") || "/user/password/forgot");
    return;
  }

  const otp = generateHelper.generateRandomNumber(6);

  // Việc 1: Lưu email, OTP vào database
  const forgotPasswordData = {
    email: email,
    otp: otp,
    expireAt: Date.now(),
  };

  const forgotPassword = new ForgotPassword(forgotPasswordData);
  await forgotPassword.save();

  // Việc 2: Gửi mã OTP qua email của user
  const subject = "Mã OTP lấy lại mật khẩu.";
  const htmlSendMail = `Mã OTP xác thực của bạn là <b style="color: green;">${otp}</b>. Mã OTP có hiệu lực trong 3 phút. Vui lòng không cung cấp mã OTP cho người khác.`;
  sendEmailHelper.sendEmail(email, subject, htmlSendMail);
  
  res.redirect(`/user/password/otp?email=${email}`);
};

// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.query.email;

  res.render("client/pages/user/otp-password", {
    pageTitle: "Xác thực OTP",
    email: email,
  });
};

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });

  if (!result) {
    req.flash("error", "OTP không hợp lệ!");
    res.redirect(req.get("Referrer") || `/user/password/otp?email=${email}`);
    return;
  }

  const user = await User.findOne({
    email: email,
  });

  res.cookie("tokenUser", user.tokenUser);
  res.redirect("/user/password/reset");
};

// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
  res.render("client/pages/user/reset-password", {
    pageTitle: "Đổi mật khẩu mới",
  });
};

// [POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
  const password = req.body.password;
  const tokenUser = req.cookies.tokenUser;

  await User.updateOne(
    {
      tokenUser: tokenUser,
      deleted: false,
    },
    {
      password: md5(password),
    }
  );

  res.redirect("/");
};

// [GET] /user/info
module.exports.info = async (req, res) => {
  res.render("client/pages/user/info", {
    pageTitle: "Thông tin tài khoản",
    infoUser: res.locals.user,
  });
};

// [GET] /user/edit
module.exports.edit = async (req, res) => {
  res.render("client/pages/user/edit", {
    pageTitle: "Chỉnh sửa thông tin cá nhân",
    user: res.locals.user,
  });
};

// [PATCH] /user/edit
module.exports.editPatch = async (req, res) => {
  try {
    const dataUpdate = {
      fullName: req.body.fullName,
      phone: req.body.phone,
    };

    if (req.body.avatar) {
      dataUpdate.avatar = req.body.avatar;
    }

    await User.updateOne(
      {
        _id: res.locals.user.id,
      },
      dataUpdate
    );

    req.flash("success", "Cập nhật thông tin thành công!");
  } catch (error) {
    req.flash("error", "Cập nhật thất bại!");
  }

  res.redirect("/user/info");
};
// [GET] /user/password/change
module.exports.changePassword = async (req, res) => {
  res.render("client/pages/user/change-password", {
    pageTitle: "Đổi mật khẩu",
  });
};

// [PATCH] /user/password/change
module.exports.changePasswordPatch = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = res.locals.user.id;

  const user = await User.findOne({
    _id: userId,
    deleted: false,
  });

  if (md5(currentPassword) !== user.password) {
    req.flash("error", "Mật khẩu hiện tại không chính xác!");
    return res.redirect(req.get("Referrer") || "/user/password/change");
  }

  if (newPassword !== confirmPassword) {
    req.flash("error", "Xác nhận mật khẩu mới không khớp!");
    return res.redirect(req.get("Referrer") || "/user/password/change");
  }

  if (md5(newPassword) === user.password) {
    req.flash("error", "Mật khẩu mới không được trùng với mật khẩu cũ!");
    return res.redirect(req.get("Referrer") || "/user/password/change");
  }

  await User.updateOne(
    { _id: userId },
    { password: md5(newPassword) }
  );

  req.flash("success", "Đổi mật khẩu thành công!");
  res.redirect("/user/info");
};