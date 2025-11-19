import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { prisma } from "../../shared/prisma";
import { IDoctorUpdateInput } from "./doctor.interface";
import httpStatus from 'http-status';
import { openai } from "../../helper/open-router";
import { extractJsonFromMessage } from "../../helper/extractJsonFromMessage";
import ApiError from "../../errors/api.error";
import { object } from "zod";
import notFound from "../../middlewares/notFound";
import { tr } from "zod/v4/locales";

const getAllFromDB = async (filters: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm, specialties, ...filterData } = filters;

    const andConditions: Prisma.DoctorWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    // "", "medicine"
    if (specialties && specialties.length > 0) {
        const specialitiesArray = Array.isArray(specialties) ? specialties : [specialties];
        andConditions.push({
            doctorSpecialties: {
                some: {
                    specialities: {
                        title: {
                            in: specialitiesArray,
                            mode: "insensitive"
                        }
                    }
                }
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: (filterData as any)[key]
            }
        }))

        andConditions.push(...filterConditions)
    }

    const whereConditions: Prisma.DoctorWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};


    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: {
                        select: {
                            title: true,
                        }
                    }
                }
            },
            reviews: {
                select: {
                    rating: true
                }
            }
        }
    });

    const total = await prisma.doctor.count({
        where: whereConditions
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }
}

const updateIntoDB = async (id: string, payload: any) => {
    // incoming format:
    // specialties: [{ specialtyId: "...", isDeleted: false }]
    // removeSpecialties: [{ specialtyId: "..."}]

    const specialtiesRaw = payload.specialties || [];
    const removeSpecialtiesRaw = payload.removeSpecialties || [];

    // Convert objects → string IDs
    const specialties = Array.isArray(specialtiesRaw)
        ? specialtiesRaw.map((s: any) => s.specialtyId)
        : [];

    const removeSpecialties = Array.isArray(removeSpecialtiesRaw)
        ? removeSpecialtiesRaw.map((s: any) => s.specialtyId)
        : [];

    const { specialties: _ignore, removeSpecialties: _ignore2, ...doctorData } = payload;

    const doctorInfo = await prisma.doctor.findUniqueOrThrow({
        where: { id, isDeleted: false },
    });

    await prisma.$transaction(async (tx) => {
        // 1️⃣ Update doctor basic fields
        if (Object.keys(doctorData).length > 0) {
            await tx.doctor.update({
                where: { id },
                data: doctorData,
            });
        }

        // 2️⃣ Remove specialties
        if (removeSpecialties.length > 0) {
            await tx.doctorSpecialties.deleteMany({
                where: {
                    doctorId: id,
                    specialitiesId: { in: removeSpecialties },
                },
            });
        }

        // 3️⃣ Add specialties
        if (specialties.length > 0) {
            const data = specialties.map((sid) => ({
                doctorId: id,
                specialitiesId: sid,
            }));

            await tx.doctorSpecialties.createMany({ data });
        }
    });

    // 4️⃣ Return updated doctor
    const result = await prisma.doctor.findUnique({
        where: { id },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true,
                },
            },
            reviews: true,
        },
    });

    return result;
};



const getByIdFromDB = async (id: string): Promise<Doctor | null> => {
    const result = await prisma.doctor.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true,
                },
            },
            doctorSchedules: {
                include: {
                    schedule: true
                }
            },
            reviews: true
        },
    });
    return result;
};

const deleteFromDB = async (id: string): Promise<Doctor> => {
    return await prisma.$transaction(async (transactionClient) => {
        const deleteDoctor = await transactionClient.doctor.delete({
            where: {
                id,
            },
        });

        await transactionClient.user.delete({
            where: {
                email: deleteDoctor.email,
            },
        });

        return deleteDoctor;
    });
};

const softDelete = async (id: string): Promise<Doctor> => {
    return await prisma.$transaction(async (transactionClient) => {
        const deleteDoctor = await transactionClient.doctor.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });

        await transactionClient.user.update({
            where: {
                email: deleteDoctor.email,
            },
            data: {
                status: UserStatus.DELETED,
            },
        });

        return deleteDoctor;
    });
};




const getAISuggestions = async (payload: { symptoms: string }) => {
    if (!(payload && payload.symptoms)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "symptoms is required!")
    };

    const doctors = await prisma.doctor.findMany({
        where: { isDeleted: false },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        }
    });

    console.log("doctors data loaded.......\n");
    const prompt = `
You are a medical assistant AI. Based on the patient's symptoms, suggest the top 3 most suitable doctors.
Each doctor has specialties and years of experience.
Only suggest doctors who are relevant to the given symptoms.

Symptoms: ${payload.symptoms}

Here is the doctor list (in JSON):
${JSON.stringify(doctors, null, 2)}

Return your response in JSON format with full individual doctor data. 
`;

    console.log("analyzing......\n")
    const completion = await openai.chat.completions.create({
        model: 'z-ai/glm-4.5-air:free',
        messages: [
            {
                role: "system",
                content:
                    "You are a helpful AI medical assistant that provides doctor suggestions.",
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
    });

    const result = await extractJsonFromMessage(completion.choices[0].message)
    return result;
}

export const DoctorService = {
    getAllFromDB,
    updateIntoDB,
    getByIdFromDB,
    deleteFromDB,
    softDelete,
    getAISuggestions
}