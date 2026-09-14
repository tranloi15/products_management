const Order = require("../../models/order.model");
const Product = require("../../models/product.model");

// [GET] /admin/orders
module.exports.index = async (req, res) => {
  // Kiểm tra quyền xem
  if (!res.locals.role.permissions.includes("orders_view")) {
    req.flash("error", "Bạn không có quyền truy cập tính năng này!");
    return res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
  }

  const orders = await Order.find({ deleted: false }).sort({ createdAt: -1 });

  for (const order of orders) {
    let totalPrice = 0;
    for (const item of order.products) {
      const productInfo = await Product.findOne({ _id: item.product_id }).select("title price discountPercentage");
      if (productInfo) {
        item.productInfo = productInfo;
        item.priceNew = (productInfo.price * (100 - productInfo.discountPercentage) / 100);
        item.totalPrice = item.priceNew * item.quantity;
        totalPrice += item.totalPrice;
      }
    }
    order.totalOrderPrice = totalPrice;
  }

  res.render("admin/pages/orders/index", {
    pageTitle: "Quản lý đơn hàng",
    orders: orders
  });
};

// [GET] /admin/orders/detail/:id
module.exports.detail = async (req, res) => {
  if (!res.locals.role.permissions.includes("orders_view")) {
    req.flash("error", "Bạn không có quyền xem chi tiết đơn hàng!");
    return res.redirect("back");
  }

  try {
    const order = await Order.findOne({ _id: req.params.id, deleted: false });

    for (const item of order.products) {
      const productInfo = await Product.findOne({ _id: item.product_id });
      item.productInfo = productInfo;
    }

    res.render("admin/pages/orders/detail", {
      pageTitle: "Chi tiết đơn hàng",
      order: order
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/orders`);
  }
};

// [PATCH] /admin/orders/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  if (!res.locals.role.permissions.includes("orders_edit")) {
    req.flash("error", "Bạn không có quyền cập nhật đơn hàng!");
    return res.redirect("back");
  }

  const { status, id } = req.params;

  await Order.updateOne({ _id: id }, { status: status });

  req.flash("success", "Cập nhật trạng thái thành công!");
  res.redirect("back");
};