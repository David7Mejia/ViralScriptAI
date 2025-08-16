import React from "react";
import DashboardContainer from "../components/Dashboard";

const Home = async () => {
  return (
    <main className="flex-1 h-screen overflow-y-auto">
      <DashboardContainer />
    </main>
  );
};

export default Home;
