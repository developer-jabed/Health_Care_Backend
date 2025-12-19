import express from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { ScheduleRoutes } from '../modules/schedule/schedule.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { PatientRoutes } from '../modules/patient/patient.routes';
import { AppointmentRoutes } from '../modules/appointment/appointment.routes';
import { SpecialtiesRoutes } from '../modules/specialities/specialities.route';
import { DoctorRoutes } from '../modules/doctor/doctor.route';
import { PrescriptionRoutes } from '../modules/prescription/prescription.router';
import { ReviewRoutes } from '../modules/review/review.router';
import { MetaRoutes } from '../modules/meta/meta.router';
import { DoctorScheduleRoutes } from '../modules/doctorSchedule/doctorSchedule.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';



const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/schedule',
        route: ScheduleRoutes
    },
    {
        path: '/doctor-schedule',
        route: DoctorScheduleRoutes
    },
    {
        path: '/specialties',
        route: SpecialtiesRoutes
    },
    {
        path: '/doctor',
        route: DoctorRoutes
    },
    {
        path: '/admin',
        route: AdminRoutes
    },
    {
        path: '/patient',
        route: PatientRoutes
    },
    {
        path: '/appointment',
        route: AppointmentRoutes
    },
    {
        path: '/prescription',
        route: PrescriptionRoutes
    },
    {
        path: '/review',
        route: ReviewRoutes
    },
    {
        path: '/metadata',
        route: MetaRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;