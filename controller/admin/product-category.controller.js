const productCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helpers/filterStatus");
const createTreeHelper = require("../../helpers/createTree");
const Account = require("../../models/account.model");

// [GET] /admin/products-category
module.exports.index = async (req, res) => {
    const filterStatus = filterStatusHelper(req.query);

    let find = { deleted: false };

    if (req.query.status) {
        find.status = req.query.status;
    }

    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.position = "desc";
    }

    const records = await productCategory.find(find).sort(sort);
    const newRecords = createTreeHelper.createTree(records);

    const setAuditInfo = async (items) => {
        for (const item of items) {
            // Người tạo
            if (item.createdBy?.account_id) {
                const userCreated = await Account.findOne({ _id: item.createdBy.account_id }).select("fullName");
                if (userCreated) {
                    item.accountFullName = userCreated.fullName;
                }
            }

            const updatedBy = item.updatedBy?.slice(-1)[0];
            if (updatedBy) {
                const userUpdated = await Account.findOne({ _id: updatedBy.account_id }).select("fullName");
                if (userUpdated) {
                    updatedBy.accountFullName = userUpdated.fullName;
                }
            }

            if (item.children && item.children.length > 0) {
                await setAuditInfo(item.children);
            }
        }
    };

    await setAuditInfo(newRecords);

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

    const records = await productCategory.find(find);
    const newRecords = createTreeHelper.createTree(records);

    res.render("admin/pages/products-category/create", {
        pageTitle: "Tạo danh mục sản phẩm",
        records: newRecords,
    });
};

// [POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {
    if (req.body.position === "") {
        const count = await productCategory.countDocuments();
        req.body.position = count + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    // Ghi nhận thông tin người tạo
    req.body.createdBy = {
        account_id: res.locals.user.id,
        createdAt: new Date()
    };

    const record = new productCategory(req.body);
    await record.save();

    req.flash("success", "Tạo danh mục mới thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};

// [PATCH] /admin/products-category/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;

    if (!req.body.ids || req.body.ids.trim() === "") {
        return res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/products-category`);
    }

    const ids = req.body.ids.split(", ").filter((id) => id.trim() !== "");

    // Thông tin người sửa
    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    };

    // Thông tin người xóa
    const deletedBy = {
        account_id: res.locals.user.id,
        deletedAt: new Date()
    };

    switch (type) {
        case "active":
            await productCategory.updateMany(
                { _id: { $in: ids } },
                {
                    status: "active",
                    $push: { updatedBy: updatedBy }
                }
            );
            req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} danh mục!`);
            break;

        case "inactive":
            await productCategory.updateMany(
                { _id: { $in: ids } },
                {
                    status: "inactive",
                    $push: { updatedBy: updatedBy }
                }
            );
            req.flash("success", `Dừng hoạt động thành công cho ${ids.length} danh mục!`);
            break;

        case "delete-all":
            await productCategory.updateMany(
                { _id: { $in: ids } },
                {
                    deleted: true,
                    deletedBy: deletedBy
                }
            );
            req.flash("success", `Đã xóa thành công ${ids.length} danh mục!`);
            break;

        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                if (id && position) {
                    position = parseInt(position);
                    await productCategory.updateOne(
                        { _id: id },
                        {
                            position: position,
                            $push: { updatedBy: updatedBy }
                        }
                    );
                }
            }
            req.flash("success", `Đã đổi vị trí cho ${ids.length} danh mục!`);
            break;

        default:
            break;
    }

    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/products-category`);
};

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await productCategory.findOne({
            _id: id,
            deleted: false,
        });

        const records = await productCategory.find({
            deleted: false,
        });

        const newRecords = createTreeHelper.createTree(records);

        res.render("admin/pages/products-category/edit", {
            pageTitle: "Chỉnh sửa danh mục sản phẩm",
            data: data,
            records: newRecords,
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
            const count = await productCategory.countDocuments();
            req.body.position = count + 1;
        } else {
            req.body.position = parseInt(req.body.position);
        }

        // Tạo object thông tin người cập nhật
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };

        // Lưu thông tin form và thêm bản ghi vào mảng updatedBy
        await productCategory.updateOne(
            { _id: id },
            {
                ...req.body,
                $push: { updatedBy: updatedBy }
            }
        );

        req.flash("success", "Cập nhật danh mục thành công!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/products-category`);
    } catch (error) {
        req.flash("error", "Cập nhật danh mục thất bại!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/products-category`);
    }
};

// [GET] /admin/products-category/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;

        const record = await productCategory.findOne({
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

        const deletedBy = {
            account_id: res.locals.user.id,
            deletedAt: new Date()
        };

        await productCategory.updateOne(
            { _id: id },
            {
                deleted: true,
                deletedBy: deletedBy
            }
        );

        req.flash("success", "Xóa danh mục thành công!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/products-category`);
    } catch (error) {
        req.flash("error", "Xóa danh mục thất bại!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/products-category`);
    }
};