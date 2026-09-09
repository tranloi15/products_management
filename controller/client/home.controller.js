const ProductCategory = require("../../models/product-category.model");
const createTreeHelper = require("../../helpers/createTree");
const Product = require("../../models/product.model");
const productsHelper = require("../../helpers/products");

// [GET] /
module.exports.index = async (req, res) => {
    const productsFeatured = await Product.find({
        featured: "1",
        deleted: false,
        status: "active"
    }).limit(6);

    const newProductsFeatured = productsHelper.priceNewProducts(productsFeatured);

    const productsNew = await Product.find({
        deleted: false,
        status: "active"
    }).sort({ position: "desc" }).limit(6);

    const newProductsNew = productsHelper.priceNewProducts(productsNew);

    const productsCategory = await ProductCategory.find({
        deleted: false
    });
    const newProductsCategory = createTreeHelper.createTree(productsCategory);

    res.render("client/pages/home/index", {
        pageTitle: "Trang chủ",
        layoutProductsCategory: newProductsCategory,
        productsFeatured: newProductsFeatured,
        productsNew: newProductsNew
    });
};