import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Constant } from "../utils/Constant.js";
import User from "../models/user/User.js";

export const verifyuser = async (req, res, next)=>{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json(ApiResponse.error("Unauthorized", 401));
};

    const accessToken = authHeader.split(" ")[1];
    if (accessToken == null){
        return res.status(401).json(ApiResponse.error("Unauthorized", 401));
    }
    const accessTokenSecretKey = Constant.AccessTokenSecretKey;
    let payload;
    try {
        payload = jwt.verify(accessToken, accessTokenSecretKey);
    } catch (e) {
        return res.status(401).json(ApiResponse.error("Unauthorized", 401));
    }
    const userId = payload.id;
    const user = await User.findOne({id:userId})
    if (!user) {
        return res.status(401).json(ApiResponse.failure("Unauthorized", 401));
    }
    req.user = user;
    next();
}



