const express = require("express");
const methodOverride = require("method-override");
require("dotenv").config();

const database = require("./config/database.js");
const systemConfig = require("./config/system.js");

const routeAdmin = require("./routes/admin/index.route.js");
const routeClient = require("./routes/client/index.route.js");

database.connect();

const app = express();
const port = process.env.PORT || 3000;

// 1. Phải có dòng này để đọc dữ liệu từ Form gửi lên
app.use(express.urlencoded({ extended: true }));

// 2. Cấu hình method-override (chỉ khai báo 1 lần duy nhất ở đây)
app.use(methodOverride("_method"));

app.set("views", "./views");
app.set("view engine", "pug");

// App locals variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.use(express.static("public"));

// Routes
routeAdmin(app);
routeClient(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});