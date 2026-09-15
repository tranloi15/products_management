const User = require("../../models/user.model");

// [GET] /admin/users
module.exports.index = async (req, res) => {
  const find = {
    deleted: false,
  };

  const records = await User.find(find).select("-password -tokenUser");

  res.render("admin/pages/users/index", {
    pageTitle: "Danh sách người dùng client",
    records: records,
  });
};

// [PATCH] /admin/users/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const { status, id } = req.params;

  await User.updateOne({ _id: id }, { status: status });

  req.flash("success", "Cập nhật trạng thái thành công!");
  res.redirect(req.get("Referrer") || "/admin/users");
};

// [DELETE] /admin/users/delete/:id
module.exports.deleteItem = async (req, res) => {
  const { id } = req.params;

  await User.updateOne(
    { _id: id },
    {
      deleted: true,
      deletedAt: new Date(),
    }
  );

  req.flash("success", "Xóa tài khoản thành công!");
  res.redirect(req.get("Referrer") || "/admin/users");
};