"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import axios from "axios";

import { Billboard } from "@prisma/client";
import { billboardSchema } from "@/schemas";
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
import { ImageUpload } from "@/components/image-upload";
import { handleImageRemove, handleImageUpload } from "@/lib/image-utils";

interface BillboardFormProps {
  initialData: Billboard | null;
}

export const BillboardForm = ({ initialData }: BillboardFormProps) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const title = initialData === null ? "Create billboard" : "Edit Billboard";
  const description =
    initialData === null ? "Add a new billboard" : "Edit a Billboard";
  const toastMessage =
    initialData === null ? "Billboard created" : "Billboard updated";
  const action = initialData === null ? "Create" : "Save changes";

  const form = useForm<z.infer<typeof billboardSchema>>({
    resolver: zodResolver(billboardSchema),
    defaultValues: initialData || {
      label: "",
      imageUrl: "",
    },
  });

  const onImageUpload = async (file: File) => {
    startTransition(async () => {
      const upload = await handleImageUpload(file);

      if (upload?.success === true) {
        form.setValue("imageUrl", upload.imageUrl as string);
        toast.success("Image uploaded successfully.");
      }

      if (upload?.success === false) {
        toast.error(upload.message as string);
      }
    });
  };

  const onImageRemove = async (url: string) => {
    startTransition(async () => {
      const remove = await handleImageRemove([url]);

      if (remove?.success === true) {
        form.setValue("imageUrl", "");
        toast.success("Image removed.");
      }

      if (remove?.success === false) {
        toast.error(remove.message as string);
      }
    });
  };

  async function onSubmit(values: z.infer<typeof billboardSchema>) {
    startTransition(async () => {
      try {
        let res;
        if (initialData) {
          res = await axios.patch(
            `/api/${params.storeId}/billboards/${params.billboardId}`,
            values
          );
          const billboard = await res.data;
          form.reset({
            label: billboard.label,
            imageUrl: billboard.imageUrl,
          });
        } else {
          res = await axios.post(`/api/${params.storeId}/billboards`, values);
          form.reset();
        }

        router.refresh();
        router.push(`/${params.storeId}/billboards`);
        toast.success(toastMessage);
      } catch (error) {
        // console.log({ error });
        await handleImageRemove([form.getValues("imageUrl")]);
        toast.error("Something went wrong");
      }
    });
  }

  async function onDelete() {
    startTransition(async () => {
      try {
        await axios.delete(
          `/api/${params.storeId}/billboards/${params.billboardId}`
        );
        handleImageRemove([form.getValues("imageUrl")]);
        form.reset();
        toast.success("Billboard deleted");
        router.refresh();
        router.push(`/${params.storeId}/billboards`);
      } catch (error) {
        toast.error(
          "Make sure you removed all categories using this billboard first"
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
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={isPending}
                    onChange={(file) => onImageUpload(file)}
                    onRemove={(url) => onImageRemove(url)}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Billboard label"
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
