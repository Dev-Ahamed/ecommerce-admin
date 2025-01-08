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
import { colorSchema } from "@/schemas";
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

interface ColorFormProps {
  initialData: Size | null;
}

export const ColorForm = ({ initialData }: ColorFormProps) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const title = initialData === null ? "Create color" : "Edit color";
  const description = initialData === null ? "Add a new color" : "Edit a color";
  const toastMessage = initialData === null ? "Color created" : "Color updated";
  const action = initialData === null ? "Create" : "Save changes";

  const form = useForm<z.infer<typeof colorSchema>>({
    resolver: zodResolver(colorSchema),
    defaultValues: initialData || {
      name: "",
      value: "",
    },
  });

  async function onSubmit(values: z.infer<typeof colorSchema>) {
    startTransition(async () => {
      try {
        let res;
        if (initialData) {
          res = await axios.patch(
            `/api/${params.storeId}/colors/${params.colorId}`,
            values
          );
          const data = res.data;
          form.reset({
            name: data.name,
            value: data.value,
          });
        } else {
          res = await axios.post(`/api/${params.storeId}/colors`, values);
          form.reset();
        }

        router.refresh();
        router.push(`/${params.storeId}/colors`);
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
        await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`);

        form.reset();
        toast.success("Color deleted");
        router.refresh();
        router.push(`/${params.storeId}/colors`);
      } catch (error) {
        toast.error(
          "Make sure you removed all products using this color first"
        );
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
                      placeholder="Color name"
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
                    <div className="flex items-center gap-x-4">
                      <Input
                        placeholder="Color value"
                        {...field}
                        value={field.value || "#fff"}
                        disabled={isPending}
                        type="color"
                      />
                      <div
                        className="border p-4 rounded-full"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
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
