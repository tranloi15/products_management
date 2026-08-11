const express = require("express");
require("dotenv").config();

const database = require("./config/database.js");

const route = require("./routes/client/index_route");

database.connect();

const app = express();
const port = process.env.PORT;

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
// Routes
route(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});