const ProductCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helpers/filterStatus");
const createTreeHelper = require("../../helpers/createTree");

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

    const newRecords = createTreeHelper.createTree(records);

    res.render("admin/pages/products-category/index", {
        pageTitle: "Danh mục sản phẩm",
        records: newRecords,
        filterStatus: filterStatus,
    });
};

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false,
    };

    const records = await ProductCategory.find(find);

    const newRecords = createTreeHelper.createTree(records);

    res.render("admin/pages/products-category/create", {
        pageTitle: "Tạo danh mục sản phẩm",
        records: newRecords,
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

    req.flash("success", "Tạo danh mục mới thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};

// [PATCH] /admin/products-category/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;

    if (!req.body.ids || req.body.ids.trim() === "") {
        return res.redirect("back");
    }

    const ids = req.body.ids.split(", ").filter((id) => id.trim() !== "");

    switch (type) {
        case "active":
            await ProductCategory.updateMany(
                { _id: { $in: ids } },
                { status: "active" }
            );
            req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} danh mục!`);
            break;

        case "inactive":
            await ProductCategory.updateMany(
                { _id: { $in: ids } },
                { status: "inactive" }
            );
            req.flash("success", `Dừng hoạt động thành công cho ${ids.length} danh mục!`);
            break;

        case "delete-all":
            await ProductCategory.updateMany(
                { _id: { $in: ids } },
                { deleted: true, deletedAt: new Date() }
            );
            req.flash("success", `Đã xóa thành công ${ids.length} danh mục!`);
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
            req.flash("success", `Đã đổi vị trí cho ${ids.length} danh mục!`);
            break;

        default:
            break;
    }

    res.redirect("back");
};

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await ProductCategory.findOne({
            _id: id,
            deleted: false,
        });

        const records = await ProductCategory.find({
            deleted: false,
        });

        res.render("admin/pages/products-category/edit", {
            pageTitle: "Chỉnh sửa danh mục sản phẩm",
            data: data,
            records: records,
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
};

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;

        if (req.body.position === "") {
            const count = await ProductCategory.countDocuments();
            req.body.position = count + 1;
        } else {
            req.body.position = parseInt(req.body.position);
        }

        await ProductCategory.updateOne({ _id: id }, req.body);

        req.flash("success", "Cập nhật danh mục thành công!");
        res.redirect("back");
    } catch (error) {
        req.flash("error", "Cập nhật danh mục thất bại!");
        res.redirect("back");
    }
};

// [GET] /admin/products-category/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;

        const record = await ProductCategory.findOne({
            _id: id,
            deleted: false,
        });

        res.render("admin/pages/products-category/detail", {
            pageTitle: "Chi tiết danh mục",
            data: record,
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
};

// [DELETE] /admin/products-category/delete/:id
module.exports.deleteItem = async (req, res) => {
    try {
        const id = req.params.id;

        await ProductCategory.updateOne(
            { _id: id },
            {
                deleted: true,
                deletedAt: new Date(),
            }
        );

        req.flash("success", "Xóa danh mục thành công!");
        res.redirect("back");
    } catch (error) {
        req.flash("error", "Xóa danh mục thất bại!");
        res.redirect("back");
    }
};