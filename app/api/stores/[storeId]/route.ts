import db from "@/lib/db";
import { storeSchema } from "@/schemas";
import { auth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return NextResponse.json("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    const updatedStore = await db.store.updateMany({
      where: { id: params.storeId, userId },
      data: { name },
    });

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.log("[STORE_PATCH]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!params.storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    const deletedStore = await db.store.deleteMany({
      where: { id: params.storeId, userId },
    });

    return NextResponse.json(deletedStore);
  } catch (error) {
    console.log("[STORE_DELETE]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}
