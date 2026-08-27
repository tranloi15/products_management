const ProductCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helpers/filterStatus");

// [GET] /admin/products-category
module.exports.index = async (req, res) => {
    const filterStatus = filterStatusHelper(req.query);

    let find = {
        deleted: false,
    };

    if (req.query.status) {
        find.status = req.query.status;
    }

    // Logic Sort
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.position = "desc";
    }

    const records = await ProductCategory.find(find).sort(sort);

    res.render("admin/pages/products-category/index", {
        pageTitle: "Danh mục sản phẩm",
        records: records,
        filterStatus: filterStatus,
    });
};

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/products-category/create", {
        pageTitle: "Tạo danh mục sản phẩm",
    });
};

// [POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {
    if (req.body.position === "") {
        const count = await ProductCategory.countDocuments();
        req.body.position = count + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    const record = new ProductCategory(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;

    if (!req.body.ids || req.body.ids.trim() === "") {
        return res.redirect("back");
    }

    const ids = req.body.ids.split(", ").filter(id => id.trim() !== "");

    switch (type) {
        case "active":
            await ProductCategory.updateMany(
                { _id: { $in: ids } },
                { status: "active" }
            );
            break;

        case "inactive":
            await ProductCategory.updateMany(
                { _id: { $in: ids } },
                { status: "inactive" }
            );
            break;

        case "delete-all":
            await ProductCategory.updateMany(
                { _id: { $in: ids } },
                { deleted: true, deletedAt: new Date() }
            );
            break;

        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                if (id && position) {
                    position = parseInt(position);
                    await ProductCategory.updateOne(
                        { _id: id },
                        { position: position }
                    );
                }
            }
            break;

        default:
            break;
    }

    res.redirect("back");
};