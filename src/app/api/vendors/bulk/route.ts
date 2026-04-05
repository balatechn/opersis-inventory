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
        const name = get(row, "name", "vendorName", "vendor_name", "Name");
        if (!name) {
          errors.push(`Row ${i + 1}: name is required`);
          failed++;
          continue;
        }

        await prisma.vendor.create({
          data: {
            name,
            contactPerson: get(row, "contactPerson", "contactperson", "contact_person", "contact"),
            email: get(row, "email", "Email"),
            phone: get(row, "phone", "Phone", "mobile"),
            address: get(row, "address", "Address"),
            city: get(row, "city", "City"),
            state: get(row, "state", "State"),
            gstNumber: get(row, "gstNumber", "gstnumber", "gst_number", "gst", "GST"),
            panNumber: get(row, "panNumber", "pannumber", "pan_number", "pan", "PAN"),
            bankDetails: get(row, "bankDetails", "bankdetails", "bank_details", "bank"),
            category: get(row, "category", "Category") || "GENERAL",
            website: get(row, "website", "Website", "url"),
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
        action: "Bulk Import - Vendors",
        entity: "Vendor",
        details: `Bulk imported ${success} vendors (${failed} failed)`,
      },
    });

    return NextResponse.json({ success, failed, errors });
  } catch (error) {
    console.error("Bulk import vendors error:", error);
    return NextResponse.json({ error: "Bulk import failed" }, { status: 500 });
  }
}
