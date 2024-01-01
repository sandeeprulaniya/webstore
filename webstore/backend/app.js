const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error")
app.use(express.json());// alternative of body-parser
app.use(cookieParser());
// routes import
const product = require("./routes/productRoute");
const user = require("./routes/userRoutes");
const order = require("./routes/orderRoutes");

app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1/",order);

// middleware for error

app.use(errorMiddleware);



module.exports = app;
