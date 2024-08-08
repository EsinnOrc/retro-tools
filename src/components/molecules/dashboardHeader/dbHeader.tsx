import React from "react";
import Buttons from "@/components/atoms/buttons/button";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";
import { User } from "firebase/auth";

interface HeaderProps {
  collapsed: boolean;
  toggle: () => void;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ collapsed, toggle, user }) => {
  return (
    <div className={styles.header}>
      <Buttons
        htmlType="button"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggle}
        className={styles.button}
      />
      <p>Welcome, {user?.displayName}</p>
    </div>
  );
};

export default Header;
