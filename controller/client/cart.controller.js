const Cart = require("../../models/cart.model");

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity, 10) || 1;

        const cart = await Cart.findOne({ _id: cartId });

        if (!cart) {
            req.flash("error", "Giỏ hàng không tồn tại hoặc phiên đã hết hạn!");
            return res.redirect(req.get("Referrer") || "/");
        }

        const existProductInCart = cart.products.find(
            item => item.product_id === productId
        );

        if (existProductInCart) {
            await Cart.updateOne(
                {
                    _id: cartId,
                    "products.product_id": productId
                },
                {
                    $inc: { "products.$.quantity": quantity }
                }
            );
        } else {
            const objectCart = {
                product_id: productId,
                quantity: quantity
            };

            await Cart.updateOne(
                { _id: cartId },
                {
                    $push: { products: objectCart }
                }
            );
        }

        req.flash("success", "Đã thêm sản phẩm vào giỏ hàng!");
        res.redirect(req.get("Referrer") || "/");
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra, vui lòng thử lại!");
        res.redirect(req.get("Referrer") || "/");
    }
};