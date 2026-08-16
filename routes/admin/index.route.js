const systemConfig = require("../../config/system");

const dashboardRoutes = require("./dashboard.route");
const productRoutes = require("./product.route");

module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin;
    app.get(PATH_ADMIN, (req, res) => {
        res.redirect(PATH_ADMIN + "/dashboard");
    });

    app.use(PATH_ADMIN + "/dashboard", dashboardRoutes);

    app.use(PATH_ADMIN + "/products", productRoutes);
}