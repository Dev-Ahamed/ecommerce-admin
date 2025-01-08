import { supabase } from "@/lib/supabase-client";

export const handleImageUpload = async (file: File) => {
  try {
    const fileName = `${Date.now()}-${file.name}`; // Generate unique file name
    const { data, error } = await supabase.storage
      .from("ecommerce")
      .upload(fileName, file);

    if (error) {
      //   console.log("SUPABASE_ERROR: " + error);
      return { success: false, message: "Something went wrong" };
    }

    const { data: publicUrl } = supabase.storage
      .from("ecommerce")
      .getPublicUrl(fileName);

    if (publicUrl) {
      return { success: true, imageUrl: publicUrl.publicUrl };
    }
  } catch (error) {
    console.error("Upload failed:", error);
    return { success: false, message: "Failed to upload the image." };
  }
};

export const handleImageRemove = async (urls: string[]) => {
  try {
    const fileNames = urls
      .map((url) => {
        try {
          const urlPath = new URL(url).pathname;
          return decodeURIComponent(urlPath.split("/").pop() as string);
        } catch (error) {
          console.error("Invalid URL: " + url);
          return null;
        }
      })
      .filter((fileName) => Boolean(fileName)) as string[];

    if (fileNames.length === 0) {
      console.error("No valid file names found for deletion.");
      return { success: false, message: "No valid images to remove." };
    }

    // Remove the file from Supabase storage
    const { error } = await supabase.storage
      .from("ecommerce")
      .remove(fileNames);

    if (error) {
      throw error;
    }

    return { success: true, message: "Image removed." };
  } catch (error) {
    console.error("Failed to remove file:", error);
    return { success: false, message: "Failed to remove the image." };
  }
};
