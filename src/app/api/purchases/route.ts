import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (search) {
      where.OR = [
        { productName: { contains: search, mode: "insensitive" } },
        { requestedBy: { contains: search, mode: "insensitive" } },
        { vendorName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.purchase.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error("Purchases GET error:", error);
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const purchase = await prisma.purchase.create({
      data: {
        requestedBy: body.requestedBy,
        department: body.department || null,
        company: body.company || "NCPL",
        productName: body.productName,
        category: body.category || "HARDWARE",
        quantity: body.quantity || 1,
        estimatedCost: body.estimatedCost || null,
        vendorName: body.vendorName || null,
        vendorContact: body.vendorContact || null,
        purchaseMethod: body.purchaseMethod || "COMPANY_PURCHASE",
        justification: body.justification || null,
        priority: body.priority || "Normal",
        status: body.status || "PENDING",
        approvedBy: body.approvedBy || null,
        approvalDate: body.approvalDate ? new Date(body.approvalDate) : null,
        actualCost: body.actualCost || null,
        invoiceNumber: body.invoiceNumber || null,
        expectedDelivery: body.expectedDelivery ? new Date(body.expectedDelivery) : null,
        quotationReceived: body.quotationReceived || false,
        purchaseOrderSent: body.purchaseOrderSent || false,
        paymentDone: body.paymentDone || false,
        delivered: body.delivered || false,
        remarks: body.remarks || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Purchase Request Created",
        entity: purchase.productName,
        entityId: purchase.id,
        details: `Purchase request for ${purchase.productName} by ${purchase.requestedBy}`,
      },
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("Purchases POST error:", error);
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}
