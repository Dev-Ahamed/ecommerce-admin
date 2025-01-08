import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(1),
});

export const settingsSchema = z.object({
  name: z.string().min(1),
});

export const billboardSchema = z.object({
  label: z.string().min(1, { message: "Label is required" }),
  imageUrl: z.string().min(1, { message: "Image is requird" }),
});

export const categorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  billboardId: z.string().min(1, { message: "Billboard is requird" }),
});

export const sizeSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  value: z.string().min(1, { message: "Value is requird" }),
});

export const colorSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  value: z
    .string()
    .min(4, { message: "Value is requird" })
    .regex(/^#/, { message: "Value must be in hex code" }),
});

export const productSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1, { message: "Price is required" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  colorId: z.string().min(1, { message: "Color is required" }),
  sizeId: z.string().min(1, { message: "Size is required" }),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});
