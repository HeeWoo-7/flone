import { Router, type IRouter } from "express";
import healthRouter from "./health";
import spendingRouter from "./spending";
import userRouter from "./user";
import reportRouter from "./report";

const router: IRouter = Router();

router.use(healthRouter);
router.use(spendingRouter);
router.use(userRouter);
router.use(reportRouter);

export default router;
