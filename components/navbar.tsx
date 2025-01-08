import db from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

import { MainNNav } from "@/components/main-nav";
import { StoreSwitcher } from "@/components/store-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export const Navbar = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const stores = await db.store.findMany({ where: { userId } });
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <StoreSwitcher items={stores} />
        <MainNNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};
