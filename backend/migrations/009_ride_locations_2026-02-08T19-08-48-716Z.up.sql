CREATE TABLE IF NOT EXISTS ride_locations (
      ride_id UUID PRIMARY KEY REFERENCES rides(id) ON DELETE CASCADE,

      pickup_location GEOGRAPHY(Point,4326),
      pickup_address TEXT,

      dropoff_location GEOGRAPHY(Point,4326),
      dropoff_address TEXT
    );

-- Spatial queries if needed later
CREATE INDEX IF NOT EXISTS idx_ride_pickup_geo
ON ride_locations
USING GIST (pickup_location);

CREATE INDEX IF NOT EXISTS idx_ride_dropoff_geo
ON ride_locations
USING GIST (dropoff_location);