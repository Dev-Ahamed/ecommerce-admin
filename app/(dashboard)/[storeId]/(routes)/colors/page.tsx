import { ColorClient } from "./components/client";

export default async function ColorsPage({
  params,
}: {
  params: { storeId: string };
}) {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorClient />
      </div>
    </div>
  );
}
