import express from "express";

const router = express.Router();

// import controllers
import { signup, accountActivation, signin } from "../controllers/auth.js";

// import validators
import {
  userSignUpValidator,
  userSigninValidator,
} from "../validators/auth.js";
import { runValidation } from "../validators/index.js";

router.post(`/signup`, userSignUpValidator, runValidation, signup);
router.post(`/account-activation`, accountActivation);
router.post(`/signin`, userSigninValidator, runValidation, signin);

export default router;
