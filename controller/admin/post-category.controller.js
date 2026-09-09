const PostCategory = require("../../models/post-category.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helpers/filterStatus");
const createTreeHelper = require("../../helpers/createTree");

// [GET] /admin/posts-category
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

    const records = await PostCategory.find(find).sort(sort);
    const newRecords = createTreeHelper.createTree(records);

    const setAuditInfo = async (items) => {
        for (const item of items) {
            if (item.createdBy?.account_id) {
                const userCreated = await Account.findOne({ _id: item.createdBy.account_id }).select("fullName");
                if (userCreated) item.accountFullName = userCreated.fullName;
            }
            const updatedBy = item.updatedBy?.slice(-1)[0];
            if (updatedBy) {
                const userUpdated = await Account.findOne({ _id: updatedBy.account_id }).select("fullName");
                if (userUpdated) updatedBy.accountFullName = userUpdated.fullName;
            }
            if (item.children && item.children.length > 0) {
                await setAuditInfo(item.children);
            }
        }
    };
    await setAuditInfo(newRecords);

    res.render("admin/pages/posts-category/index", {
        pageTitle: "Danh mục bài viết",
        records: newRecords,
        filterStatus: filterStatus,
    });
};

// [GET] /admin/posts-category/create
module.exports.create = async (req, res) => {
    const records = await PostCategory.find({ deleted: false });
    const newRecords = createTreeHelper.createTree(records);

    res.render("admin/pages/posts-category/create", {
        pageTitle: "Tạo danh mục bài viết",
        records: newRecords,
    });
};

// [POST] /admin/posts-category/create
module.exports.createPost = async (req, res) => {
    if (req.body.position === "") {
        const count = await PostCategory.countDocuments();
        req.body.position = count + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    req.body.createdBy = {
        account_id: res.locals.user.id,
        createdAt: new Date()
    };

    const record = new PostCategory(req.body);
    await record.save();

    req.flash("success", "Tạo danh mục bài viết thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/posts-category`);
};

// [GET] /admin/posts-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await PostCategory.findOne({ _id: id, deleted: false });
        const records = await PostCategory.find({ deleted: false });
        const newRecords = createTreeHelper.createTree(records);

        res.render("admin/pages/posts-category/edit", {
            pageTitle: "Chỉnh sửa danh mục bài viết",
            data: data,
            records: newRecords,
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/posts-category`);
    }
};

// [PATCH] /admin/posts-category/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;
        if (req.body.position === "") {
            const count = await PostCategory.countDocuments();
            req.body.position = count + 1;
        } else {
            req.body.position = parseInt(req.body.position);
        }

        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };

        await PostCategory.updateOne(
            { _id: id },
            {
                ...req.body,
                $push: { updatedBy: updatedBy }
            }
        );

        req.flash("success", "Cập nhật danh mục thành công!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/posts-category`);
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/posts-category`);
    }
};

// [DELETE] /admin/posts-category/delete/:id
module.exports.deleteItem = async (req, res) => {
    try {
        await PostCategory.updateOne(
            { _id: req.params.id },
            {
                deleted: true,
                deletedBy: {
                    account_id: res.locals.user.id,
                    deletedAt: new Date()
                }
            }
        );
        req.flash("success", "Xóa danh mục thành công!");
    } catch (error) {
        req.flash("error", "Xóa thất bại!");
    }
    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/posts-category`);
};

// [PATCH] /admin/posts-category/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ").filter(id => id.trim() !== "");

    const updatedBy = { account_id: res.locals.user.id, updatedAt: new Date() };

    switch (type) {
        case "active":
        case "inactive":
            await PostCategory.updateMany(
                { _id: { $in: ids } },
                { status: type, $push: { updatedBy: updatedBy } }
            );
            break;
        case "delete-all":
            await PostCategory.updateMany(
                { _id: { $in: ids } },
                { deleted: true, deletedBy: { account_id: res.locals.user.id, deletedAt: new Date() } }
            );
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                await PostCategory.updateOne(
                    { _id: id },
                    { position: parseInt(position), $push: { updatedBy: updatedBy } }
                );
            }
            break;
    }
    req.flash("success", "Cập nhật thành công!");
    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/posts-category`);
};