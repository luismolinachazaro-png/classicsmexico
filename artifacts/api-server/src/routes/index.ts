import { Router, type IRouter } from "express";
import healthRouter from "./health";
import classicCarsRouter from "./classic-cars";

const router: IRouter = Router();

router.use(healthRouter);
router.use(classicCarsRouter);

export default router;
