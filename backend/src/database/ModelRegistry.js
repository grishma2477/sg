import User from "../models/user/User.js";
import UserProfile from "../models/user/user_profile/UserProfile.js";
import AuthCredential from "../models/user/auth_credentials/AuthCredential.js";
import UserVerification from '../models/user/user_verification/UserVerification.js';
import Ride from "../models/ride/Ride.js";
import Driver from "../models/driver/Driver.js";
import Vehicle from './../models/vehicle/Vehicle.js';
import RideBid from "../models/ride/RideBid.js";
import RideRequest from "../models/ride/RideRequest.js";
import DriverLocation from "../models/driver/driver_location/DriverLocation.js";
import DriverRestriction from "../models/driver/driver_restrictions/DriverRestriction.js";
import DriverSafetyStats from "../models/driver/driver_safety_stats/DriverSafetyStats.js";
import DriverVisibility from "../models/driver/driver_visibility/DriverVisibility.js";

// Add every model here once.
export const MODELS = [
    User,
    UserProfile,
    AuthCredential,
    UserVerification,
    Vehicle,
    Driver,
    Ride,
    RideRequest,
    RideBid,
    DriverLocation,
    DriverRestriction,
    DriverSafetyStats,
    DriverVisibility,


];