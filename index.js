const express = require("express");
require("dotenv").config();

const database = require("./config/database.js");

const systemConfig = require("./config/system.js");

const routeAmin = require("./routes/admin/index.route.js");
const route = require("./routes/client/index.route");


database.connect();

const app = express();
const port = process.env.PORT;

app.set("views", "./views");
app.set("view engine", "pug");

// app locals variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.use(express.static("public"));
// Routes
routeAmin(app);
route(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});