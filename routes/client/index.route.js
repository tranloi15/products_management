const homeRoute = require("./home.route");
const productRoute = require("./product.route");
const postRoutes = require("./post.route");
const searchRoute = require("./search.route");

const categoryMiddleware = require("../../middlewares/client/category.middleware");

module.exports = (app) => {
    app.use(categoryMiddleware.category);

    app.use("/", homeRoute);

    app.use("/products", productRoute);

    app.use("/posts", postRoutes);

    app.use("/search", searchRoute);
};