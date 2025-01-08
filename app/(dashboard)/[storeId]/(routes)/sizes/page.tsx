import { SizeClient } from "./components/client";
import { getSizes } from "@/data/Sizes";

export default async function SizesPage({
  params,
}: {
  params: { storeId: string };
}) {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeClient />
      </div>
    </div>
  );
}
