const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");
const multer = require("multer");
const moment = require("moment");
require("dotenv").config();

const database = require("./config/database.js");
const systemConfig = require("./config/system.js");

const routeAdmin = require("./routes/admin/index.route.js");
const routeClient = require("./routes/client/index.route.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: false }));

// Chuẩn hóa path cho môi trường Linux trên Vercel
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// TinyMCE
app.use(
    '/tinymce',
    express.static(path.join(__dirname, 'node_modules', 'tinymce'))
);

// Flash & Cookie & Session
app.use(cookieParser("LOI2006"));
app.use(session({
    secret: "LOI2006",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.use(flash());

// App locals variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware kết nối Database
app.use(async (req, res, next) => {
    try {
        await database.connect();
        next();
    } catch (error) {
        console.error("Database connection error in middleware:", error);
        return res.status(500).send("Database connection error");
    }
});

// Routes
routeAdmin(app);
routeClient(app);

// Chạy local
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
}

module.exports = app;