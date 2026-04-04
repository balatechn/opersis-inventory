import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const asset = await prisma.systemAsset.findUnique({
      where: { id: params.id },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        transfers: { orderBy: { transferDate: "desc" } },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("System GET error:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const asset = await prisma.systemAsset.update({
      where: { id: params.id },
      data: {
        productName: body.productName,
        serialNumber: body.serialNumber,
        make: body.make,
        config: body.config,
        osVersion: body.osVersion,
        company: body.company,
        department: body.department,
        location: body.location,
        vendorDetails: body.vendorDetails,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
        invoiceNumber: body.invoiceNumber,
        cost: body.cost,
        warrantyPeriod: body.warrantyPeriod,
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : undefined,
        maintenanceSchedule: body.maintenanceSchedule ? new Date(body.maintenanceSchedule) : undefined,
        status: body.status,
        remarks: body.remarks,
        phone: body.phone,
        emailId: body.emailId,
        officeAppId: body.officeAppId,
        softwareInstalled: body.softwareInstalled,
        logRetention: body.logRetention,
        previousUser: body.previousUser,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Asset Updated",
        entity: asset.productName,
        entityId: asset.id,
        details: `Asset ${asset.assetTag} updated`,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("System PUT error:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const asset = await prisma.systemAsset.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        action: "Asset Deleted",
        entity: asset.productName,
        entityId: asset.id,
        details: `Asset ${asset.assetTag} deleted`,
      },
    });

    return NextResponse.json({ message: "Asset deleted" });
  } catch (error) {
    console.error("System DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
