const Controller = require('../controller');
const Auth = require("../../common/authenticate");
const router = require('express').Router();

// admin onboarding
router.post("/signup",Controller.AdminController.signup);
router.post("/login",Controller.AdminController.login);
router.get("/logout",Auth.verify("admin"),Controller.AdminController.logout);
router.get("/getProfile",Auth.verify("admin"),Controller.AdminController.getProfile);
router.put("/updateProfile",Auth.verify("admin"),Controller.AdminController.updateProfile);
router.post("/changePassword",Auth.verify("admin"),Controller.AdminController.changePassword);
router.post("/forgetPassword",Controller.AdminController.forgotPassword);
router.post("/verifyOtp",Controller.AdminController.verifyOtp);
router.post("/resetPassword",Auth.verify("admin"),Controller.AdminController.resetPassword);

router.post("/user", Auth.verify("admin"), Controller.AdminController.addUser);
router.get("/user/:id?", Auth.verify("admin"), Controller.AdminController.getUser);
router.put("/user/:id", Auth.verify("admin"), Controller.AdminController.editUser);
router.delete("/user/:id", Auth.verify("admin"), Controller.AdminController.deleteUser);

router.post("/subAdmin", Auth.verify("admin"), Controller.AdminController.addSubAdmin);
router.put("/subAdmin/:id", Auth.verify("admin"), Controller.AdminController.updateSubAdmin);
router.get("/subAdmin/:id?", Auth.verify("admin"), Controller.AdminController.getAllSubAdmin);
router.delete("/subAdmin/:id", Auth.verify("admin"), Controller.AdminController.deleteSubAdmin);




module.exports=router;



