import express from "express";

const router = express.Router();

// import controllers
import {
  signup,
  accountActivation,
  signin,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.js";

// import validators
import {
  userSignUpValidator,
  userSigninValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.js";
import { runValidation } from "../validators/index.js";

router.post(`/signup`, userSignUpValidator, runValidation, signup);
router.post(`/account-activation`, accountActivation);
router.post(`/signin`, userSigninValidator, runValidation, signin);

// forgot reset password
router.put(
  `/forgot-password`,
  forgotPasswordValidator,
  runValidation,
  forgotPassword
);
router.put(
  `/reset-password`,
  resetPasswordValidator,
  runValidation,
  resetPassword
);

export default router;
