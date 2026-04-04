import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
    });
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }
    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch budget" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const budget = await prisma.budget.update({
      where: { id: params.id },
      data: {
        name: body.name,
        company: body.company,
        department: body.department,
        category: body.category,
        period: body.period,
        month: body.month,
        year: body.year,
        amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
        spent: body.spent !== undefined ? parseFloat(body.spent) : undefined,
        alertAt: body.alertAt !== undefined ? parseFloat(body.alertAt) : undefined,
        notes: body.notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Budget Updated",
        entity: budget.name,
        entityId: budget.id,
        details: `Budget ${budget.name} updated`,
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budget = await prisma.budget.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        action: "Budget Deleted",
        entity: budget.name,
        entityId: budget.id,
        details: `Budget ${budget.name} deleted`,
      },
    });

    return NextResponse.json({ message: "Budget deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}
