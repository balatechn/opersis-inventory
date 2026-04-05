import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const software = await prisma.software.findUnique({
      where: { id: params.id },
    });

    if (!software) {
      return NextResponse.json({ error: "Software not found" }, { status: 404 });
    }

    if (!software.renewalCycle || software.renewalCycle === "NONE") {
      return NextResponse.json({ error: "No renewal cycle configured" }, { status: 400 });
    }

    const now = new Date();
    let nextRenewalDate: Date;
    let nextExpiryDate: Date;

    if (software.renewalCycle === "MONTHLY") {
      nextRenewalDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      nextExpiryDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    } else {
      // YEARLY
      nextRenewalDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      nextExpiryDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    }

    const updated = await prisma.software.update({
      where: { id: params.id },
      data: {
        renewalDate: nextRenewalDate,
        expiryDate: nextExpiryDate,
      },
    });

    const cycleName = software.renewalCycle === "MONTHLY" ? "monthly" : "yearly";
    const formattedDate = nextRenewalDate.toISOString().split("T")[0];

    await prisma.auditLog.create({
      data: {
        action: "Software Renewed",
        entity: software.name,
        entityId: software.id,
        details: `Software ${software.name} renewed (${cycleName}). Next renewal: ${formattedDate}`,
      },
    });

    return NextResponse.json({
      message: `Renewed successfully. Next renewal: ${formattedDate}`,
      software: updated,
    });
  } catch (error) {
    console.error("Software renew error:", error);
    return NextResponse.json({ error: "Failed to renew software" }, { status: 500 });
  }
}
