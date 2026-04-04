import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");
    const year = searchParams.get("year");
    const period = searchParams.get("period");

    const where: any = {};
    if (company && company !== "ALL") where.company = company;
    if (year) where.year = parseInt(year);
    if (period && period !== "ALL") where.period = period;

    const data = await prisma.budget.findMany({
      where,
      orderBy: [{ year: "desc" }, { month: "asc" }],
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Budgets GET error:", error);
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const budget = await prisma.budget.create({
      data: {
        name: body.name,
        company: body.company || "NCPL",
        department: body.department || null,
        category: body.category || "OVERALL",
        period: body.period || "MONTHLY",
        month: body.month || null,
        year: body.year || new Date().getFullYear(),
        amount: parseFloat(body.amount) || 0,
        spent: parseFloat(body.spent) || 0,
        alertAt: parseFloat(body.alertAt) || 80,
        notes: body.notes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Budget Created",
        entity: budget.name,
        entityId: budget.id,
        details: `Budget ${budget.name} - ₹${budget.amount} for ${budget.period} ${budget.year}`,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Budgets POST error:", error);
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 });
  }
}
