import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { toUser, fromLocation, toLocation, notes } = body;

    const asset = await prisma.systemAsset.findUnique({
      where: { id: params.id },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const [transfer] = await prisma.$transaction([
      prisma.assetTransfer.create({
        data: {
          assetId: params.id,
          fromUser: asset.previousUser || "N/A",
          toUser,
          fromLocation: fromLocation || asset.location || "N/A",
          toLocation: toLocation || asset.location || "N/A",
          notes: notes || null,
        },
      }),
      prisma.systemAsset.update({
        where: { id: params.id },
        data: {
          previousUser: asset.assignedUserId ? undefined : asset.previousUser,
          location: toLocation || undefined,
        },
      }),
      prisma.auditLog.create({
        data: {
          action: "Asset Transferred",
          entity: asset.productName,
          entityId: asset.id,
          details: `Transferred to ${toUser} at ${toLocation || asset.location}`,
        },
      }),
    ]);

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error("Transfer POST error:", error);
    return NextResponse.json({ error: "Failed to create transfer" }, { status: 500 });
  }
}
