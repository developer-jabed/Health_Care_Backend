import express from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { doctorSeheduleValidation } from "./doctorSchedule.validation";

const router = express.Router();

router.post(
    "/",
    validateRequest(doctorSeheduleValidation.doctorScheduleValidationSchema),
    auth(UserRole.DOCTOR),
    DoctorScheduleController.insertIntoDB
)

export const doctorScheduleRoutes = router;