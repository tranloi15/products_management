const express = require("express");
const router = express.Router();

// [GET] /admin/dashboard/ 
router.get("/", (req, res) => {
    res.render("admin/pages/dashboard/index", {
        pageTitle: "Trang tổng quan"
    });
});

module.exports = router;