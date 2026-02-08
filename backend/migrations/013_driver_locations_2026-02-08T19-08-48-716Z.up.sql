CREATE TABLE IF NOT EXISTS driver_locations (
      driver_id UUID PRIMARY KEY
        REFERENCES drivers(id)
        ON DELETE CASCADE,

      location GEOGRAPHY(POINT, 4326) NOT NULL,

      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

CREATE INDEX IF NOT EXISTS idx_driver_location_gist
    ON driver_locations
    USING GIST (location);

    -- Spatial search 
CREATE INDEX IF NOT EXISTS idx_driver_location_geo
ON driver_locations
USING GIST (location);