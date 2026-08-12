const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    discountPercentage: Number,
    stock: Number,
    thumbnail: String,
    status: String,
    position: Number,
    deleted: Boolean
});

// Truyền "products" làm tham số thứ 3 để ép Mongoose đọc đúng collection này
const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;