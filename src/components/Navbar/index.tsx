import React from "react";
import Logo from "../Logo";

const Navbar = async () => {
  return (
    <div className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div id="navbar-border-container" className="py-4 ">
        <div className="max-w-[2000px] px-20 mx-auto ">
          <div className="flex items-center justify-between">
            <Logo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
