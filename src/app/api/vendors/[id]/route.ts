import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { id: params.id } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    return NextResponse.json(vendor);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vendor" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const vendor = await prisma.vendor.update({
      where: { id: params.id },
      data: {
        name: body.name,
        contactPerson: body.contactPerson,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        gstNumber: body.gstNumber,
        panNumber: body.panNumber,
        bankDetails: body.bankDetails,
        category: body.category,
        website: body.website,
        notes: body.notes,
        active: body.active,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Vendor Updated",
        entity: vendor.name,
        entityId: vendor.id,
        details: `Vendor ${vendor.name} updated`,
      },
    });

    return NextResponse.json(vendor);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendor.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        action: "Vendor Deleted",
        entity: vendor.name,
        entityId: vendor.id,
        details: `Vendor ${vendor.name} deleted`,
      },
    });

    return NextResponse.json({ message: "Vendor deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 });
  }
}
