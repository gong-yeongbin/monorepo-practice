-- postback에 트래커 포스트백의 디바이스 정보 컬럼 추가 (트래커마다 내려주는 범위가 달라 전부 nullable)

-- AlterTable
ALTER TABLE "postback" ADD COLUMN     "device_model" VARCHAR(50),
ADD COLUMN     "device_manufacturer" VARCHAR(50),
ADD COLUMN     "device_type" VARCHAR(30),
ADD COLUMN     "os" VARCHAR(30),
ADD COLUMN     "os_version" VARCHAR(30),
ADD COLUMN     "carrier" VARCHAR(50);
