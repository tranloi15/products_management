const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    user_id: {
      type: String, 
      required: true,
      index: true,
    },
    room_chat_id: {
      type: String, 
      index: true,
    },
    content: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String, 
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ room_chat_id: 1, createdAt: 1 });

const Chat = mongoose.model("Chat", chatSchema, "chats");

module.exports = Chat;