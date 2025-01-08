"use client";

import Image from "next/image";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Button } from "@/components/ui/button";
import { ExpandableCard } from "@/components/ExpandableCard";

export type BillboardColumn = {
  id: string;
  label: string;
  imageUrl?: string;
  createdAt: string;
};

export const billboardColumns: ColumnDef<BillboardColumn>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.original.imageUrl || "";
      return (
        <div className="relative flex justify-start">
          <Button asChild>
            <>
              {/* <Image
                fill
                src={row.original.imageUrl || ""}
                alt="Image"
                className="object-contain"
              /> */}
              <ExpandableCard data={row.original} />
            </>
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "label",
    header: "Label",
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
