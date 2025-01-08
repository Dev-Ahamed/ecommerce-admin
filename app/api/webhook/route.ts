import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import db from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const address = session?.customer_details?.address;

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ];

  const addressString = addressComponents.filter((c) => c !== null).join(", ");

  if (event.type === "checkout.session.completed") {
    // const order = await db.order.update({
    //   where: { id: session?.metadata?.orderId },
    //   data: {
    //     isPaid: true,
    //     address: addressString,
    //     phone: session?.customer_details?.phone || "",
    //   },
    //   include: {
    //     orderItems: true,
    //   },
    // });

    const productIds = JSON.parse(session?.metadata?.productIds || "[]");

    if (session?.metadata?.storeId) {
      const order = await db.order.create({
        data: {
          storeId: session?.metadata?.storeId,
          isPaid: true,
          address: addressString,
          phone: session?.customer_details?.phone || "",
          orderItems: {
            create: productIds.map((productId: string) => ({
              product: {
                connect: {
                  id: productId,
                },
              },
            })),
          },
        },
      });
    }

    // const productIds = order.orderItems.map((orderItem) => orderItem.productId);

    // await db.product.updateMany({
    //   where: {
    //     id: {
    //       in: [...productIds],
    //     },
    //   },
    //   data: {
    //     isArchived: true,
    //   },
    // });
  }

  return new NextResponse(null, { status: 200 });
}
