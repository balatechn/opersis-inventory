import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Expense GET error:", error);
    return NextResponse.json({ error: "Failed to fetch expense" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const amount = body.amount !== undefined ? parseFloat(body.amount) : undefined;
    const gst = body.gst !== undefined ? parseFloat(body.gst) : undefined;
    const totalAmount =
      amount !== undefined && gst !== undefined ? amount + gst : undefined;

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        description: body.description,
        type: body.type,
        vendor: body.vendor,
        amount,
        gst,
        totalAmount,
        date: body.date ? new Date(body.date) : undefined,
        invoiceNumber: body.invoiceNumber,
        company: body.company,
        department: body.department,
        paymentStatus: body.paymentStatus,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
        remarks: body.remarks,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Expense Updated",
        entity: expense.description,
        entityId: expense.id,
        details: `Expense ₹${expense.totalAmount.toFixed(2)} updated`,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Expense PUT error:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await prisma.expense.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        action: "Expense Deleted",
        entity: expense.description,
        entityId: expense.id,
        details: `Expense ₹${expense.totalAmount.toFixed(2)} deleted`,
      },
    });

    return NextResponse.json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Expense DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
