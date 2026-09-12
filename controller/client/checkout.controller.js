const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const productsHelper = require("../../helpers/products");

// [GET] /checkout
module.exports.index = async (req, res) => {
    const cartId = req.cookies.cartId;

    const cart = await Cart.findOne({
        _id: cartId,
    });

    cart.totalPrice = 0;

    if (cart && cart.products.length > 0) {
        for (const item of cart.products) {
            const productId = item.product_id;
            const productInfo = await Product.findOne({
                _id: productId,
                deleted: false,
                status: "active",
            }).select("title thumbnail slug price discountPercentage");

            if (productInfo) {
                productInfo.priceNew = productsHelper.priceNewProduct(productInfo);
                item.productInfo = productInfo;
                item.totalPrice = productInfo.priceNew * item.quantity;
                cart.totalPrice += item.totalPrice;
            }
        }
    }

    res.render("client/pages/checkout/index", {
        pageTitle: "Đặt hàng",
        cartDetail: cart,
    });
};

// [POST] /checkout/order
module.exports.order = async (req, res) => {
    const cartId = req.cookies.cartId;
    const userInfo = req.body;

    const cart = await Cart.findOne({
        _id: cartId,
    });

    const products = [];

    for (const item of cart.products) {
        const objectProduct = {
            product_id: item.product_id,
            price: 0,
            discountPercentage: 0,
            quantity: item.quantity,
        };

        const productInfo = await Product.findOne({
            _id: item.product_id,
        }).select("price discountPercentage");

        if (productInfo) {
            objectProduct.price = productInfo.price;
            objectProduct.discountPercentage = productInfo.discountPercentage;
            products.push(objectProduct);
        }
    }

    const orderInfo = {
        cart_id: cartId,
        userInfo: userInfo,
        products: products,
    };

    const order = new Order(orderInfo);
    await order.save();
    await Cart.updateOne(
        { _id: cartId },
        {
            products: [],
        }
    );

    res.redirect(`/checkout/success/${order.id}`);
};

// [GET] /checkout/success/:orderId
module.exports.success = async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.orderId,
    });

    for (const item of order.products) {
        const productInfo = await Product.findOne({
            _id: item.product_id,
        }).select("title thumbnail");

        item.productInfo = productInfo;
        item.priceNew = productsHelper.priceNewProduct(item);
        item.totalPrice = item.priceNew * item.quantity;
    }

    order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);

    res.render("client/pages/checkout/success", {
        pageTitle: "Đặt hàng thành công",
        order: order,
    });
};