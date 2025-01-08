"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import axios from "axios";

import { Size } from "@prisma/client";
import { sizeSchema } from "@/schemas";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";

interface SizeFormProps {
  initialData: Size | null;
}

export const SizeForm = ({ initialData }: SizeFormProps) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const title = initialData === null ? "Create size" : "Edit size";
  const description = initialData === null ? "Add a new size" : "Edit a size";
  const toastMessage = initialData === null ? "Size created" : "Size updated";
  const action = initialData === null ? "Create" : "Save changes";

  const form = useForm<z.infer<typeof sizeSchema>>({
    resolver: zodResolver(sizeSchema),
    defaultValues: initialData || {
      name: "",
      value: "",
    },
  });

  async function onSubmit(values: z.infer<typeof sizeSchema>) {
    startTransition(async () => {
      try {
        let res;
        if (initialData) {
          res = await axios.patch(
            `/api/${params.storeId}/sizes/${params.sizeId}`,
            values
          );
          const data = res.data;
          form.reset({
            name: data.name,
            value: data.value,
          });
        } else {
          res = await axios.post(`/api/${params.storeId}/sizes`, values);
          form.reset();
        }

        router.refresh();
        router.push(`/${params.storeId}/sizes`);
        toast.success(toastMessage);
      } catch (error) {
        // console.log({ error });
        toast.error("Something went wrong");
      }
    });
  }

  async function onDelete() {
    startTransition(async () => {
      try {
        await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`);

        form.reset();
        toast.success("Size deleted");
        router.refresh();
        router.push(`/${params.storeId}/sizes`);
      } catch (error) {
        toast.error("Make sure you removed all products using this size first");
      } finally {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isPending}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={isPending}
            variant={"destructive"}
            size={"sm"}
            onClick={() => setOpen(true)}
          >
            <Trash className="w-4 h-4" />
            Delete
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Size name"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Size value"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isPending} className="ml-auto">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
