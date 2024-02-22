const express = require("express");
const app = express();
const port = 3636;
const router = require("./routers/index");
const session = require("express-session");
const path = require("path");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use('uploads', express.static(path.join(__dirname, 'uploads')));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: true,
    },
  })
);

app.use("/", router);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
