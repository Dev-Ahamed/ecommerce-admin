import db from "@/lib/db";
import { storeSchema } from "@/schemas";
import { auth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const validatedFields = storeSchema.safeParse(await req.json());

    if (!validatedFields.success) {
      return NextResponse.json("Invalid fields", { status: 400 });
    }
    const { name } = validatedFields.data;

    if (!userId) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const store = await db.store.create({
      data: {
        name,
        userId,
      },
    });

    return NextResponse.json(store, { status: 200 });
  } catch (error) {
    console.log("[STORES_POST]", error);
    return NextResponse.json("Internal error: ", { status: 500 });
  }
}
