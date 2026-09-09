const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const productsHelper = require("../../helpers/products");

// [GET] /products
module.exports.index = async (req, res) => {
    const products = await Product.find({
        status: "active",
        deleted: false,
    }).sort({ position: "desc" });

    const newProducts = productsHelper.priceNewProducts(products);

    res.render("client/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        products: newProducts,
    });
};

// [GET] /products/:slug
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            slug: req.params.slug,
            status: "active",
        };

        const product = await Product.findOne(find);

        if (!product) {
            return res.redirect("/products");
        }

        if (product.product_category_id) {
            const category = await ProductCategory.findOne({
                _id: product.product_category_id,
                status: "active",
                deleted: false,
            });
            product.category = category;
        }
        product.priceNew = productsHelper.priceNewProduct
            ? productsHelper.priceNewProduct(product)
            : (
                (product.price * (100 - product.discountPercentage)) /
                100
            ).toFixed(0);

        res.render("client/pages/products/detail", {
            pageTitle: product.title,
            product: product,
        });
    } catch (error) {
        res.redirect("/products");
    }
};