import jwt from "jsonwebtoken";
import { failure } from "../utils/ApiResponse.js";
import { Constant } from "../utils/Constant.js";
import User from "../models/User.js";

export const verifyuser = async (req, res, next)=>{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return failure(401, "Unauthorized.");
};

    const accessToken = authHeader.split(" ")[1];
    if (accessToken == null){
        return failure(401, "Unauthorized.");
    }
    const accessTokenSecretKey = Constant.AccessTokenSecretKey
    const payload = jwt.verify(accessToken, accessTokenSecretKey);
    const userId = payload._id;
    const user = await User.findOne({_id:userId})
    if (!user) {
        return failure(401, "You are not authorized.")
    }
    req.user = user;
    next();
}