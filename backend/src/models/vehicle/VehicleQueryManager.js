import { String } from "../../utils/Constant.js";

export const VehicleQueryManager = {
  createVehicleTableQuery: `
    CREATE TABLE ${String.VEHICLE_MODEL} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      driver_id UUID REFERENCES ${String.DRIVER_MODEL}(id),
      vehicle_type VARCHAR(20) CHECK (
        vehicle_type IN ('SCOOTER', 'BIKE', 'CAR_4_SEATER', 'CAR_7_SEATER', 'AUTO')
      ),
      plate_number VARCHAR(20),
      model VARCHAR(50),
      color VARCHAR(30),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,

};

