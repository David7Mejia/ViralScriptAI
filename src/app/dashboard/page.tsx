import React from "react";
import Sidebar from "@/components/Sidebar";
import DashboardComponent from "../../components/Dashboard";
import { auth0 } from "../../lib/auth0";
import { redirect } from "next/navigation";
type Props = {};

const DashboardContainer = async (props: Props) => {
  const session = await auth0.getSession();

  if (!session || !session.user) {
    redirect("/");
  }
  return (
    <div id="main-container" className="flex min-h-screen bg-[#F5F7FA]">
      {/* Fixed Sidebar */}
      <aside className="w-[260px] h-screen fixed left-0 top-0 z-10 bg-white border-r border-gray-200 flex flex-col  py-8">
        <Sidebar />
      </aside>
      {/* Main Content (with left margin to accommodate sidebar) */}
      <main className="flex-1 ml-[260px] h-screen overflow-y-auto">
        <DashboardComponent />
      </main>
    </div>
  );
};

export default DashboardContainer;
