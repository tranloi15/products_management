const Product = require("../../models/product.model");

// [GET] /admin/products
module.exports.index = async (req, res) => {
    let filterStatus = [
        { name: "Tất cả", status: "", class: "" },
        { name: "Hoạt động", status: "active", class: "" },
        { name: "Dừng hoạt động", status: "inactive", class: "" }
    ];

    // Xử lý active đúng 1 nút tương ứng
    if (req.query.status) {
        const index = filterStatus.findIndex(item => item.status == req.query.status);
        if (index !== -1) filterStatus[index].class = "active";
    } else {
        const index = filterStatus.findIndex(item => item.status == "");
        if (index !== -1) filterStatus[index].class = "active";
    }

    // Điều kiện lọc MongoDB
    let find = { deleted: false };
    if (req.query.status) {
        find.status = req.query.status;
    }

    const products = await Product.find(find);

    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus
    });
};