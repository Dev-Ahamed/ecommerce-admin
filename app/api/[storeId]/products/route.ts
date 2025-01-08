import db from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

import { productSchema } from "@/schemas";
import { ProductColumn } from "@/app/(dashboard)/[storeId]/(routes)/products/components/columns";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    const validatedFields = productSchema.safeParse(await req.json());

    if (!validatedFields.success) {
      return NextResponse.json("Invalid fields", { status: 400 });
    }
    const {
      name,
      images,
      price,
      categoryId,
      colorId,
      sizeId,
      isFeatured,
      isArchived,
    } = validatedFields.data;
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

    if (!images || !images.length) {
      return NextResponse.json("At least one image is required", {
        status: 400,
      });
    }

    const product = await db.product.create({
      data: {
        storeId,
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.log("[PRODUCT_POST]", error);
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

  const categoryId = url.searchParams.get("categoryId") || "";
  const colorId = url.searchParams.get("colorId") || "";
  const sizeId = url.searchParams.get("sizeId") || "";

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
      ...(categoryId && { categoryId }),
      ...(sizeId && { sizeId }),
      ...(colorId && { colorId }),
      ...(searchTerm && {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          ...(isNaN(parseFloat(searchTerm))
            ? []
            : [
                {
                  price: {
                    equals: parseFloat(searchTerm),
                  },
                },
              ]),
        ],
      }),
      isArchived: false,
    };

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        category: true,
        size: true,
        color: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: pageIndex * pageSize,
      take: pageSize,
    });

    const totalRecords = await db.product.count({
      where: whereClause,
    });

    const formattedProducts: ProductColumn[] = products.map((item) => ({
      ...item,
      price: item.price.toNumber(),
      // category: item.category.name,
      // size: item.size.value,
      // color: item.color.value,
      createdAt: item.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json(
      { data: formattedProducts, totalRecords },
      { status: 200 }
    );
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return NextResponse.json("Internal error: ", { status: 500 });
  }
}
