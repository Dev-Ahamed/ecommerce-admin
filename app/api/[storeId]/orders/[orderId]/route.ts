import db from "@/lib/db";
import { billboardSchema } from "@/schemas";
import { auth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = await auth();
    const storeId = params.storeId;
    const billboardId = params.billboardId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    if (!billboardId) {
      return NextResponse.json("Billboard Id is required", { status: 401 });
    }

    const billboard = await db.billboard.findUnique({
      where: { id: billboardId, storeId },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_GET]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = await auth();
    const validatedFields = billboardSchema.safeParse(await req.json());

    if (!validatedFields.success) {
      return NextResponse.json("Invalid fields", { status: 400 });
    }

    const { label, imageUrl } = validatedFields.data;
    const storeId = params.storeId;
    const billboardId = params.billboardId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store Id is required", { status: 401 });
    }

    if (!billboardId) {
      return NextResponse.json("Billboard Id is required", { status: 401 });
    }

    const storeByUserId = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return NextResponse.json("Unauthorized", { status: 404 });
    }

    const billboard = await db.billboard.update({
      where: { id: billboardId, storeId },
      data: {
        label,
        imageUrl,
      },
    });

    return NextResponse.json(billboard, { status: 200 });
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error);
    return NextResponse.json("Internal error: ", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = await auth();
    const storeId = params.storeId;
    const billboardId = params.billboardId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    if (!billboardId) {
      return NextResponse.json("Billboard Id is required", { status: 401 });
    }

    const storeByUserId = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return NextResponse.json("Unauthorized", { status: 404 });
    }

    const deletedBillboard = await db.billboard.deleteMany({
      where: { id: billboardId, storeId },
    });

    return NextResponse.json(deletedBillboard);
  } catch (error) {
    console.log("[BILLBOARD_DELETE]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}
