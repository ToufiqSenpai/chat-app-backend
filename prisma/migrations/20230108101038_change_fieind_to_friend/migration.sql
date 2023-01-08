/*
  Warnings:

  - You are about to drop the column `freindId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `freindRequest` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `freindId`,
    DROP COLUMN `freindRequest`,
    ADD COLUMN `friendId` JSON NULL,
    ADD COLUMN `friendRequest` JSON NULL;
