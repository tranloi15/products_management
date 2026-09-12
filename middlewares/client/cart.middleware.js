const Cart = require("../../models/cart.model");

module.exports.cartId = async (req, res, next) => {
    if (!req.cookies.cartId) {
        const cart = new Cart();
        await cart.save();

        const expiresTime = 1000 * 60 * 60 * 24 * 365;

        res.cookie("cartId", cart.id, {
            expires: new Date(Date.now() + expiresTime)
        });
        req.cookies.cartId = cart.id;
        res.locals.miniCart = cart;
    } else {
        const cart = await Cart.findOne({
            _id: req.cookies.cartId
        });

        if (cart) {
            cart.totalQuantity = cart.products.reduce((sum, item) => sum + item.quantity, 0);
            res.locals.miniCart = cart;
        } else {
            res.clearCookie("cartId");
            const newCart = new Cart();
            await newCart.save();

            const expiresTime = 1000 * 60 * 60 * 24 * 365;
            res.cookie("cartId", newCart.id, {
                expires: new Date(Date.now() + expiresTime)
            });
            req.cookies.cartId = newCart.id;
            res.locals.miniCart = newCart;
        }
    }

    next();
};