const Chat = require("../../models/chat.model");
const uploadToCloudinary = require("../../helpers/uploadToCloudinary");

module.exports = (req, res) => {
  const userId = res.locals.user.id;
  const fullName = res.locals.user.fullName;
  const avatar = res.locals.user.avatar || "";

  // SocketIO
  _io.once("connection", (socket) => {
    // 1. CLIENT_SEND_MESSAGE
    socket.on("CLIENT_SEND_MESSAGE", async (data) => {
      let content = "";
      let rawImages = [];

      if (typeof data === "string") {
        content = data;
      } else if (typeof data === "object" && data !== null) {
        content = data.content || "";
        rawImages = Array.isArray(data.images) ? data.images : [];
      }

      // Upload các ảnh lên Cloudinary nếu có
      const images = [];
      for (const item of rawImages) {
        if (item) {
          const url = await uploadToCloudinary(item);
          if (url) {
            images.push(url);
          }
        }
      }

      // Lưu vào database
      const chatData = {
        user_id: userId,
        content: content,
        images: images,
      };

      const chat = new Chat(chatData);
      await chat.save();

      // Trả tin nhắn realtime về cho mọi người
      _io.emit("SERVER_RETURN_MESSAGE", {
        userId: userId,
        user_id: userId,
        fullName: fullName,
        avatar: avatar,
        content: content,
        images: images,
        createdAt: chat.createdAt,
      });
    });

    // 2. CLIENT_SEND_TYPING
    socket.on("CLIENT_SEND_TYPING", (type) => {
      socket.broadcast.emit("SERVER_RETURN_TYPING", {
        userId: userId,
        fullName: fullName,
        avatar: avatar,
        type: type, // "show" | "hidden"
      });
    });
  });
  // End SocketIO
};
