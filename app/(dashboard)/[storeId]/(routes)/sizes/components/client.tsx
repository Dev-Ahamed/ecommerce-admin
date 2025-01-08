"use client";

import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { PaginationState } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { SizeColumn, sizeColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

export const SizeClient = () => {
  const router = useRouter();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [data, setData] = useState<SizeColumn[]>([]);

  const fetchData = useCallback(async () => {
    startTransition(async () => {
      try {
        const res = await axios.get(
          `/api/${params.storeId}/sizes?pageIndex=${pagination.pageIndex}&pageSize=${pagination.pageSize}&searchTerm=${globalFilter}`
        );

        const data = res.data.data || [];
        const totalRecords = res.data.sizesTotalRecord || 0;

        setData(data);
        setTotalRecords(totalRecords);
      } catch (error) {
        toast.error("Failed to fetch sizes");
      }
    });
  }, [pagination, params.storeId, globalFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Sizes (${totalRecords})`}
          description="Manage your sizes here"
        />
        <Button onClick={() => router.push(`/${params.storeId}/sizes/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add more
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={sizeColumns}
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

      <Heading title="API" description="API calls for sizes" />
      <Separator />

      <ApiList entityName="sizes" entityIdName="sizeId" />
    </>
  );
};
