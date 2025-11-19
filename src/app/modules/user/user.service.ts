import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helper/fileUploader";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { Admin, Doctor, Prisma, UserRole } from "@prisma/client";
import { userSearchableFields } from "./user.constant";

const createPatient = async (req: Request) => {

    if (req.file) {
        const uploadResult = await fileUploader.uploadToCloudinary(req.file)
        req.body.patient.profilePhoto = uploadResult?.secure_url
    }

    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: {
                email: req.body.patient.email,
                password: hashPassword
            }
        });

        return await tnx.patient.create({
            data: req.body.patient
        })
    })

    return result;
}

const createAdmin = async (req: Request): Promise<Admin> => {

    const file = req.file;

    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.admin.profilePhoto = uploadToCloudinary?.secure_url
    }

    const hashedPassword: string = await bcrypt.hash(req.body.password, 10)

    const userData = {
        email: req.body.admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN
    }

    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData
        });

        const createdAdminData = await transactionClient.admin.create({
            data: req.body.admin
        });

        return createdAdminData;
    });

    return result;
};

const createDoctor = async (req: Request): Promise<Doctor> => {

    const file = req.file;

    // upload profile photo if exists
    if (file) {
        const uploaded = await fileUploader.uploadToCloudinary(file);
        req.body.doctor.profilePhoto = uploaded?.secure_url;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // user data for User table
    const userData = {
        email: req.body.doctor.email,
        password: hashedPassword,
        role: UserRole.DOCTOR,
    };

    // doctor data
    const { specialties, ...doctorData } = req.body.doctor;

    // DB transaction
    const result = await prisma.$transaction(async (tx) => {
        // create user
        await tx.user.create({
            data: userData,
        });

        // create doctor
        const createdDoctor = await tx.doctor.create({
            data: doctorData,
        });

        // handle specialties
        if (Array.isArray(specialties) && specialties.length > 0) {
            // validate specialties id exist
            const existing = await tx.specialties.findMany({
                where: {
                    id: { in: specialties },
                },
                select: { id: true },
            });

            const existingIds = existing.map((s) => s.id);

            const invalid = specialties.filter(
                (id: string) => !existingIds.includes(id)
            );

            if (invalid.length > 0) {
                throw new Error(`Invalid Specialty IDs: ${invalid.join(",")}`);
            }

            // build payload for doctor_specialties table
            const docSpecialtiesData = specialties.map((sid: string) => ({
                doctorId: createdDoctor.id,
                specialitiesId: sid, // ✔ MUST MATCH MODEL
            }));

            await tx.doctorSpecialties.createMany({
                data: docSpecialtiesData,
                skipDuplicates: true,
            });
        }

        // return full doctor with specialties
        const doctorWithSpecialties = await tx.doctor.findUnique({
            where: { id: createdDoctor.id },

            include: {
                doctorSpecialties: {
                    include: {
                        specialities: true,
                    },
                },
            },
        });

        if (!doctorWithSpecialties) {
            throw new Error("Doctor not found after creation");
        }

        return doctorWithSpecialties as Doctor;
    });

    return result;
};

const getAllFromDB = async (params: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    }

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}

    const result = await prisma.user.findMany({
        skip,
        take: limit,

        where: whereConditions,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.user.count({
        where: whereConditions
    });
    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
}

export const UserService = {
    createPatient,
    createAdmin,
    createDoctor,
    getAllFromDB
}