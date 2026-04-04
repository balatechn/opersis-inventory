import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const software = await prisma.software.findUnique({
      where: { id: params.id },
    });

    if (!software) {
      return NextResponse.json({ error: "Software not found" }, { status: 404 });
    }

    return NextResponse.json(software);
  } catch (error) {
    console.error("Software GET error:", error);
    return NextResponse.json({ error: "Failed to fetch software" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const software = await prisma.software.update({
      where: { id: params.id },
      data: {
        name: body.name,
        vendor: body.vendor,
        licenseType: body.licenseType,
        licenseKey: body.licenseKey,
        totalLicenses: body.totalLicenses,
        usedLicenses: body.usedLicenses,
        costPerLicense: body.costPerLicense,
        renewalDate: body.renewalDate ? new Date(body.renewalDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
        invoiceNumber: body.invoiceNumber,
        notes: body.notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Software Updated",
        entity: software.name,
        entityId: software.id,
        details: `Software ${software.name} updated`,
      },
    });

    return NextResponse.json(software);
  } catch (error) {
    console.error("Software PUT error:", error);
    return NextResponse.json({ error: "Failed to update software" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const software = await prisma.software.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        action: "Software Deleted",
        entity: software.name,
        entityId: software.id,
        details: `Software ${software.name} deleted`,
      },
    });

    return NextResponse.json({ message: "Software deleted" });
  } catch (error) {
    console.error("Software DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete software" }, { status: 500 });
  }
}
