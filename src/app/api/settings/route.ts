import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_COMPANIES = [
  { value: "NCPL", label: "NCPL" },
  { value: "NIPL", label: "NIPL" },
  { value: "NRPL", label: "NRPL" },
  { value: "RAINLAND_AUTO_CORP", label: "Rainland Auto Corp" },
  { value: "ISKY", label: "ISKY" },
  { value: "OTHER", label: "Other" },
];

const DEFAULT_DEPARTMENTS = [
  "IT", "HR", "Finance", "Operations", "Sales", "Marketing", "Admin", "Management", "Legal", "Engineering",
];

const DEFAULT_LOCATIONS = [
  "Bangalore", "Ankola", "Chickmagalur", "Mumbai", "Delhi", "Chennai", "Hyderabad",
];

export async function GET() {
  try {
    let settings = await prisma.appSettings.findUnique({ where: { id: "default" } });

    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          id: "default",
          companies: JSON.stringify(DEFAULT_COMPANIES),
          departments: JSON.stringify(DEFAULT_DEPARTMENTS),
          locations: JSON.stringify(DEFAULT_LOCATIONS),
        },
      });
    }

    return NextResponse.json({
      orgName: settings.orgName,
      currency: settings.currency,
      depreciationRate: settings.depreciationRate,
      renewalAlertDays: settings.renewalAlertDays,
      companies: JSON.parse(settings.companies || "[]"),
      departments: JSON.parse(settings.departments || "[]"),
      locations: JSON.parse(settings.locations || "[]"),
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const settings = await prisma.appSettings.upsert({
      where: { id: "default" },
      update: {
        orgName: body.orgName,
        currency: body.currency,
        depreciationRate: body.depreciationRate ?? 25,
        renewalAlertDays: body.renewalAlertDays ?? 30,
        companies: JSON.stringify(body.companies || []),
        departments: JSON.stringify(body.departments || []),
        locations: JSON.stringify(body.locations || []),
      },
      create: {
        id: "default",
        orgName: body.orgName || "National Group India",
        currency: body.currency || "INR",
        depreciationRate: body.depreciationRate ?? 25,
        renewalAlertDays: body.renewalAlertDays ?? 30,
        companies: JSON.stringify(body.companies || DEFAULT_COMPANIES),
        departments: JSON.stringify(body.departments || DEFAULT_DEPARTMENTS),
        locations: JSON.stringify(body.locations || DEFAULT_LOCATIONS),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Settings Updated",
        entity: "AppSettings",
        entityId: settings.id,
        details: "Application settings updated",
      },
    });

    return NextResponse.json({
      orgName: settings.orgName,
      currency: settings.currency,
      depreciationRate: settings.depreciationRate,
      renewalAlertDays: settings.renewalAlertDays,
      companies: JSON.parse(settings.companies || "[]"),
      departments: JSON.parse(settings.departments || "[]"),
      locations: JSON.parse(settings.locations || "[]"),
    });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
