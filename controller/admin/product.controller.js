const Product = require("../../models/product.model");
const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helpers/filterStatus.js");
const searchHelper = require("../../helpers/search.js");
const paginationHelper = require("../../helpers/pagination.js");

// [GET] /admin/products
module.exports.index = async (req, res) => {
    const filterStatus = filterStatusHelper(req.query);

    let find = { deleted: false };

    if (req.query.status) {
        find.status = req.query.status;
    }

    const objectSearch = searchHelper(req.query);

    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }

    // Pagination
    const countProducts = await Product.countDocuments(find);

    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 4,
        },
        req.query,
        countProducts
    );

    const products = await Product.find(find)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination,
    });
};

const mongoose = require("mongoose");

// [GET] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    if (id && id !== "back") {
        await Product.updateOne(
            { _id: id },
            { status: status }
        );
    }

    const referer = req.get("referer");
    if (referer) {
        res.redirect(referer);
    } else {
        res.redirect("/admin/products");
    }
};
// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;

        await Product.updateOne({ _id: id }, req.body);

        req.flash("success", "Cập nhật sản phẩm thành công!");
        res.redirect("back");
    } catch (error) {
        req.flash("error", "Cập nhật sản phẩm thất bại!");
        res.redirect("back");
    }
};
// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "active":
            await Product.updateMany({ _id: { $in: ids } }, { status: "active" });
            break;
        case "inactive":
            await Product.updateMany({ _id: { $in: ids } }, { status: "inactive" });
            break;
        default:
            break;
    }

    res.redirect("back");
};