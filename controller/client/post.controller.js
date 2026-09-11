const Post = require("../../models/post.model");
const PostCategory = require("../../models/post-category.model");

// [GET] /posts
module.exports.index = async (req, res) => {
    try {
        const posts = await Post.find({
            status: "active",
            deleted: false,
        }).sort({ position: "desc" });

        res.render("client/pages/posts/index", {
            pageTitle: "Danh sách bài viết",
            posts: posts,
        });
    } catch (error) {
        console.error(error);
        res.redirect("/");
    }
};

// [GET] /posts/detail/:slugPost
module.exports.detail = async (req, res) => {
    try {
        const slugPost = req.params.slugPost;

        const find = {
            deleted: false,
            slug: slugPost,
            status: "active",
        };

        const post = await Post.findOne(find);

        if (!post) {
            return res.redirect("/posts");
        }

        if (post.post_category_id) {
            const category = await PostCategory.findOne({
                _id: post.post_category_id,
                status: "active",
                deleted: false,
            });
            post.category = category;
        }

        res.render("client/pages/posts/detail", {
            pageTitle: post.title,
            post: post,
        });
    } catch (error) {
        console.error(error);
        res.redirect("/posts");
    }
};