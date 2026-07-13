import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import listingsRouter from "./listings";
import bookingsRouter from "./bookings";
import reviewsRouter from "./reviews";
import messagesRouter from "./messages";
import adminRouter from "./admin";
import dashboardRouter from "./dashboard";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(listingsRouter);
router.use(bookingsRouter);
router.use(reviewsRouter);
router.use(messagesRouter);
router.use(adminRouter);
router.use(dashboardRouter);
router.use(storageRouter);

export default router;
