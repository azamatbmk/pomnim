-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grave" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "familyId" TEXT,
    "fullName" TEXT NOT NULL,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "city" TEXT NOT NULL,
    "cemetery" TEXT NOT NULL,
    "landmarks" TEXT,
    "biography" TEXT,
    "keepOff" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Family_customerId_idx" ON "Family"("customerId");

-- CreateIndex
CREATE INDEX "Grave_customerId_idx" ON "Grave"("customerId");

-- CreateIndex
CREATE INDEX "Grave_familyId_idx" ON "Grave"("familyId");

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grave" ADD CONSTRAINT "Grave_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grave" ADD CONSTRAINT "Grave_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;
