import { SizeColumn } from "@/app/(dashboard)/[storeId]/(routes)/sizes/components/columns";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";

import { PaginationState } from "@tanstack/react-table";

interface getSizesProps {
  pagination: PaginationState;
  params: { storeId: string };
  searchTerm?: string;
}

export const getSizes = async ({
  pagination,
  params,
  searchTerm,
}: getSizesProps) => {
  const whereClause = {
    storeId: params.storeId,
    ...(searchTerm && {
      name: {
        contains: searchTerm,
        mode: Prisma.QueryMode.insensitive,
      },
      value: {
        contains: searchTerm,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
  };

  const sizes = await db.size.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
  });

  const totalRecords = await db.size.count({
    where: whereClause,
  });

  const formattedSizes: SizeColumn[] = sizes.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString().split("T")[0],
  }));

  return { data: formattedSizes, totalRecords };
};
