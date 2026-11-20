DELETE FROM "PhoneCode" a
USING "PhoneCode" b
WHERE a."phone" = b."phone"
  AND (
    a."createdAt" < b."createdAt"
    OR (a."createdAt" = b."createdAt" AND a."id" < b."id")
  );

DROP INDEX IF EXISTS "PhoneCode_phone_idx";

ALTER TABLE "PhoneCode" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "PhoneCode_phone_key" ON "PhoneCode"("phone");
