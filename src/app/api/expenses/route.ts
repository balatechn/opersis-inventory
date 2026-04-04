import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (type && type !== "ALL") where.type = type;
    if (paymentStatus && paymentStatus !== "ALL") where.paymentStatus = paymentStatus;
    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { vendor: { contains: search, mode: "insensitive" } },
        { invoiceNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error("Expenses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const amount = parseFloat(body.amount) || 0;
    const gst = parseFloat(body.gst) || 0;
    const totalAmount = amount + gst;

    const expense = await prisma.expense.create({
      data: {
        description: body.description,
        type: body.type || "HARDWARE",
        vendor: body.vendor || null,
        amount,
        gst,
        totalAmount,
        date: body.date ? new Date(body.date) : new Date(),
        invoiceNumber: body.invoiceNumber || null,
        company: body.company || "NCPL",
        department: body.department || null,
        paymentStatus: body.paymentStatus || "UNPAID",
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        remarks: body.remarks || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Expense Created",
        entity: expense.description,
        entityId: expense.id,
        details: `Expense ₹${expense.totalAmount.toFixed(2)} for ${expense.description}`,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Expenses POST error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
