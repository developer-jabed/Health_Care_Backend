import { NextFunction, Request, Response } from "express"

import ApiError from "../errors/api.error";
import httpStatus from "http-status";
import { jwtHelpers } from "../helper/jwtHelper";

const auth = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.accessToken;

            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
            }

            // ✔️ Use the SAME SECRET used to SIGN token
            const verifyUser = jwtHelpers.verifyToken(
                token,
                process.env.JWT_SECRET as string
            );

            req.user = verifyUser;

            // ✔️ Role check
            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
            }

            next();
        }
        catch (err) {
            next(err);
        }
    }
}

export default auth;
