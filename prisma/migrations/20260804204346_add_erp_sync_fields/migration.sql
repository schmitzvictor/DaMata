-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "erpVariantId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "erpProductId" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "erpVariantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_erpProductId_key" ON "Product"("erpProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_erpVariantId_key" ON "ProductVariant"("erpVariantId");

