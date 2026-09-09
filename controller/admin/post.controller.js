const Post = require("../../models/post.model");
const PostCategory = require("../../models/post-category.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const createTreeHelper = require("../../helpers/createTree");

// [GET] /admin/posts
module.exports.index = async (req, res) => {
    const filterStatus = filterStatusHelper(req.query);
    let find = { deleted: false };

    if (req.query.status) find.status = req.query.status;

    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) find.title = objectSearch.regex;

    // Pagination
    const countPosts = await Post.countDocuments(find);
    let objectPagination = paginationHelper(
        { currentPage: 1, limitItems: 5 },
        req.query,
        countPosts
    );

    // Sort
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.position = "desc";
    }

    const posts = await Post.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    for (const post of posts) {
        if (post.createdBy?.account_id) {
            const user = await Account.findOne({ _id: post.createdBy.account_id }).select("fullName");
            if (user) post.accountFullName = user.fullName;
        }

        const updatedBy = post.updatedBy?.slice(-1)[0];
        if (updatedBy) {
            const userUpdated = await Account.findOne({ _id: updatedBy.account_id }).select("fullName");
            if (userUpdated) updatedBy.accountFullName = userUpdated.fullName;
        }
    }

    res.render("admin/pages/posts/index", {
        pageTitle: "Danh sách bài viết",
        posts: posts,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination,
    });
};

// [GET] /admin/posts/create
module.exports.create = async (req, res) => {
    const category = await PostCategory.find({ deleted: false });
    const newCategory = createTreeHelper.createTree(category);

    res.render("admin/pages/posts/create", {
        pageTitle: "Thêm mới bài viết",
        category: newCategory
    });
};

// [POST] /admin/posts/create
module.exports.createPost = async (req, res) => {
    if (req.body.position === "") {
        const count = await Post.countDocuments();
        req.body.position = count + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    req.body.createdBy = {
        account_id: res.locals.user.id,
        createdAt: new Date()
    };

    const post = new Post(req.body);
    await post.save();

    req.flash("success", "Thêm mới bài viết thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/posts`);
};

// [GET] /admin/posts/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, deleted: false });
        const category = await PostCategory.find({ deleted: false });
        const newCategory = createTreeHelper.createTree(category);

        res.render("admin/pages/posts/edit", {
            pageTitle: "Chỉnh sửa bài viết",
            post: post,
            category: newCategory
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/posts`);
    }
};

// [PATCH] /admin/posts/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;
        req.body.position = parseInt(req.body.position);

        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };

        await Post.updateOne(
            { _id: id },
            {
                ...req.body,
                $push: { updatedBy: updatedBy }
            }
        );

        req.flash("success", "Cập nhật bài viết thành công!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/posts`);
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!");
        res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/posts`);
    }
};

// [PATCH] /admin/posts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const { id, status } = req.params;
    const updatedBy = { account_id: res.locals.user.id, updatedAt: new Date() };

    await Post.updateOne({ _id: id }, { status: status, $push: { updatedBy: updatedBy } });
    req.flash("success", "Đổi trạng thái thành công!");
    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/posts`);
};

// [DELETE] /admin/posts/delete/:id
module.exports.deleteItem = async (req, res) => {
    await Post.updateOne(
        { _id: req.params.id },
        {
            deleted: true,
            deletedBy: {
                account_id: res.locals.user.id,
                deletedAt: new Date()
            }
        }
    );
    req.flash("success", "Xóa bài viết thành công!");
    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/posts`);
};

// [PATCH] /admin/posts/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ").filter(id => id.trim() !== "");
    const updatedBy = { account_id: res.locals.user.id, updatedAt: new Date() };

    switch (type) {
        case "active":
        case "inactive":
            await Post.updateMany(
                { _id: { $in: ids } },
                { status: type, $push: { updatedBy: updatedBy } }
            );
            break;
        case "delete-all":
            await Post.updateMany(
                { _id: { $in: ids } },
                { deleted: true, deletedBy: { account_id: res.locals.user.id, deletedAt: new Date() } }
            );
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                await Post.updateOne(
                    { _id: id },
                    { position: parseInt(position), $push: { updatedBy: updatedBy } }
                );
            }
            break;
    }

    req.flash("success", "Cập nhật nhiều bài viết thành công!");
    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/posts`);
};