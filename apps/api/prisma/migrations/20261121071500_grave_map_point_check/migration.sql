UPDATE "Grave"
SET "latitude" = NULL, "longitude" = NULL
WHERE ("latitude" IS NULL) <> ("longitude" IS NULL)
   OR "latitude" < -90 OR "latitude" > 90
   OR "longitude" < -180 OR "longitude" > 180;

ALTER TABLE "Grave"
ADD CONSTRAINT "Grave_map_point_check"
CHECK (
  ("latitude" IS NULL AND "longitude" IS NULL)
  OR (
    "latitude" IS NOT NULL
    AND "longitude" IS NOT NULL
    AND "latitude" >= -90 AND "latitude" <= 90
    AND "longitude" >= -180 AND "longitude" <= 180
  )
);
