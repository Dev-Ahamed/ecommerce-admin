"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import axios from "axios";

import { Billboard, Category } from "@prisma/client";
import { categorySchema } from "@/schemas";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFormProps {
  initialData: Category | null;
  billboards: Billboard[];
}

export const CategoryForm = ({
  initialData,
  billboards,
}: CategoryFormProps) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const title = initialData === null ? "Create category" : "Edit category";
  const description =
    initialData === null ? "Add a new category" : "Edit a category";
  const toastMessage =
    initialData === null ? "Category created" : "Category updated";
  const action = initialData === null ? "Create" : "Save changes";

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: "",
      billboardId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof categorySchema>) {
    startTransition(async () => {
      try {
        let res;
        if (initialData) {
          res = await axios.patch(
            `/api/${params.storeId}/categories/${params.categoryId}`,
            values
          );
          const category = await res.data;
          form.reset({
            name: category.name,
            billboardId: category.billboardId,
          });
        } else {
          res = await axios.post(`/api/${params.storeId}/categories`, values);
          form.reset();
        }

        router.refresh();
        router.push(`/${params.storeId}/categories`);
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
        await axios.delete(
          `/api/${params.storeId}/categories/${params.categoryId}`
        );
        form.reset();
        toast.success("Category deleted");
        router.refresh();
        router.push(`/${params.storeId}/categories`);
      } catch (error) {
        toast.error(
          "Make sure you removed all products using this category first"
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
                      placeholder="Category name"
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
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a billboard" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billboards.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
