const mongoose = require("mongoose");

module.exports.connect = async () => {
    try {
        await mongoose.connect("mongodb://tranducloi784:loi123456@ac-5chexjl-shard-00-00.ov8ovpw.mongodb.net:27017,ac-5chexjl-shard-00-01.ov8ovpw.mongodb.net:27017,ac-5chexjl-shard-00-02.ov8ovpw.mongodb.net:27017/product_management?ssl=true&replicaSet=atlas-n3sh2u-shard-0&authSource=admin&appName=Cluster0");
        console.log("Connect Success!");
    } catch (error) {
        console.log("Connect Error!");
        console.error("Chi tiết lỗi:", error);
    }
}