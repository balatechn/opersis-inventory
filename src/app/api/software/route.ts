import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (type && type !== "ALL") where.licenseType = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { vendor: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.software.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.software.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error("Software GET error:", error);
    return NextResponse.json({ error: "Failed to fetch software" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const software = await prisma.software.create({
      data: {
        name: body.name,
        vendor: body.vendor || null,
        licenseType: body.licenseType || "SUBSCRIPTION",
        licenseKey: body.licenseKey || null,
        totalLicenses: body.totalLicenses || 0,
        usedLicenses: body.usedLicenses || 0,
        costPerLicense: body.costPerLicense || null,
        renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        invoiceNumber: body.invoiceNumber || null,
        notes: body.notes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Software Added",
        entity: software.name,
        entityId: software.id,
        details: `Software ${software.name} added (${software.licenseType})`,
      },
    });

    return NextResponse.json(software, { status: 201 });
  } catch (error) {
    console.error("Software POST error:", error);
    return NextResponse.json({ error: "Failed to create software" }, { status: 500 });
  }
}
