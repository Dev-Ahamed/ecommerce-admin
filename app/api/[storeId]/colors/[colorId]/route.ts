import db from "@/lib/db";
import { colorSchema } from "@/schemas";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { userId } = await auth();
    const storeId = params.storeId;
    const colorId = params.colorId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    if (!colorId) {
      return NextResponse.json("Color Id is required", { status: 401 });
    }

    const color = await db.color.findUnique({
      where: { id: colorId, storeId },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_GET]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { userId } = await auth();
    const validatedFields = colorSchema.safeParse(await req.json());

    if (!validatedFields.success) {
      return NextResponse.json("Invalid fields", { status: 400 });
    }

    const { name, value } = validatedFields.data;
    const storeId = params.storeId;
    const colorId = params.colorId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store Id is required", { status: 401 });
    }

    if (!colorId) {
      return NextResponse.json("Color Id is required", { status: 401 });
    }

    const storeByUserId = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return NextResponse.json("Unauthorized", { status: 404 });
    }

    const color = await db.color.update({
      where: { id: colorId, storeId },
      data: {
        name,
        value,
      },
    });

    revalidatePath(`/${storeId}/colors`);

    return NextResponse.json(color, { status: 200 });
  } catch (error) {
    console.log("[COLOR_PATCH]", error);
    return NextResponse.json("Internal error: ", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { userId } = await auth();
    const storeId = params.storeId;
    const colorId = params.colorId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    if (!colorId) {
      return NextResponse.json("Color Id is required", { status: 401 });
    }

    const storeByUserId = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return NextResponse.json("Unauthorized", { status: 404 });
    }

    const deletedColor = await db.color.deleteMany({
      where: { id: colorId, storeId },
    });

    return NextResponse.json(deletedColor);
  } catch (error) {
    console.log("[COLOR_DELETE]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}
