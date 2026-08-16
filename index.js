const express = require("express");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
require("dotenv").config();

const database = require("./config/database.js");
const systemConfig = require("./config/system.js");

const routeAdmin = require("./routes/admin/index.route.js");
const routeClient = require("./routes/client/index.route.js");

database.connect();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));
//parse application
app.use(express.urlencoded({ extended: false }));

app.set("views", "./views");
app.set("view engine", "pug");
//app locals variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.use(express.static("public"));

// Routes
routeAdmin(app);
routeClient(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});