import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: params.id },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Purchase GET error:", error);
    return NextResponse.json({ error: "Failed to fetch purchase" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const purchase = await prisma.purchase.update({
      where: { id: params.id },
      data: {
        requestedBy: body.requestedBy,
        department: body.department,
        company: body.company,
        productName: body.productName,
        category: body.category,
        quantity: body.quantity,
        estimatedCost: body.estimatedCost,
        vendorName: body.vendorName,
        vendorContact: body.vendorContact,
        purchaseMethod: body.purchaseMethod,
        justification: body.justification,
        priority: body.priority,
        status: body.status,
        approvedBy: body.approvedBy,
        approvalDate: body.approvalDate ? new Date(body.approvalDate) : undefined,
        actualCost: body.actualCost,
        invoiceNumber: body.invoiceNumber,
        expectedDelivery: body.expectedDelivery ? new Date(body.expectedDelivery) : undefined,
        quotationReceived: body.quotationReceived,
        purchaseOrderSent: body.purchaseOrderSent,
        paymentDone: body.paymentDone,
        delivered: body.delivered,
        remarks: body.remarks,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Purchase Updated",
        entity: purchase.productName,
        entityId: purchase.id,
        details: `Purchase ${purchase.productName} status: ${purchase.status}`,
      },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Purchase PUT error:", error);
    return NextResponse.json({ error: "Failed to update purchase" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purchase = await prisma.purchase.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        action: "Purchase Deleted",
        entity: purchase.productName,
        entityId: purchase.id,
        details: `Purchase request for ${purchase.productName} deleted`,
      },
    });

    return NextResponse.json({ message: "Purchase deleted" });
  } catch (error) {
    console.error("Purchase DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete purchase" }, { status: 500 });
  }
}
