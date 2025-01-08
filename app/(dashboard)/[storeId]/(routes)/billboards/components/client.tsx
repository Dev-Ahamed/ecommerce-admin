"use client";

import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { PaginationState } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { BillboardColumn, billboardColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import useBillboards from "@/hooks/use-billboards";

export const BillboardClient = () => {
  const router = useRouter();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  // const {
  //   data: billboards,
  //   totalRecords: billboardsTotalCounts,
  //   fetchData: billboardsFetch,
  // } = useBillboards(params.storeId as string);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [data, setData] = useState<BillboardColumn[]>([]);

  const fetchData = useCallback(async () => {
    startTransition(async () => {
      // await billboardsFetch(pagination, globalFilter).then((res) => {
      //   console.log(res);

      //   setData(res.data);
      //   setTotalRecords(res.totalRecords);
      // });

      const res = await axios.get(
        `/api/${params.storeId}/billboards?pageIndex=${pagination.pageIndex}&pageSize=${pagination.pageSize}&searchTerm=${globalFilter}`
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
      <div className="flex items-center justify-between">
        <Heading
          title={`Billboards (${totalRecords})`}
          description="Manage your billboards here"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/billboards/new`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add more
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={billboardColumns}
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

      <Heading title="API" description="API calls for billboards" />
      <Separator />

      <ApiList entityName="billboards" entityIdName="billboardId" />
    </>
  );
};
