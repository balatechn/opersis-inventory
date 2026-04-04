import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User GET error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const data: any = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.role !== undefined) data.role = body.role;
    if (body.active !== undefined) data.active = body.active;

    if (body.password && body.password.trim()) {
      data.password = await bcrypt.hash(body.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "User Updated",
        entity: user.name,
        entityId: user.id,
        details: `User ${user.name} (${user.email}) updated`,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    console.error("User PUT error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        action: "User Deleted",
        entity: user.name,
        entityId: user.id,
        details: `User ${user.name} (${user.email}) deleted`,
      },
    });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("User DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
