import React, { FC } from "react";
import { Menu } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";

const RoomNavbar: FC = () => {
  return (
    <div className={styles.navbarContainer}>
      <div className={styles.logoContainer}>
        <span className={styles.logo}>Retro</span>
        <span className={styles.logo}>spect</span>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.contactInfo}></div>
      </div>
    </div>
  );
};

export default RoomNavbar;
