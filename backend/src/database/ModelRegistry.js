import User from "../models/user/User.js";
import UserProfile from "../models/user/user_profile/UserProfile.js";
import AuthCredential from "../models/user/auth_credentials/AuthCredential.js";
import Ride from "../models/ride/Ride.js";
import Driver from "../models/driver/Driver.js";
import VehicleApplication from './../models/vehicle/Vehicle.js';
import RideBid from "../models/ride/RideBid.js";
import RideRequest from "../models/ride/RideRequest.js";
import DriverLocation from "../models/driver/driver_location/DriverLocation.js";
import DriverRestriction from "../models/driver/driver_restrictions/DriverRestriction.js";
import DriverSafetyStats from "../models/driver/driver_safety_stats/DriverSafetyStats.js";
import DriverVisibility from "../models/driver/driver_visibility/DriverVisibility.js";
import SafetyAuditLog from "../models/safety/SafetyAuditLog.js";
import SafetyComment from "../models/safety/SafetyComment.js";
import RideStop from "../models/ride_stop/RideStop.js";
import RideLocation from "../models/ride/ride_location/RideLocation.js";
import Review from "../models/review/Review.js";
import TapDefinition from "../models/reference/TapDefinition.js";
import Pricing from "../models/finance/pricing/Pricing.js";
import Transaction from "../models/finance/transaction/Transaction.js";
import Wallet from "../models/finance/transaction/wallet/Wallet.js";
import AdminAuditModel from "../models/admin/AdminAudit.js";
import KYC from "../models/user/kyc/KYC.js";
import KYCDocument from "../models/user/kyc_document/KYCDocument.js";
import DriverApplication from "../models/driver_application/DriverApplication.js";
import { DriverVerifications } from "../models/driver/driver_verifications/DriverVerifications.js";
import RiderSafetyStats from "../models/ride/rider_safety_stats/RiderSafetyStats.js";

// Add every model here once.
export const MODELS = [
    User,
    UserProfile,
    AuthCredential,
    KYC,
    KYCDocument,
    DriverApplication,
    Driver,
    DriverVerifications,
    VehicleApplication,
    Ride,
    RideLocation,
    RideRequest,
    RideStop,
    RideBid,
    DriverLocation,
    DriverRestriction,
    RiderSafetyStats,
    DriverSafetyStats,
    DriverVisibility,
    Review,
    TapDefinition,
    Pricing,
    Wallet,
    Transaction,
    SafetyAuditLog,
    SafetyComment,
    AdminAuditModel,

];