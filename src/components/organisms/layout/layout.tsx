import React, { ReactNode } from "react";
import { Layout as AntLayout, Flex } from "antd";
import { User } from "firebase/auth";
import Sidebar from "@/components/organisms/sidebar/sidebar";
import Header from "@/components/molecules/dashboardHeader/dbHeader";
import styles from "./index.module.scss";

const { Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
  user: User | null;
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  collapsed,
  toggleSidebar,
}) => {
  return (
    <Flex gap="middle" wrap>
      <AntLayout className={styles.layoutStyle}>
        <AntLayout>
          <Sidebar collapsed={collapsed} />
          <AntLayout>
            <Header collapsed={collapsed} toggle={toggleSidebar} user={user} />
            <Content className={styles.content}>{children}</Content>
          </AntLayout>
        </AntLayout>
      </AntLayout>
    </Flex>
  );
};

export default Layout;
