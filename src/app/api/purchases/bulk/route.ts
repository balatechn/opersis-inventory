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
        const productName = get(row, "productName", "productname", "product_name", "product");
        const requestedBy = get(row, "requestedBy", "requestedby", "requested_by", "requester");
        if (!productName || !requestedBy) {
          errors.push(`Row ${i + 1}: productName and requestedBy are required`);
          failed++;
          continue;
        }

        const estCostStr = get(row, "estimatedCost", "estimatedcost", "estimated_cost", "cost");
        const quantityStr = get(row, "quantity", "Quantity", "qty");

        await prisma.purchase.create({
          data: {
            productName,
            requestedBy,
            category: get(row, "category", "Category") || "HARDWARE",
            quantity: quantityStr ? parseInt(quantityStr) || 1 : 1,
            estimatedCost: estCostStr ? parseFloat(estCostStr) || null : null,
            vendorName: get(row, "vendorName", "vendorname", "vendor_name", "vendor"),
            company: get(row, "company", "Company") || "NCPL",
            department: get(row, "department", "Department"),
            priority: get(row, "priority", "Priority") || "Normal",
            justification: get(row, "justification", "Justification", "reason"),
            remarks: get(row, "remarks", "Remarks", "notes"),
            status: "PENDING",
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
        action: "Bulk Import - Purchases",
        entity: "Purchase",
        details: `Bulk imported ${success} purchases (${failed} failed)`,
      },
    });

    return NextResponse.json({ success, failed, errors });
  } catch (error) {
    console.error("Bulk import purchases error:", error);
    return NextResponse.json({ error: "Bulk import failed" }, { status: 500 });
  }
}
