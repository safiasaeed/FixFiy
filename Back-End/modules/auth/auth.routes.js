const express = require("express");
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    verifyResetToken,
} = require('./auth.controller')
const {authLimiter,passwordResetLimiter}= require("../../middlewares/rateLimit")

router.post('/register',authLimiter, register);
router.post('/login',authLimiter, login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken",passwordResetLimiter, resetPassword);
router.get("/verify-reset-token/:resetToken", verifyResetToken);

module.exports = router;