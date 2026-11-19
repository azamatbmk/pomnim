-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "icon" TEXT,
    "sort" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- Seed the first catalog. Later changes stay in this table.
INSERT INTO "Service" ("id", "title", "description", "price", "icon", "sort") VALUES
('clean', 'Уборка участка', 'Листва, сорняки, мусор и бережная очистка.', 1500, 'leaf', 1),
('paint', 'Покраска ограды', 'Подготовка поверхности и обновление покрытия.', 3000, 'paint', 2),
('flowers', 'Возложение цветов', 'Цветы к памятной дате по вашим пожеланиям.', 1200, 'flower', 3),
('visit', 'Осмотр и фото', 'Проверка состояния участка с фотоотчётом.', 800, 'camera', 4);

DROP TABLE IF EXISTS "ServicePrice";

ALTER TABLE "Order" ADD COLUMN "serviceTitle" TEXT NOT NULL DEFAULT '';

UPDATE "Order" SET "serviceTitle" = 'Уборка участка' WHERE "service" = 'clean' AND "serviceTitle" = '';
UPDATE "Order" SET "serviceTitle" = 'Покраска ограды' WHERE "service" = 'paint' AND "serviceTitle" = '';
UPDATE "Order" SET "serviceTitle" = 'Возложение цветов' WHERE "service" = 'flowers' AND "serviceTitle" = '';
UPDATE "Order" SET "serviceTitle" = 'Осмотр и фото' WHERE "service" = 'visit' AND "serviceTitle" = '';
UPDATE "Order" SET "serviceTitle" = 'Другое' WHERE "service" = 'other' AND "serviceTitle" = '';
