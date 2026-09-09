const Product = require("../../models/product.model");
const productCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helpers/filterStatus.js");
const searchHelper = require("../../helpers/search.js");
const paginationHelper = require("../../helpers/pagination.js");
const createTreeHelper = require("../../helpers/createTree");
const Account = require("../../models/account.model");

// [GET] /admin/products
module.exports.index = async (req, res) => {
    const filterStatus = filterStatusHelper(req.query);

    let find = { deleted: false };

    if (req.query.status) {
        find.status = req.query.status;
    }

    const objectSearch = searchHelper(req.query);

    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }

    // Pagination
    const countProducts = await Product.countDocuments(find);

    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 4,
        },
        req.query,
        countProducts
    );

    // Sắp xếp
    const sort = {};

    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.position = "desc";
    }

    const products = await Product.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    for (const product of products) {
        // Lấy thông tin người tạo
        if (product.createdBy?.account_id) {
            const user = await Account.findOne({
                _id: product.createdBy.account_id
            });

            if (user) {
                product.accountFullName = user.fullName;
            }
        }

        // Lấy thông tin người cập nhật gần nhất
        const updatedBy = product.updatedBy?.slice(-1)[0];
        if (updatedBy?.account_id) {
            const userUpdated = await Account.findOne({
                _id: updatedBy.account_id
            });

            if (userUpdated) {
                updatedBy.accountFullName = userUpdated.fullName;
            }
        }
    }

    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination,
    });
};

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await Product.updateOne({ _id: id }, { status: status });
    req.flash("success", "Cập nhật trạng thái thành công!");
    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/products`);
};

// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ").filter(id => id.trim() !== "");

    if (ids.length === 0) {
        return res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/products`);
    }

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    };

    switch (type) {
        case "active":
            await Product.updateMany(
                { _id: { $in: ids } },
                {
                    status: "active",
                    $push: { updatedBy: updatedBy }
                }
            );
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;

        case "inactive":
            await Product.updateMany(
                { _id: { $in: ids } },
                {
                    status: "inactive",
                    $push: { updatedBy: updatedBy }
                }
            );
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;

        case "delete-all":
            await Product.updateMany(
                { _id: { $in: ids } },
                {
                    deleted: true,
                    deletedBy: {
                        account_id: res.locals.user.id,
                        deletedAt: new Date()
                    }
                }
            );
            req.flash("success", `Đã xóa thành công ${ids.length} sản phẩm!`);
            break;

        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);

                await Product.updateOne(
                    { _id: id },
                    {
                        position: position,
                        $push: { updatedBy: updatedBy }
                    }
                );
            }
            req.flash("success", `Đã đổi vị trí thành công ${ids.length} sản phẩm!`);
            break;

        default:
            break;
    }

    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/products`);
};

// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    await Product.updateOne(
        { _id: id },
        {
            deleted: true,
            deletedBy: {
                account_id: res.locals.user.id,
                deletedAt: new Date(),
            }
        }
    );

    req.flash("success", "Đã xóa thành công sản phẩm!");
    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/products`);
};

// [GET] /admin/products/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };

    const category = await productCategory.find(find);
    const newCategory = createTreeHelper.createTree(category);

    res.render("admin/pages/products/create", {
        pageTitle: "Thêm mới sản phẩm",
        category: newCategory
    });
};

// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {
    req.body.price = parseInt(req.body.price) || 0;
    req.body.discountPercentage = parseInt(req.body.discountPercentage) || 0;
    req.body.stock = parseInt(req.body.stock) || 0;

    if (!req.body.position || req.body.position === "") {
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    req.body.createdBy = {
        account_id: res.locals.user.id
    };

    const product = new Product(req.body);
    await product.save();

    res.redirect(`${systemConfig.prefixAdmin}/products`);
};

// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);

        const category = await productCategory.find({
            deleted: false
        });
        const newCategory = createTreeHelper.createTree(category);

        res.render("admin/pages/products/edit", {
            pageTitle: "Chỉnh sửa sản phẩm",
            product: product,
            category: newCategory
        });
    } catch (error) {
        req.flash("error", "Không tìm thấy sản phẩm!");
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
};

// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    req.body.price = parseInt(req.body.price) || 0;
    req.body.discountPercentage = parseInt(req.body.discountPercentage) || 0;
    req.body.stock = parseInt(req.body.stock) || 0;
    req.body.position = parseInt(req.body.position) || 1;

    try {
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };

        await Product.updateOne(
            { _id: id },
            {
                ...req.body,
                $push: { updatedBy: updatedBy }
            }
        );
        req.flash("success", "Cập nhật thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!");
    }

    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/products`);
};

// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);

        res.render("admin/pages/products/detail", {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
};