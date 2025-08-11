import React from "react";
import Logo from "../Logo";
import UserMenu from "../UserMenu";
import { auth0 } from "../../lib/auth0";

const Navbar = async () => {
  const session = await auth0.getSession();
  return (
    <div className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div id="navbar-border-container" className="py-4 ">
        <div className="max-w-[2000px] px-5 mx-auto ">
          <div className="flex items-center justify-between">
            <Logo />
            <UserMenu session={session} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
