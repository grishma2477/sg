import {asyncHandler} from "../middleware/asyncHandler.js"
import User from "../models/user/User.js"


export const getProfile = asyncHandler(async (req,res)=>{
    console.log("frontend bhata call bhayo.");
    
const id= req.user._id;
const user = await User.findById(id).select("-password");

if (!user){
    return failure(404, "User not found.")
}
res.status(200).json(success("Profile fetched successfully.", user));
})