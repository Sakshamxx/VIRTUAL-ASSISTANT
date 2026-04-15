import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import chatRouter from "./chat";
import musicRouter from "./music";
import newsRouter from "./news";
import historyRouter from "./history";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(chatRouter);
router.use(musicRouter);
router.use(newsRouter);
router.use(historyRouter);

export default router;
