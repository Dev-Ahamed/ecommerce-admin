import db from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

import { categorySchema } from "@/schemas";
import { CategoryColumn } from "@/app/(dashboard)/[storeId]/(routes)/categories/components/columns";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    const validatedFields = categorySchema.safeParse(await req.json());

    if (!validatedFields.success) {
      return NextResponse.json("Invalid fields", { status: 400 });
    }
    const { name, billboardId } = validatedFields.data;
    const storeId = params.storeId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store Id is required", { status: 401 });
    }

    const storeByUserId = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return NextResponse.json("Unauthorized", { status: 404 });
    }

    const category = await db.category.create({
      data: {
        name,
        billboardId,
        storeId,
      },
    });

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.log("[CATEGORY_POST]", error);
    return NextResponse.json("Internal error: ", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const url = new URL(req.url);
  const pageIndex =
    parseInt(url.searchParams.get("pageIndex") as string, 10) || 0;
  const pageSize =
    parseInt(url.searchParams.get("pageSize") as string, 10) || 10;
  const searchTerm = url.searchParams.get("searchTerm") || "";

  try {
    // const { userId } = await auth();
    const storeId = params.storeId;

    // if (!userId) {
    //   return NextResponse.json("Unauthenticated", { status: 401 });
    // }

    if (!storeId) {
      return NextResponse.json("Store Id is required", { status: 401 });
    }

    const whereClause = {
      storeId: params.storeId,
      ...(searchTerm && {
        name: {
          contains: searchTerm,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };

    const categories = await db.category.findMany({
      where: whereClause,
      include: {
        billboard: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: pageIndex * pageSize,
      take: pageSize,
    });

    const totalRecords = await db.category.count({
      where: whereClause,
    });

    const formattedCategories: CategoryColumn[] = categories.map((item) => ({
      ...item,
      billboardLabel: item.billboard.label,
      createdAt: item.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json(
      { data: formattedCategories, totalRecords },
      { status: 200 }
    );
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    return NextResponse.json("Internal error: ", { status: 500 });
  }
}
