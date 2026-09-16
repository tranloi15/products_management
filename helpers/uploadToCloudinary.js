const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const uploadStream = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (result) {
        resolve(result.secure_url);
      } else {
        reject(error);
      }
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const uploadBase64 = async (base64) => {
  const result = await cloudinary.uploader.upload(base64);
  return result.secure_url;
};

module.exports = async (fileData) => {
  try {
    if (Buffer.isBuffer(fileData)) {
      return await uploadStream(fileData);
    } else if (typeof fileData === "string") {
      // Chuỗi base64 hoặc URL
      if (fileData.startsWith("data:")) {
        return await uploadBase64(fileData);
      }
      return fileData;
    }
    return "";
  } catch (error) {
    console.error("Lỗi upload Cloudinary:", error);
    return "";
  }
};
