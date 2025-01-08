import db from "@/lib/db";
import { CategoryForm } from "./components/category-form";

const CategoryPage = async ({
  params,
}: {
  params: { categoryId: string; storeId: string };
}) => {
  let category = null;
  if (params.categoryId !== "new") {
    category = await db.category.findUnique({
      where: { id: params.categoryId },
    });
  }

  const billboards = await db.billboard.findMany({
    where: { storeId: params.storeId },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm initialData={category} billboards={billboards} />
      </div>
    </div>
  );
};

export default CategoryPage;
