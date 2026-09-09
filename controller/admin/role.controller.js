const Role = require("../../models/role.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");

// [GET] /admin/roles
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    };

    const records = await Role.find(find);

    for (const record of records) {
        // Lấy thông tin người tạo
        if (record.createdBy?.account_id) {
            const userCreated = await Account.findOne({
                _id: record.createdBy.account_id
            }).select("fullName");

            if (userCreated) {
                record.accountFullName = userCreated.fullName;
            }
        }

        // Lấy thông tin người cập nhật gần nhất
        const updatedBy = record.updatedBy?.slice(-1)[0];
        if (updatedBy) {
            const userUpdated = await Account.findOne({
                _id: updatedBy.account_id
            }).select("fullName");

            if (userUpdated) {
                updatedBy.accountFullName = userUpdated.fullName;
            }
        }
    }

    res.render("admin/pages/roles/index", {
        pageTitle: "Nhóm quyền",
        records: records
    });
};

// [GET] /admin/roles/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/roles/create", {
        pageTitle: "Tạo nhóm quyền",
    });
};

// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
    try {
        req.body.createdBy = {
            account_id: res.locals.user.id,
            createdAt: new Date()
        };

        const record = new Role(req.body);
        await record.save();

        req.flash("success", "Thêm mới nhóm quyền thành công!");
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    } catch (error) {
        req.flash("error", "Tạo nhóm quyền thất bại!");
        res.redirect(`${systemConfig.prefixAdmin}/roles/create`);
    }
};

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await Role.findOne({
            _id: id,
            deleted: false
        });

        if (!data) {
            return res.redirect(`${systemConfig.prefixAdmin}/roles`);
        }

        // Lấy thông tin người tạo
        if (data.createdBy?.account_id) {
            const userCreated = await Account.findOne({
                _id: data.createdBy.account_id
            }).select("fullName");
            if (userCreated) {
                data.accountFullName = userCreated.fullName;
            }
        }

        // Lấy thông tin người sửa gần nhất
        const updatedBy = data.updatedBy?.slice(-1)[0];
        if (updatedBy) {
            const userUpdated = await Account.findOne({
                _id: updatedBy.account_id
            }).select("fullName");
            if (userUpdated) {
                updatedBy.accountFullName = userUpdated.fullName;
            }
        }

        res.render("admin/pages/roles/edit", {
            pageTitle: "Sửa nhóm quyền",
            data: data
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
};

// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;

        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };

        await Role.updateOne(
            { _id: id },
            {
                ...req.body,
                $push: { updatedBy: updatedBy }
            }
        );

        req.flash("success", "Cập nhật nhóm quyền thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật nhóm quyền thất bại!");
    }

    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/roles`);
};

// [GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const role = await Role.findOne(find);

        if (!role) {
            return res.redirect(`${systemConfig.prefixAdmin}/roles`);
        }

        res.render("admin/pages/roles/detail", {
            pageTitle: `Chi tiết nhóm quyền: ${role.title}`,
            role: role
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
};

// [DELETE] /admin/roles/delete/:id
module.exports.deleteItem = async (req, res) => {
    try {
        const id = req.params.id;

        const deletedBy = {
            account_id: res.locals.user.id,
            deletedAt: new Date()
        };

        await Role.updateOne(
            { _id: id },
            {
                deleted: true,
                deletedBy: deletedBy
            }
        );

        req.flash("success", "Xóa nhóm quyền thành công!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/roles`);
    } catch (error) {
        req.flash("error", "Xóa nhóm quyền thất bại!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/roles`);
    }
};

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
    let find = {
        deleted: false
    };

    const records = await Role.find(find);

    res.render("admin/pages/roles/permissions", {
        pageTitle: "Phân quyền",
        records: records
    });
};

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
    try {
        const permissions = JSON.parse(req.body.permissions);

        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };

        for (const item of permissions) {
            await Role.updateOne(
                { _id: item.id },
                {
                    permissions: item.permissions,
                    $push: { updatedBy: updatedBy }
                }
            );
        }

        req.flash("success", "Cập nhật phân quyền thành công!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/roles/permissions`);
    } catch (error) {
        req.flash("error", "Cập nhật phân quyền thất bại!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/roles/permissions`);
    }
};