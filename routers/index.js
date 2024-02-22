const express = require("express");
const router = express.Router();
const Controller = require("../controllers/controller");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const originalExtension = file.originalname.split(".").pop();
    const fileExtension = "." + originalExtension;
    const modifiedFileName = file.fieldname + "-" + uniqueSuffix + fileExtension;
    cb(null, modifiedFileName);
  },
});

const upload = multer({ storage: multer.memoryStorage() });

const isLogin = (req, res, next) => {
  if (req.session.userId) {
    res.redirect(`/${req.session.userRole.toLowerCase()}`);
  } else {
    next();
  }
};

router.get("/", isLogin, Controller.home);
router.get("/register", isLogin, Controller.register);
router.post("/register", isLogin, Controller.postRegister);
router.get("/login", isLogin, Controller.login);
router.post("/login", isLogin, Controller.postLogin);

router.use((req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/");
  } else {
    next();
  }
});

router.get("/guest", Controller.getProfile);
router.post("/guest", Controller.postProfile);
router.get("/guest/profile", Controller.listBooking);
router.get("/guest/apartement", Controller.getAllApartement);
router.get("/guest/apartement/:idapartement/form", Controller.getBooking);
router.post("/guest/apartement/:idapartement/form", Controller.postBooking);
router.get("/guest/bookingsuccess", Controller.viewPDF);

router.get("/host", Controller.getProfile);
router.post("/host", Controller.postProfile);
router.get("/host/apartement", Controller.getApartementByHost);
router.get("/host/apartement/add", Controller.addApartementForm);
router.post("/host/apartement/add", upload.single("image"), Controller.addApartement);
router.get("/host/apartement/:idapartement/edit", Controller.editApartementForm);
router.post("/host/apartement/:idapartement/edit", Controller.editApartement);
router.get("/host/apartement/:idapartement/delete", Controller.deleteApartement);
router.get("/host/apartement/:idapartement/add", Controller.addRoomForm);
router.post("/host/apartement/:idapartement/add", Controller.addRoom);
router.get("/host/apartement/:idapartement/room/:idRoom/delete", Controller.deleteRoom);

router.get("/logout", Controller.logout);

module.exports = router;
