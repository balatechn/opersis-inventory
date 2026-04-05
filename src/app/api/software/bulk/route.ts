import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { headers, rows } = await req.json();
    if (!headers || !rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const colMap: Record<string, number> = {};
    headers.forEach((h: string, i: number) => {
      colMap[h.toLowerCase().replace(/[^a-z0-9]/g, "")] = i;
    });

    const get = (row: string[], ...keys: string[]) => {
      for (const k of keys) {
        const idx = colMap[k.toLowerCase().replace(/[^a-z0-9]/g, "")];
        if (idx !== undefined && row[idx]?.trim()) return row[idx].trim();
      }
      return null;
    };

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const name = get(row, "name", "softwareName", "software_name", "software", "Name");
        if (!name) {
          errors.push(`Row ${i + 1}: name is required`);
          failed++;
          continue;
        }

        const costStr = get(row, "costPerLicense", "costperlicense", "cost_per_license", "cost");
        const costPerLicense = costStr ? parseFloat(costStr) : null;
        const totalLicStr = get(row, "totalLicenses", "totallicenses", "total_licenses", "licenses");
        const usedLicStr = get(row, "usedLicenses", "usedlicenses", "used_licenses", "used");
        const expiryDate = get(row, "expiryDate", "expirydate", "expiry_date", "expiry");
        const renewalDate = get(row, "renewalDate", "renewaldate", "renewal_date", "renewal");
        const purchaseDate = get(row, "purchaseDate", "purchasedate", "purchase_date");

        await prisma.software.create({
          data: {
            name,
            vendor: get(row, "vendor", "Vendor"),
            company: get(row, "company", "Company") || "National Consulting",
            department: get(row, "department", "Department"),
            licenseType: (get(row, "licenseType", "licensetype", "license_type", "type") as any) || "SUBSCRIPTION",
            totalLicenses: totalLicStr ? parseInt(totalLicStr) || 0 : 0,
            usedLicenses: usedLicStr ? parseInt(usedLicStr) || 0 : 0,
            costPerLicense: isNaN(costPerLicense as number) ? null : costPerLicense,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            renewalDate: renewalDate ? new Date(renewalDate) : null,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
            licenseKey: get(row, "licenseKey", "licensekey", "license_key", "key"),
            invoiceNumber: get(row, "invoiceNumber", "invoicenumber", "invoice"),
            category: get(row, "category", "Category"),
            notes: get(row, "notes", "Notes", "remarks"),
          },
        });
        success++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err?.message?.slice(0, 80) || "Unknown error"}`);
        failed++;
      }
    }

    await prisma.auditLog.create({
      data: {
        action: "Bulk Import - Software",
        entity: "Software",
        details: `Bulk imported ${success} software (${failed} failed)`,
      },
    });

    return NextResponse.json({ success, failed, errors });
  } catch (error) {
    console.error("Bulk import software error:", error);
    return NextResponse.json({ error: "Bulk import failed" }, { status: 500 });
  }
}
