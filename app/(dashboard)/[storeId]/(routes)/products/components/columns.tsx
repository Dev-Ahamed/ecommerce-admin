"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Button } from "@/components/ui/button";
import { ExpandableCard } from "@/components/ExpandableCard";
import { Category, Color, Image as ImageModel, Size } from "@prisma/client";
import { priceFormatter } from "@/lib/price-formatter";

export type ProductColumn = {
  id: string;
  name: string;
  price: number;
  size: Size;
  category: Category;
  color: Color;
  isFeatured: boolean;
  isArchived: boolean;
  createdAt: string;
  images: ImageModel[];
};

export const productColumns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => priceFormatter.format(row.original.price),
  },
  {
    accessorKey: "category.name",
    header: "Category",
  },
  {
    accessorKey: "size.value",
    header: "Size",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <span>{row.original.color.name}</span>
        <div
          className="h-6 w-6 rounded-full border"
          style={{ backgroundColor: row.original.color.value }}
        />
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
