"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";

import { BillboardColumn } from "./columns";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/modals/alert-modal";
import { handleImageRemove } from "@/lib/image-utils";
import useBillboards from "@/hooks/use-billboards";

interface CellActionProps {
  data: BillboardColumn;
}

export const CellAction = ({ data }: CellActionProps) => {
  const router = useRouter();
  const params = useParams();
  //   const {
  //     data: billboards,
  //     totalRecords,
  //     fetchData,
  //   } = useBillboards(params.storeId as string);

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Copied");
  };

  const onDelete = async () => {
    startTransition(async () => {
      try {
        await axios.delete(`/api/${params.storeId}/billboards/${data.id}`);

        let imageDelete;
        if (data.imageUrl) {
          imageDelete = await handleImageRemove([data.imageUrl]);
        }
        router.refresh();
        // await fetchData({ pageIndex: 0, pageSize: 10 }, "");
        toast.success("BIllboard Deleted");
      } catch (error) {
        console.log("BILLBOARD_DELETE", error);
        toast.error("Something went wrong");
      } finally {
        setOpen(false);
      }
    });
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isPending}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Action</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/${params.storeId}/billboards/${data.id}`)
            }
          >
            <Edit className="w-4 h-4 mr-2" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="hover:!bg-destructive hover:!text-white"
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
