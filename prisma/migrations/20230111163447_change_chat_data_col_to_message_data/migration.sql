/*
  Warnings:

  - You are about to drop the column `chatData` on the `chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `chat` DROP COLUMN `chatData`,
    ADD COLUMN `messageData` JSON NOT NULL;
