import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    // Get assets with warranty expiry within 90 days or already expired
    const warrantyAlerts = await prisma.systemAsset.findMany({
      where: {
        warrantyExpiry: { not: null, lte: ninetyDaysFromNow },
        status: { not: "SCRAP" },
      },
      select: {
        id: true, assetTag: true, productName: true, make: true,
        warrantyExpiry: true, status: true, company: true, department: true,
      },
      orderBy: { warrantyExpiry: "asc" },
    });

    // Get software with expiry/renewal within 90 days or already expired
    const licenseAlerts = await prisma.software.findMany({
      where: {
        OR: [
          { expiryDate: { not: null, lte: ninetyDaysFromNow } },
          { renewalDate: { not: null, lte: ninetyDaysFromNow } },
        ],
      },
      select: {
        id: true, name: true, vendor: true, licenseType: true,
        totalLicenses: true, usedLicenses: true, expiryDate: true,
        renewalDate: true, costPerLicense: true,
      },
      orderBy: { expiryDate: "asc" },
    });

    const categorize = (date: Date | null) => {
      if (!date) return "unknown";
      if (date < now) return "expired";
      if (date <= thirtyDaysFromNow) return "critical";
      if (date <= sixtyDaysFromNow) return "warning";
      return "upcoming";
    };

    const warranties = warrantyAlerts.map((a) => ({
      ...a,
      severity: categorize(a.warrantyExpiry),
      type: "warranty" as const,
    }));

    const licenses = licenseAlerts.map((s) => ({
      ...s,
      severity: categorize(s.expiryDate || s.renewalDate),
      type: "license" as const,
    }));

    return NextResponse.json({
      warranties,
      licenses,
      summary: {
        expiredWarranties: warranties.filter((w) => w.severity === "expired").length,
        criticalWarranties: warranties.filter((w) => w.severity === "critical").length,
        expiredLicenses: licenses.filter((l) => l.severity === "expired").length,
        criticalLicenses: licenses.filter((l) => l.severity === "critical").length,
        totalAlerts: warranties.length + licenses.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
