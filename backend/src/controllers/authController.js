import { asyncHandler } from "../middleware/asyncHandler.js";
import User from "../models/user/User.js";
import bcrypt from "bcryptjs";
import { failure, success } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { Constant } from "../utils/Constant.js";

export const registerUser = asyncHandler(async (req, res)=>{
    const {firstName, lastName, email, password, userName } = req.body;
    
    if (!firstName || !lastName || !email || !password || !userName){
        return failure(400, "Missing required fields.");
    }

    const userAlreadyExists = await User.findOne({email:email});
    if(userAlreadyExists){
        return failure(409, "An user with this email already exists.");
    }

    const name = `${firstName} ${lastName}`;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        firstName,
        lastName,
        email,
        password:hashedPassword,
        userName, 
        profilePicUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    })
    await newUser.save({validateBeforeSave:true});
    res.status(201).json(success("Registered User successfully.", newUser));
})

export const logInUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return failure(400, "Email and password are required.");
    }

    // MUST SELECT PASSWORD because select:false in schema
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return failure(401, "Invalid email or password.");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        return failure(401, "Invalid email or password.");
    }

    const payload = { 
        _id: user._id, 
        role: user.role 
    };
    const resUser = await User.findOne({email});

const accessToken = jwt.sign(payload, Constant.AccessTokenSecretKey, {expiresIn:Constant.AccessTokenExpirationTime});
const refreshToken = jwt.sign(payload, Constant.RefreshTokenSecretKey, {expiresIn:Constant.RefreshTokenExpirationTime});
res.status(200).json({...success("Login Successful.", resUser), accessToken, refreshToken});
})