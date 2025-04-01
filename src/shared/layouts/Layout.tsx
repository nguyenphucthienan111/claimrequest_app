import React, { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/layoutComponent/Header";
import SideBar from "../components/layoutComponent/SideBar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const isHomePage = location.pathname === "/";
  const mainPadding = isHomePage ? "" : "pt-[50px]";

  return (
    <div className="flex min-h-screen">
      <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <main className={`flex-1 bg-white ${mainPadding}`}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;