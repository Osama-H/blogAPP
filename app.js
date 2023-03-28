const express = require("express");
require("dotenv").config();

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const replyRoutes = require('./routes/replyRoutes');


const notFound = require("./utils/notFound");
const errorHandler = require("./utils/errorHandler");

const app = express();
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too Many Request From this IP, Please Try Again later!",
});

app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/replies", replyRoutes);


app.use(notFound);
app.use(errorHandler);

module.exports = app;
