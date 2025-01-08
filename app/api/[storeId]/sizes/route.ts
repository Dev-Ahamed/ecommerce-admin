import db from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { sizeSchema } from "@/schemas";
import { getSizes } from "@/data/Sizes";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    const validatedFields = sizeSchema.safeParse(await req.json());

    if (!validatedFields.success) {
      return NextResponse.json("Invalid fields", { status: 400 });
    }
    const { name, value } = validatedFields.data;
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

    const size = await db.size.create({
      data: {
        storeId,
        name,
        value,
      },
    });

    return NextResponse.json(size, { status: 200 });
  } catch (error) {
    console.log("[SIZE_POST]", error);
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

    const pagination = { pageIndex, pageSize };

    const sizes = await getSizes({ pagination, params, searchTerm });

    return NextResponse.json(
      { data: sizes.data, sizesTotalRecord: sizes.totalRecords },
      { status: 200 }
    );
  } catch (error) {
    console.log("[SIZE_GET]", error);
    return NextResponse.json("Internal error: ", { status: 500 });
  }
}
