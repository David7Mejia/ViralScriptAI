import React from "react";
import DashboardContainer from "../components/DashboardComponent";
import Link from "next/link";
import Head from "next/head";
import { auth0 } from "../lib/auth0";
const Home = async () => {
  const session = await auth0.getSession();

  if (session && session.user) {
    try {
      // Sync the user with MongoDB

      // Redirect to the chat page after syncing
      redirect("/dashboard");
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  }

  console.log("this is user", session?.user);
  return (
    <main className="flex-1 h-screen overflow-y-auto">
      {!session?.user ? (
        <Link href="/auth/login">
          <button className="cursor-pointer rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600">Log in</button>
        </Link>
      ) : (
        <Link href="/auth/logout" className="cursor-pointer rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600">
          Logout
        </Link>
      )}
    </main>
  );
};

export default Home;
