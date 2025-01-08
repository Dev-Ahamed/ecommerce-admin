import db from "@/lib/db";
import { categorySchema } from "@/schemas";
import { auth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    // const { userId } = await auth();
    const storeId = params.storeId;
    const categoryId = params.categoryId;

    // if (!userId) {
    //   return NextResponse.json("Unauthenticated", { status: 401 });
    // }

    if (!storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json("Category Id is required", { status: 401 });
    }

    const category = await db.category.findUnique({
      where: { id: categoryId, storeId },
      include: {
        billboard: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_GET]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = await auth();
    const validatedFields = categorySchema.safeParse(await req.json());

    if (!validatedFields.success) {
      return NextResponse.json("Invalid fields", { status: 400 });
    }

    const { name, billboardId } = validatedFields.data;
    const storeId = params.storeId;
    const categoryId = params.categoryId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store Id is required", { status: 401 });
    }

    if (!categoryId) {
      return NextResponse.json("Category Id is required", { status: 401 });
    }

    const storeByUserId = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return NextResponse.json("Unauthorized", { status: 404 });
    }

    const category = await db.category.update({
      where: { id: categoryId, storeId },
      data: {
        name,
        billboardId,
      },
    });

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    return NextResponse.json("Internal error: ", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = await auth();
    const storeId = params.storeId;
    const categoryId = params.categoryId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json("Category Id is required", { status: 401 });
    }

    const storeByUserId = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return NextResponse.json("Unauthorized", { status: 404 });
    }

    const deletedCategory = await db.category.deleteMany({
      where: { id: categoryId, storeId },
    });

    return NextResponse.json(deletedCategory);
  } catch (error) {
    console.log("[CATEGORY_DELETE]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}
