import React from "react";
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
    <div>
      <DashboardComponent />
    </div>
  );
};

export default DashboardContainer;
