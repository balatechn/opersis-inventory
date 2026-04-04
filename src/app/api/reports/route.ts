import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "monthly-expense";

    switch (type) {
      case "monthly-expense": {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const expenses = await prisma.expense.findMany({
          where: { date: { gte: sixMonthsAgo } },
          select: { date: true, type: true, totalAmount: true },
          orderBy: { date: "asc" },
        });

        const monthlyData: Record<string, Record<string, number>> = {};
        expenses.forEach((e) => {
          const month = e.date.toISOString().slice(0, 7);
          if (!monthlyData[month]) monthlyData[month] = {};
          const expType = e.type || "OTHER";
          monthlyData[month][expType] =
            (monthlyData[month][expType] || 0) + e.totalAmount;
        });

        const result = Object.entries(monthlyData).map(([month, types]) => ({
          month,
          ...types,
        }));

        return NextResponse.json(result);
      }

      case "vendor-spend": {
        const vendorExpenses = await prisma.expense.groupBy({
          by: ["vendor"],
          _sum: { totalAmount: true },
          _count: true,
          where: { vendor: { not: null } },
          orderBy: { _sum: { totalAmount: "desc" } },
          take: 10,
        });

        return NextResponse.json(
          vendorExpenses.map((v) => ({
            vendor: v.vendor || "Unknown",
            total: v._sum.totalAmount || 0,
            count: v._count,
          }))
        );
      }

      case "department-cost": {
        const deptExpenses = await prisma.expense.groupBy({
          by: ["department"],
          _sum: { totalAmount: true },
          where: { department: { not: null } },
          orderBy: { _sum: { totalAmount: "desc" } },
        });

        return NextResponse.json(
          deptExpenses.map((d) => ({
            department: d.department || "Unassigned",
            total: d._sum.totalAmount || 0,
          }))
        );
      }

      case "software-renewals": {
        const threeMonthsAhead = new Date();
        threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

        const renewals = await prisma.software.findMany({
          where: {
            OR: [
              { renewalDate: { lte: threeMonthsAhead } },
              { expiryDate: { lte: threeMonthsAhead } },
            ],
          },
          orderBy: { renewalDate: "asc" },
          select: {
            id: true,
            name: true,
            vendor: true,
            licenseType: true,
            costPerLicense: true,
            totalLicenses: true,
            renewalDate: true,
            expiryDate: true,
          },
        });

        return NextResponse.json(renewals);
      }

      case "asset-register": {
        const assets = await prisma.systemAsset.findMany({
          select: {
            id: true,
            assetTag: true,
            productName: true,
            make: true,
            serialNumber: true,
            company: true,
            department: true,
            location: true,
            status: true,
            cost: true,
            purchaseDate: true,
          },
          orderBy: { assetTag: "asc" },
        });

        return NextResponse.json(assets);
      }

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Reports GET error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
