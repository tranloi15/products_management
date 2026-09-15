const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/user.controller");

// [GET] /admin/users (Cần quyền users_view)
router.get(
  "/",
  (req, res, next) => {
    if (res.locals.role.permissions.includes("users_view")) {
      next();
    } else {
      res.send("403 - Bạn không có quyền xem danh sách người dùng!");
    }
  },
  controller.index
);

// [PATCH] /admin/users/change-status/:status/:id (Cần quyền users_edit)
router.patch(
  "/change-status/:status/:id",
  (req, res, next) => {
    if (res.locals.role.permissions.includes("users_edit")) {
      next();
    } else {
      res.send("403 - Bạn không có quyền cập nhật trạng thái!");
    }
  },
  controller.changeStatus
);

// [DELETE] /admin/users/delete/:id (Cần quyền users_delete)
router.delete(
  "/delete/:id",
  (req, res, next) => {
    if (res.locals.role.permissions.includes("users_delete")) {
      next();
    } else {
      res.send("403 - Bạn không có quyền xóa người dùng!");
    }
  },
  controller.deleteItem
);

module.exports = router;