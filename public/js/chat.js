// Kiểm tra xem trang có khung chat không
const chatElement = document.querySelector(".chat");

if (chatElement && typeof socket !== "undefined") {
  const bodyChat = document.querySelector(".chat .inner-body");
  const formSendData = document.querySelector(".chat .inner-form");
  const inputContent = formSendData ? formSendData.querySelector("input[name='content']") : null;
  const inputUploadImage = document.querySelector("#file-upload-chat");
  const previewContainer = document.querySelector("#preview-images-container");
  const buttonIcon = document.querySelector(".button-icon");
  const tooltipEmoji = document.querySelector(".tooltip-emoji-picker");
  const emojiPicker = document.querySelector("emoji-picker");

  let selectedImages = [];
  let timeOutTyping;
  let galleryViewer = null;

  // ==========================================
  // 1. Tự động cuộn xuống cuối khung chat
  // ==========================================
  const scrollToBottom = () => {
    if (bodyChat) {
      bodyChat.scrollTop = bodyChat.scrollHeight;
    }
  };
  scrollToBottom();

  // ==========================================
  // 2. Khởi tạo ViewerJS xem ảnh phóng to
  // ==========================================
  const initGallery = () => {
    if (typeof Viewer !== "undefined" && bodyChat) {
      if (galleryViewer) {
        galleryViewer.destroy();
      }
      galleryViewer = new Viewer(bodyChat, {
        navbar: false,
        title: false,
        toolbar: {
          zoomIn: 1,
          zoomOut: 1,
          oneToOne: 1,
          reset: 1,
          prev: 0,
          play: 0,
          next: 0,
          rotateLeft: 1,
          rotateRight: 1,
          flipHorizontal: 1,
          flipVertical: 1,
        },
      });
    }
  };
  initGallery();

  // ==========================================
  // 3. Xử lý xem trước ảnh khi chọn (Preview)
  // ==========================================
  const renderPreviewImages = () => {
    if (!previewContainer) return;
    previewContainer.innerHTML = "";

    selectedImages.forEach((imgBase64, index) => {
      const item = document.createElement("div");
      item.classList.add("preview-image-item");
      item.innerHTML = `
        <img src="${imgBase64}" alt="Preview ảnh">
        <button type="button" class="btn-remove-preview" data-index="${index}">&times;</button>
      `;
      previewContainer.appendChild(item);
    });

    // Nút xóa ảnh đã chọn
    const removeButtons = previewContainer.querySelectorAll(".btn-remove-preview");
    removeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.getAttribute("data-index"));
        selectedImages.splice(index, 1);
        renderPreviewImages();
      });
    });
  };

  if (inputUploadImage) {
    inputUploadImage.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      let loadedCount = 0;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          selectedImages.push(event.target.result);
          loadedCount++;
          if (loadedCount === files.length) {
            renderPreviewImages();
            inputUploadImage.value = ""; // Reset input file
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }

  // ==========================================
  // 4. Gửi tin nhắn (CLIENT_SEND_MESSAGE)
  // ==========================================
  if (formSendData) {
    formSendData.addEventListener("submit", (e) => {
      e.preventDefault();
      const content = inputContent ? inputContent.value.trim() : "";

      // Kiểm tra có nội dung hoặc có ảnh
      if (content || selectedImages.length > 0) {
        socket.emit("CLIENT_SEND_MESSAGE", {
          content: content,
          images: selectedImages,
        });

        // Reset form
        if (inputContent) {
          inputContent.value = "";
        }
        selectedImages = [];
        renderPreviewImages();

        // Ẩn bảng emoji nếu đang mở
        if (tooltipEmoji) {
          tooltipEmoji.classList.remove("shown");
        }

        // Tắt trạng thái typing
        socket.emit("CLIENT_SEND_TYPING", "hidden");
        clearTimeout(timeOutTyping);
      }
    });
  }

  // ==========================================
  // 5. Nhận tin nhắn mới (SERVER_RETURN_MESSAGE)
  // ==========================================
  socket.on("SERVER_RETURN_MESSAGE", (data) => {
    const myId = chatElement.getAttribute("my-id");
    const isOutgoing = data.userId == myId;

    const div = document.createElement("div");
    div.classList.add(isOutgoing ? "inner-outgoing" : "inner-incoming");

    // Thông tin người gửi nếu là tin nhắn đến
    let htmlUserInfo = "";
    if (!isOutgoing) {
      const avatarHtml = data.avatar
        ? `<img class="inner-user-avatar" src="${data.avatar}" alt="${data.fullName}">`
        : `<span class="inner-user-avatar-placeholder">${data.fullName ? data.fullName.charAt(0).toUpperCase() : "U"}</span>`;
      htmlUserInfo = `
        <div class="inner-user-info">
          ${avatarHtml}
          <div class="inner-name">${data.fullName || "Người dùng"}</div>
        </div>
      `;
    }

    // Nội dung text
    let htmlContent = "";
    if (data.content) {
      htmlContent = `<div class="inner-content">${data.content}</div>`;
    }

    // Danh sách hình ảnh
    let htmlImages = "";
    if (data.images && data.images.length > 0) {
      htmlImages = `<div class="inner-images">`;
      data.images.forEach((imgUrl) => {
        htmlImages += `<img src="${imgUrl}" alt="Ảnh đính kèm">`;
      });
      htmlImages += `</div>`;
    }

    div.innerHTML = `
      ${htmlUserInfo}
      ${htmlContent}
      ${htmlImages}
    `;

    // Chèn trước khung typing
    const listTyping = document.querySelector(".chat .inner-list-typing");
    if (listTyping) {
      bodyChat.insertBefore(div, listTyping);
    } else {
      bodyChat.appendChild(div);
    }

    scrollToBottom();
    initGallery();
  });

  // ==========================================
  // 6. Xử lý Emoji Picker
  // ==========================================
  if (buttonIcon && tooltipEmoji) {
    let popperInstance = null;
    if (typeof Popper !== "undefined") {
      popperInstance = Popper.createPopper(buttonIcon, tooltipEmoji, {
        placement: "top-start",
      });
    }

    buttonIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      tooltipEmoji.classList.toggle("shown");
      if (popperInstance) {
        popperInstance.update();
      }
    });

    // Đóng khi click ngoài bảng emoji
    document.addEventListener("click", (e) => {
      if (!tooltipEmoji.contains(e.target) && !buttonIcon.contains(e.target)) {
        tooltipEmoji.classList.remove("shown");
      }
    });
  }

  if (emojiPicker && inputContent) {
    emojiPicker.addEventListener("emoji-click", (event) => {
      const emoji = event.detail.unicode;
      const start = inputContent.selectionStart !== null ? inputContent.selectionStart : inputContent.value.length;
      const end = inputContent.selectionEnd !== null ? inputContent.selectionEnd : inputContent.value.length;

      inputContent.value =
        inputContent.value.substring(0, start) +
        emoji +
        inputContent.value.substring(end);

      inputContent.focus();
      inputContent.selectionStart = inputContent.selectionEnd = start + emoji.length;

      // Kích hoạt typing
      socket.emit("CLIENT_SEND_TYPING", "show");
      clearTimeout(timeOutTyping);
      timeOutTyping = setTimeout(() => {
        socket.emit("CLIENT_SEND_TYPING", "hidden");
      }, 1500);
    });
  }

  // ==========================================
  // 7. Xử lý Typing Indicator
  // ==========================================
  if (inputContent) {
    inputContent.addEventListener("input", () => {
      socket.emit("CLIENT_SEND_TYPING", "show");

      clearTimeout(timeOutTyping);
      timeOutTyping = setTimeout(() => {
        socket.emit("CLIENT_SEND_TYPING", "hidden");
      }, 1500);
    });

    inputContent.addEventListener("blur", () => {
      socket.emit("CLIENT_SEND_TYPING", "hidden");
      clearTimeout(timeOutTyping);
    });
  }

  // Lắng nghe người khác gõ tin nhắn (SERVER_RETURN_TYPING)
  socket.on("SERVER_RETURN_TYPING", (data) => {
    const listTyping = document.querySelector(".chat .inner-list-typing");
    if (!listTyping) return;

    const existBox = listTyping.querySelector(`[user-id="${data.userId}"]`);

    if (data.type === "show") {
      if (!existBox) {
        const boxTyping = document.createElement("div");
        boxTyping.classList.add("box-typing");
        boxTyping.setAttribute("user-id", data.userId);
        boxTyping.innerHTML = `
          <span class="inner-name">${data.fullName}</span>
          <span class="inner-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        `;
        listTyping.appendChild(boxTyping);
        scrollToBottom();
      }
    } else {
      if (existBox) {
        existBox.remove();
      }
    }
  });
}