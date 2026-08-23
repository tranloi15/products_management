const express = require("express");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");
const multer = require("multer");
require("dotenv").config();

const database = require("./config/database.js");
const systemConfig = require("./config/system.js");

const routeAdmin = require("./routes/admin/index.route.js");
const routeClient = require("./routes/client/index.route.js");

database.connect();

const app = express();
const port = process.env.PORT || 3000;

app.use(methodOverride("_method"));

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// Flash & Cookie & Session
app.use(cookieParser("LOI2006"));
app.use(session({
    secret: "LOI2006",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.use(flash());
// End Flash

// App locals variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.use(express.static(`${__dirname}/public`));

// Routes
routeAdmin(app);
routeClient(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});