import React from "react";
import Link from "next/link";
import { FaRotate } from "react-icons/fa6";

const Header = () => {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center bg-[#2b2b2b]">
      <Link
        href="/"
        className="flex items-center justify-center"
        prefetch={false}
      >
        <FaRotate color="#8b5cf6" fontSize="2em" />
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link
          href="/about"
          className="text-sm font-medium hover:underline underline-offset-4 text-white"
          prefetch={false}
        >
          How to Play
        </Link>
        <Link
          href="/leaderboard"
          className="text-sm font-medium hover:underline underline-offset-4 text-white"
          prefetch={false}
        >
          Leaderboard
        </Link>
      </nav>
    </header>
  );
};

export default Header;
