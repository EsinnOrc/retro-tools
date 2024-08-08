import React from "react";
import { Layout } from "antd";
import SidebarMenu from "@/components/molecules/sidebarMenu/sidebarmenu";

const { Sider } = Layout;

const Sidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div className="demo-logo-vertical" />
      <SidebarMenu collapsed={collapsed} />
    </Sider>
  );
};

export default Sidebar;
