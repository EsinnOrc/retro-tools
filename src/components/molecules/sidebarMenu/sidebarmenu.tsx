import React from "react";
import { Menu } from "antd";
import {
  HomeOutlined,
  FileOutlined,
  PlusOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";

interface SidebarMenuProps {
  collapsed: boolean;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed }) => {
  const router = useRouter();
  const { asPath } = router;

  const handleMenuClick = (e: any) => {
    if (e.key === "/logout") {
      signOut(auth)
        .then(() => {
          router.push("/");
        })
        .catch((error) => {
          console.error("Error signing out:", error);
        });
    } else {
      router.push(e.key);
    }
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[asPath]}
      onClick={handleMenuClick}
    >
      <Menu.Item key="/" icon={<HomeOutlined />}>
        Home
      </Menu.Item>
      <Menu.Item key="/dashboard" icon={<FileOutlined />}>
        Template Lists
      </Menu.Item>
      <Menu.Item key="/create-template" icon={<PlusOutlined />}>
        Create Template
      </Menu.Item>
      <Menu.Item key="room-lists" icon={<VideoCameraOutlined />}>
        Room Lists
      </Menu.Item>
      <Menu.Item key="/statistics" icon={<VideoCameraOutlined />}>
        Statistics
      </Menu.Item>
      <Menu.Item key="/logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );
};

export default SidebarMenu;
