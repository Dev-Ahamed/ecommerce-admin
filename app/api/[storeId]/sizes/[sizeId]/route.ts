import db from "@/lib/db";
import { billboardSchema, sizeSchema } from "@/schemas";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { userId } = await auth();
    const storeId = params.storeId;
    const sizeId = params.sizeId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    if (!sizeId) {
      return NextResponse.json("Size Id is required", { status: 401 });
    }

    const size = await db.size.findUnique({
      where: { id: sizeId, storeId },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_GET]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { userId } = await auth();
    const validatedFields = sizeSchema.safeParse(await req.json());

    if (!validatedFields.success) {
      return NextResponse.json("Invalid fields", { status: 400 });
    }

    const { name, value } = validatedFields.data;
    const storeId = params.storeId;
    const sizeId = params.sizeId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store Id is required", { status: 401 });
    }

    if (!sizeId) {
      return NextResponse.json("Size Id is required", { status: 401 });
    }

    const storeByUserId = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return NextResponse.json("Unauthorized", { status: 404 });
    }

    const size = await db.size.update({
      where: { id: sizeId, storeId },
      data: {
        name,
        value,
      },
    });

    revalidatePath(`/${storeId}/sizes`);

    return NextResponse.json(size, { status: 200 });
  } catch (error) {
    console.log("[SIZE_PATCH]", error);
    return NextResponse.json("Internal error: ", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { userId } = await auth();
    const storeId = params.storeId;
    const sizeId = params.sizeId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    if (!sizeId) {
      return NextResponse.json("Size Id is required", { status: 401 });
    }

    const storeByUserId = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return NextResponse.json("Unauthorized", { status: 404 });
    }

    const deletedSize = await db.size.deleteMany({
      where: { id: sizeId, storeId },
    });

    return NextResponse.json(deletedSize);
  } catch (error) {
    console.log("[SIZE_DELETE]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}
