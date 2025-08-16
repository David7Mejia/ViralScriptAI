"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
const Sidebar = () => {
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch(``, {
        method: "POST",
      });

      const json = await response.json();
      console.log("CHAT LIST", json);
      setChatList(json?.chats || []);
    };

    loadChatList();
  }, []);

  return (
    <div id="sidebar-container" className="relative bg-white min-h-screen flex flex-col py-10 px-5 overflow-hidden border-r border-gray-200">
      <Link
        className="mt-auto hover:bg-emerald-600 mb-4 transition-all flex items-center rounded-lg items-center text-center px-6 py-3 bg-emerald-500 text-white shadow-lg px-4 py-2.5 text-sm font-medium rounded-lg"
        href="/auth/logout"
      >
        Analyze New Video
        <Plus className="ml-auto" size={16} />
      </Link>
      <div className="flex-1 overflow-auto px-2 py-2 rounded-md flex flex-col gap-2">
        {chatList.map((chat, index) => (
          <Link href={`/`} className="transition-all duration-200 hover:bg-gray-500/50  text-left rounded-md py-1 px-4 cursor-pointer" key={index}>
            {/* {chat?.title && chat?.title.length >= 20 ? `${chat.title.slice(0, 20)}...` : `${chat.title}`} */}
          </Link>
        ))}
      </div>
      <Link className="mt-4 hover:bg-slate-200  transition-all justify-items-end bottom-0 rounded-lg items-center text-center px-6 py-3 bg-white text-black" href="/auth/logout">
        Logout
      </Link>
    </div>
  );
};

export default Sidebar;
