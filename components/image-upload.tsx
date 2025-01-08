"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { supabase } from "@/lib/supabase-client";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: File) => void;
  onRemove: (value: string) => void;
  value: string[];
}

export const ImageUpload = ({
  disabled,
  onChange,
  onRemove,
  value,
}: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      onChange(file);
    }

    event.target.value = "";
  };

  // const handleUpload = async (file: File) => {
  //   try {
  //     const fileName = `${Date.now()}-${file.name}`; // Generate unique file name
  //     const { data, error } = await supabase.storage
  //       .from("ecommerce")
  //       .upload(fileName, file);

  //     if (error) {
  //       throw error;
  //     }

  //     const { data: publicUrl } = supabase.storage
  //       .from("ecommerce")
  //       .getPublicUrl(fileName);

  //     if (publicUrl) {
  //       onChange(publicUrl.publicUrl);
  //       toast.success("Image uploaded successfully.");
  //     }
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //     toast.error("Failed to upload the image.");
  //   } finally {
  //   }
  // };

  // const handleRemove = async (url: string) => {
  //   try {
  //     // Extract the path portion of the URL
  //     const urlPath = new URL(url).pathname;

  //     // Get the file name from the URL path
  //     const fileName = urlPath.split("/").pop();

  //     if (!fileName) {
  //       console.error("Failed to extract the file name from the URL.");
  //       toast.error("Failed to remove the image.");
  //       return;
  //     }

  //     // Remove the file from Supabase storage
  //     const { error } = await supabase.storage
  //       .from("ecommerce")
  //       .remove([fileName]);

  //     if (error) {
  //       throw error;
  //     }

  //     onRemove(url);
  //     toast.success("Image removed successfully.");
  //   } catch (error) {
  //     console.error("Failed to remove file:", error);
  //   }
  // };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant={"destructive"}
                size={"icon"}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
            <Image fill className="object-cover" src={url} alt="Image" />
          </div>
        ))}
      </div>

      <Button
        type="button"
        disabled={disabled}
        variant={"secondary"}
        onClick={() => imageInputRef.current?.click()}
      >
        <Plus className="w-4 h-4" />
        Upload
      </Button>
      <Input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
