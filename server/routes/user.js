import express from "express";
const router = express.Router();

// import controllers
import { read } from "../controllers/user.js";

router.get(`/user/:id`, read);

export default router;
