import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";

const insertIntoDB = async (
    user: IJWTPayload,
    payload: { scheduleIds: string[] }
) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: { email: user.email },
    });

    // Verify that all schedule IDs exist
    const existingSchedules = await prisma.schedule.findMany({
        where: {
            id: { in: payload.scheduleIds },
        },
        select: { id: true },
    });

    const existingScheduleIds = existingSchedules.map((s) => s.id);

    // Filter only valid IDs
    const validSchedules = payload.scheduleIds.filter((id) =>
        existingScheduleIds.includes(id)
    );

    if (validSchedules.length === 0) {
        throw new Error("No valid schedules found for provided scheduleIds.");
    }

    const doctorScheduleData = validSchedules.map((scheduleId) => ({
        doctorId: doctorData.id,
        scheduleId,
    }));

    return await prisma.doctorSchedules.createMany({
        data: doctorScheduleData,
        skipDuplicates: true,
    });
};


export const DoctorScheduleService = {
    insertIntoDB
}