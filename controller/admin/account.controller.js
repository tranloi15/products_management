const Role = require("../../models/role.model");
const Account = require("../../models/account.model");
const md5 = require('md5');

const generateHelper = require("../../helpers/generate");
const systemConfig = require("../../config/system");

// [GET] /admin/accounts
module.exports.index = async (req, res) => {
    let find = {
        deleted: false,
    };

    const records = await Account.find(find).select("-password -token");

    for (const record of records) {
        const role = await Role.findOne({
            _id: record.role_id,
            deleted: false
        });
        record.role = role;
    }

    res.render("admin/pages/accounts/index", {
        pageTitle: "Danh sách tài khoản",
        records: records,
    });
}

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
    const roles = await Role.find({
        deleted: false
    });

    res.render("admin/pages/accounts/create", {
        pageTitle: "Tạo mới tài khoản",
        roles: roles
    });
};
// [POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
    const emailExist = await Account.findOne({
        email: req.body.email,
        deleted: false
    });

    console.log(emailExist);

    if (emailExist) {
        req.flash("error", `Email ${req.body.email} đã tồn tại`);
        res.redirect(`${systemConfig.prefixAdmin}/accounts/create`);
    } else {
        req.body.password = md5(req.body.password);

        const record = new Account(req.body);
        await record.save();

        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
};
// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
    let find = {
        _id: req.params.id,
        deleted: false,
    };

    try {
        const data = await Account.findOne(find);

        const roles = await Role.find({
            deleted: false,
        });

        res.render("admin/pages/accounts/edit", {
            pageTitle: "Chỉnh sửa tài khoản",
            data: data,
            roles: roles,
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
};
// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    try {
        const emailExist = await Account.findOne({
            _id: { $ne: id },
            email: req.body.email,
            deleted: false
        });

        if (emailExist) {
            req.flash("error", `Email ${req.body.email} đã tồn tại!`);
            return res.redirect("back");
        }

        if (req.body.password) {
            req.body.password = md5(req.body.password);
        } else {
            delete req.body.password;
        }

        await Account.updateOne({ _id: id }, req.body);

        req.flash("success", "Cập nhật tài khoản thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật tài khoản thất bại!");
    }

    res.redirect("back");
};
// [GET] /admin/accounts/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await Account.findOne({
            _id: id,
            deleted: false
        }).select("-password -token");

        if (!data) {
            req.flash("error", "Tài khoản không tồn tại!");
            return res.redirect(`${systemConfig.prefixAdmin}/accounts`);
        }

        let role = null;
        if (data.role_id) {
            role = await Role.findOne({
                _id: data.role_id,
                deleted: false
            });
        }

        res.render("admin/pages/accounts/detail", {
            pageTitle: "Chi tiết tài khoản",
            data: data,
            role: role
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
};
// [DELETE] /admin/accounts/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    try {
        await Account.updateOne(
            { _id: id },
            {
                deleted: true,
                deletedAt: new Date()
            }
        );

        req.flash("success", "Xóa tài khoản thành công!");
    } catch (error) {
        req.flash("error", "Xóa tài khoản thất bại!");
    }

    res.redirect("back");
};