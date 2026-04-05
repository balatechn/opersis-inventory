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
        const assetTag = get(row, "assetTag", "assettag", "asset_tag", "AssetTag");
        const productName = get(row, "productName", "productname", "product_name", "product", "ProductName");
        if (!assetTag || !productName) {
          errors.push(`Row ${i + 1}: assetTag and productName are required`);
          failed++;
          continue;
        }

        const costStr = get(row, "cost", "Cost", "price");
        const cost = costStr ? parseFloat(costStr) : null;
        const purchaseDate = get(row, "purchaseDate", "purchasedate", "purchase_date");
        const warrantyExpiry = get(row, "warrantyExpiry", "warrantyexpiry", "warranty_expiry");
        const maintenanceSchedule = get(row, "maintenanceSchedule", "maintenanceschedule", "maintenance_schedule");

        await prisma.systemAsset.create({
          data: {
            assetTag,
            productName,
            serialNumber: get(row, "serialNumber", "serialnumber", "serial_number", "serial"),
            make: get(row, "make", "brand", "Make"),
            config: get(row, "config", "configuration", "Config"),
            osVersion: get(row, "osVersion", "osversion", "os", "os_version"),
            company: (get(row, "company", "Company") as any) || "NCPL",
            department: get(row, "department", "Department"),
            location: get(row, "location", "Location"),
            vendorDetails: get(row, "vendorDetails", "vendordetails", "vendor"),
            purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
            invoiceNumber: get(row, "invoiceNumber", "invoicenumber", "invoice"),
            cost: isNaN(cost as number) ? null : cost,
            warrantyPeriod: get(row, "warrantyPeriod", "warrantyperiod", "warranty"),
            warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
            maintenanceSchedule: maintenanceSchedule ? new Date(maintenanceSchedule) : null,
            status: (get(row, "status", "Status") as any) || "ACTIVE",
            remarks: get(row, "remarks", "Remarks", "notes"),
            phone: get(row, "phone", "Phone"),
            emailId: get(row, "emailId", "emailid", "email"),
          },
        });
        success++;
      } catch (err: any) {
        const msg = err?.code === "P2002" ? "Duplicate assetTag" : (err?.message?.slice(0, 80) || "Unknown error");
        errors.push(`Row ${i + 1}: ${msg}`);
        failed++;
      }
    }

    await prisma.auditLog.create({
      data: {
        action: "Bulk Import - Systems",
        entity: "SystemAsset",
        details: `Bulk imported ${success} assets (${failed} failed)`,
      },
    });

    return NextResponse.json({ success, failed, errors });
  } catch (error) {
    console.error("Bulk import systems error:", error);
    return NextResponse.json({ error: "Bulk import failed" }, { status: 500 });
  }
}
