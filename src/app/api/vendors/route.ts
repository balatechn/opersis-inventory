import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const where: any = {};
    if (category && category !== "ALL") where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { gstNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const data = await prisma.vendor.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Vendors GET error:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const vendor = await prisma.vendor.create({
      data: {
        name: body.name,
        contactPerson: body.contactPerson || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        gstNumber: body.gstNumber || null,
        panNumber: body.panNumber || null,
        bankDetails: body.bankDetails || null,
        category: body.category || "GENERAL",
        website: body.website || null,
        notes: body.notes || null,
        active: body.active !== false,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Vendor Created",
        entity: vendor.name,
        entityId: vendor.id,
        details: `Vendor ${vendor.name} created`,
      },
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error("Vendors POST error:", error);
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}
