"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { CircleUserRound } from "lucide-react";

interface UserMenuProps {
  session?: { user?: any } | null;
}

const UserMenu = ({ session }: UserMenuProps) => {
  const [toggleDropdown, setToggleDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToggleDropdown(false);
      }
    };

    if (toggleDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toggleDropdown]);

  return (
    <div>
      <div className="flex justify-center items-center gap-3">
        {session && session.user ? (
          <div className="relative">
            <CircleUserRound className="cursor-pointer" color={"white"} strokeWidth={1.25} absoluteStrokeWidth onClick={() => setToggleDropdown(prev => !prev)} />
            {toggleDropdown && (
              <div className="dropdown" ref={dropdownRef}>
                <Link href="/my-rooms" className="dropdown_link" onClick={() => setToggleDropdown(false)}>
                  My Rooms
                </Link>
                <Link href="/generate" className="dropdown_link" onClick={() => setToggleDropdown(false)}>
                  Create Rooms
                </Link>
                <Link type="button" href="/auth/logout" className="dropdown_link black_btn" onClick={() => setToggleDropdown(false)}>
                  Logout
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth/login" type="button" className="text-white black_btn">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
