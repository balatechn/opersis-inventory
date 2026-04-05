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
        const description = get(row, "description", "Description", "desc");
        if (!description) {
          errors.push(`Row ${i + 1}: description is required`);
          failed++;
          continue;
        }

        const amountStr = get(row, "amount", "Amount");
        const gstStr = get(row, "gst", "GST", "tax");
        const amount = amountStr ? parseFloat(amountStr) : 0;
        const gst = gstStr ? parseFloat(gstStr) : 0;
        const totalAmount = amount + gst;
        const dateStr = get(row, "date", "Date", "expenseDate", "expense_date");

        await prisma.expense.create({
          data: {
            description,
            type: get(row, "type", "Type", "expenseType", "expense_type") || "OTHER",
            vendor: get(row, "vendor", "Vendor"),
            amount: isNaN(amount) ? 0 : amount,
            gst: isNaN(gst) ? 0 : gst,
            totalAmount: isNaN(totalAmount) ? 0 : totalAmount,
            date: dateStr ? new Date(dateStr) : new Date(),
            invoiceNumber: get(row, "invoiceNumber", "invoicenumber", "invoice"),
            company: get(row, "company", "Company") || "NCPL",
            department: get(row, "department", "Department"),
            paymentStatus: get(row, "paymentStatus", "paymentstatus", "payment_status", "status") || "UNPAID",
            remarks: get(row, "remarks", "Remarks", "notes"),
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
        action: "Bulk Import - Expenses",
        entity: "Expense",
        details: `Bulk imported ${success} expenses (${failed} failed)`,
      },
    });

    return NextResponse.json({ success, failed, errors });
  } catch (error) {
    console.error("Bulk import expenses error:", error);
    return NextResponse.json({ error: "Bulk import failed" }, { status: 500 });
  }
}
