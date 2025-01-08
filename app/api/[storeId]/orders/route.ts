import db from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { priceFormatter } from "@/lib/price-formatter";

import { billboardSchema } from "@/schemas";
import { OrderColumn } from "@/app/(dashboard)/[storeId]/(routes)/orders/components/columns";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    const validatedFields = billboardSchema.safeParse(await req.json());

    if (!validatedFields.success) {
      return NextResponse.json("Invalid fields", { status: 400 });
    }
    const { label, imageUrl } = validatedFields.data;
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

    const billboard = await db.billboard.create({
      data: {
        storeId,
        label,
        imageUrl,
      },
    });

    return NextResponse.json(billboard, { status: 200 });
  } catch (error) {
    console.log("[BILLBOARD_POST]", error);
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
        OR: [
          {
            id: {
              contains: searchTerm,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            products: {
              contains: searchTerm,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: pageIndex * pageSize,
      take: pageSize,
    });

    const totalRecords = await db.order.count({
      where: whereClause,
    });

    const formattedOrders: OrderColumn[] = orders.map((item) => ({
      ...item,
      products: item.orderItems
        .map((orderItem) => orderItem.product.name)
        .join(", "),
      totalPrice: priceFormatter.format(
        item.orderItems.reduce((total, item) => {
          return total + Number(item.product.price);
        }, 0)
      ),
      createdAt: item.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json(
      { data: formattedOrders, totalRecords },
      { status: 200 }
    );
  } catch (error) {
    console.log("[ORDER_GET]", error);
    return NextResponse.json("Internal error: ", { status: 500 });
  }
}
