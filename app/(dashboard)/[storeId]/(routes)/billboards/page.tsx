import db from "@/lib/db";
import { PaginationState } from "@tanstack/react-table";

import { BillboardClient } from "./components/client";
import { BillboardColumn } from "./components/columns";

export default async function BillboardsPage({
  params,
}: {
  params: { storeId: string };
}) {
  const fetchBillboards = async (pagination: PaginationState) => {
    const billboards = await db.billboard.findMany({
      where: {
        storeId: params.storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });

    const totalRecords = await db.billboard.count({
      where: {
        storeId: params.storeId,
      },
    });

    const formattedBillboards: BillboardColumn[] = billboards.map((item) => ({
      id: item.id,
      label: item.label,
      createdAt: item.createdAt.toISOString().split("T")[0],
    }));

    return { data: formattedBillboards, totalRecords };
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient />
      </div>
    </div>
  );
}
