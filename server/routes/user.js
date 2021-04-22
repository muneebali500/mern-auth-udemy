import express from "express";
const router = express.Router();

// import controllers
import { requireSignin } from "../controllers/auth.js";
import { read } from "../controllers/user.js";

router.get(`/user/:id`, requireSignin, read);

export default router;
