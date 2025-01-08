import { SizeColumn } from "@/app/(dashboard)/[storeId]/(routes)/sizes/components/columns";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";

import { PaginationState } from "@tanstack/react-table";

interface getSizesProps {
  pagination: PaginationState;
  params: { storeId: string };
  searchTerm?: string;
}

export const getColors = async ({
  pagination,
  params,
  searchTerm,
}: getSizesProps) => {
  const whereClause = {
    storeId: params.storeId,
    ...(searchTerm && {
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          value: {
            contains: searchTerm,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    }),
  };

  const colors = await db.color.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
  });

  const totalRecords = await db.color.count({
    where: whereClause,
  });

  const formattedColors: SizeColumn[] = colors.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString().split("T")[0],
  }));

  return { data: formattedColors, totalRecords };
};
