import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Constant } from "../utils/Constant.js";
import User from "../models/user/User.js";

export const verifyuser = async (req, res, next)=>{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse.error(401, "Unauthorized.");
};

    const accessToken = authHeader.split(" ")[1];
    if (accessToken == null){
        return ApiResponse.error(401, "Unauthorized.");
    }
    const accessTokenSecretKey = Constant.AccessTokenSecretKey
    const payload = jwt.verify(accessToken, accessTokenSecretKey);
    const userId = payload.id;
    const user = await User.findOne({id:userId})
    if (!user) {
        return ApiResponse.failure(401, "You are not authorized.")
    }
    req.user = user;
    next();
}



