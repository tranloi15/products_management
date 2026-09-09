const ProductCategory = require("../../models/product-category.model");
const createTreeHelper = require("../../helpers/createTree");

// [GET] /
module.exports.index = async (req, res) => {
    const productsCategory = await ProductCategory.find({
        deleted: false
    });

    const newProductsCategory = createTreeHelper.createTree(productsCategory);

    res.render("client/pages/home/index", {
        pageTitle: "Trang chủ",
        layoutProductsCategory: newProductsCategory
    });
};