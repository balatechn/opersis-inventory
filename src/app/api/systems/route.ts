import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const company = searchParams.get("company");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (company && company !== "ALL") where.company = company;
    if (search) {
      where.OR = [
        { productName: { contains: search, mode: "insensitive" } },
        { assetTag: { contains: search, mode: "insensitive" } },
        { serialNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.systemAsset.findMany({
        where,
        include: { assignedUser: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.systemAsset.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error("Systems GET error:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const asset = await prisma.systemAsset.create({
      data: {
        assetTag: body.assetTag,
        productName: body.productName,
        serialNumber: body.serialNumber || null,
        make: body.make || null,
        config: body.config || null,
        osVersion: body.osVersion || null,
        company: body.company || "NCPL",
        department: body.department || null,
        location: body.location || null,
        vendorDetails: body.vendorDetails || null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        invoiceNumber: body.invoiceNumber || null,
        cost: body.cost || null,
        warrantyPeriod: body.warrantyPeriod || null,
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
        maintenanceSchedule: body.maintenanceSchedule ? new Date(body.maintenanceSchedule) : null,
        status: body.status || "ACTIVE",
        remarks: body.remarks || null,
        phone: body.phone || null,
        emailId: body.emailId || null,
        officeAppId: body.officeAppId || null,
        softwareInstalled: body.softwareInstalled || null,
        logRetention: body.logRetention || null,
        previousUser: body.previousUser || null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "Asset Created",
        entity: asset.productName,
        entityId: asset.id,
        details: `Asset ${asset.assetTag} created`,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Systems POST error:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
