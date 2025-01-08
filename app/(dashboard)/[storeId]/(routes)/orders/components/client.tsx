"use client";

import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { PaginationState } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { OrderColumn, orderColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

export const OrderClient = () => {
  const router = useRouter();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [data, setData] = useState<OrderColumn[]>([]);

  const fetchData = useCallback(async () => {
    startTransition(async () => {
      const res = await axios.get(
        `/api/${params.storeId}/orders?pageIndex=${pagination.pageIndex}&pageSize=${pagination.pageSize}&searchTerm=${globalFilter}`
      );

      if (!res.data) {
        setData([]);
        setTotalRecords(0);
      }
      const data = res.data.data;
      const totalRecords = res.data.totalRecords;

      setData(data);
      setTotalRecords(totalRecords);
    });
  }, [pagination, params.storeId, globalFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Heading
        title={`Orders (${totalRecords})`}
        description="Manage your orders here"
      />

      <Separator />
      <DataTable
        columns={orderColumns}
        data={data}
        pagination={pagination}
        setPagination={setPagination}
        totalRecords={totalRecords}
        setTotalRecords={setTotalRecords}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        isLoading={isPending}
        refreshTable={fetchData}
      />
    </>
  );
};
