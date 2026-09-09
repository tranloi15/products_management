const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const postSchema = new mongoose.Schema({
    title: String,
    post_category_id: {
        type: String,
        default: ""
    },
    description: String,
    content: String,
    thumbnail: String,
    status: String,
    featured: {
        type: String,
        default: "0" // "1": nổi bật, "0": không
    },
    position: Number,
    slug: {
        type: String,
        slug: "title",
        unique: true
    },
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        account_id: String,
        deletedAt: Date
    },
    updatedBy: [
        {
            account_id: String,
            updatedAt: Date
        }
    ]
}, {
    timestamps: true
});

const Post = mongoose.model("Post", postSchema, "posts");

module.exports = Post;