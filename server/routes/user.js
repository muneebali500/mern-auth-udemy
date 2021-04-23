import express from "express";
const router = express.Router();

// import controllers
import { requireSignin } from "../controllers/auth.js";
import { read, update } from "../controllers/user.js";

router.get(`/user/:id`, requireSignin, read);
router.put(`/user/update`, requireSignin, update);

export default router;
