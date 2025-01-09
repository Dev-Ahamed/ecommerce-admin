import db from "@/lib/db";
import { priceFormatter } from "@/lib/price-formatter";
import { productSchema } from "@/schemas";
import { auth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    // const { userId } = await auth();
    const storeId = params.storeId;
    const productId = params.productId;

    // if (!userId) {
    //   return NextResponse.json("Unauthenticated", { status: 401 });
    // }

    if (!storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    if (!productId) {
      return NextResponse.json("Product Id is required", { status: 401 });
    }

    const product = await db.product.findUnique({
      where: { id: productId, storeId },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
    });

    // const formattedProduct = {
    //   ...product,
    //   price: product?.price
    //     ? priceFormatter.format(product?.price.toNumber())
    //     : "N/A",
    // };

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
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
    const productId = params.productId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store Id is required", { status: 401 });
    }

    if (!productId) {
      return NextResponse.json("Product Id is required", { status: 401 });
    }

    const storeByUserId = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return NextResponse.json("Unauthorized", { status: 404 });
    }

    const product = await db.product.update({
      where: { id: productId, storeId },
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
          deleteMany: {},
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return NextResponse.json("Internal error: ", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = await auth();
    const storeId = params.storeId;
    const productId = params.productId;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json("Store ID is required", { status: 400 });
    }

    if (!productId) {
      return NextResponse.json("Product Id is required", { status: 401 });
    }

    const storeByUserId = await db.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return NextResponse.json("Unauthorized", { status: 404 });
    }

    const deletedProduct = await db.product.deleteMany({
      where: { id: productId, storeId },
    });

    return NextResponse.json(deletedProduct);
  } catch (error) {
    console.log("[PRODUCT_DELETE]: ", error);
    return NextResponse.json("Internal error", { status: 500 });
  }
}
