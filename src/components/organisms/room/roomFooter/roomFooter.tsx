import React from "react";
import { Layout } from "antd";
import styles from "./index.module.scss";

const { Footer } = Layout;

const RoomFooter: React.FC = () => {
  return (
    <Footer className={styles.footer}>
      ©2024 Your Company Name. All Rights Reserved.
    </Footer>
  );
};

export default RoomFooter;
