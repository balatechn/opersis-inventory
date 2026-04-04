import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalAssets, totalSoftware, pendingPayments, expenses, upcomingRenewals] =
      await Promise.all([
        prisma.systemAsset.count(),
        prisma.software.count(),
        prisma.expense.count({ where: { paymentStatus: "UNPAID" } }),
        prisma.expense.findMany({
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          select: { totalAmount: true },
        }),
        prisma.software.count({
          where: {
            expiryDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    const monthlyExpense = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

    // Expense trend (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      months.push({ start, end, month: d.toLocaleString("en", { month: "short" }) });
    }

    const expenseTrend = await Promise.all(
      months.map(async (m) => {
        const agg = await prisma.expense.aggregate({
          where: { date: { gte: m.start, lte: m.end } },
          _sum: { totalAmount: true },
        });
        return { month: m.month, amount: agg._sum.totalAmount || 0 };
      })
    );

    // Expense by category
    const byCategory = await prisma.expense.groupBy({
      by: ["type"],
      _sum: { totalAmount: true },
    });
    const expenseByCategory = byCategory.map((c) => ({
      name: c.type,
      value: c._sum.totalAmount || 0,
    }));

    // Asset distribution by location
    const byLocation = await prisma.systemAsset.groupBy({
      by: ["location"],
      _count: true,
      where: { location: { not: null } },
    });
    const assetByLocation = byLocation.map((l) => ({
      name: l.location || "Unknown",
      value: l._count,
    }));

    // Recent activity from audit logs
    const logs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, action: true, entity: true, createdAt: true },
    });
    const recentActivity = logs.map((l) => ({
      id: l.id,
      action: l.action,
      entity: l.entity,
      time: getRelativeTime(l.createdAt),
    }));

    return NextResponse.json({
      totalAssets,
      totalSoftware,
      monthlyExpense,
      pendingPayments,
      upcomingRenewals,
      expenseTrend,
      expenseByCategory,
      assetByLocation,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}

function getRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
