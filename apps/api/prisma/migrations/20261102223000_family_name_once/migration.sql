-- Keep one family when the same person has the same name more than once.
WITH ranked AS (
    SELECT
        id,
        "customerId",
        lower(name) AS lname,
        row_number() OVER (PARTITION BY "customerId", lower(name) ORDER BY "createdAt", id) AS n
    FROM "Family"
),
keeper AS (
    SELECT id, "customerId", lname FROM ranked WHERE n = 1
),
dupes AS (
    SELECT ranked.id AS dupe_id, keeper.id AS keep_id
    FROM ranked
    JOIN keeper ON keeper."customerId" = ranked."customerId" AND keeper.lname = ranked.lname
    WHERE ranked.n > 1
)
UPDATE "Grave" AS grave
SET "familyId" = dupes.keep_id
FROM dupes
WHERE grave."familyId" = dupes.dupe_id;

WITH ranked AS (
    SELECT
        id,
        row_number() OVER (PARTITION BY "customerId", lower(name) ORDER BY "createdAt", id) AS n
    FROM "Family"
)
DELETE FROM "Family" AS family
USING ranked
WHERE family.id = ranked.id AND ranked.n > 1;

DELETE FROM "Family" AS family
WHERE NOT EXISTS (
    SELECT 1 FROM "Grave" AS grave WHERE grave."familyId" = family.id
);

CREATE UNIQUE INDEX "Family_customer_name_lower_key" ON "Family" ("customerId", lower("name"));
