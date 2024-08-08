import React, { FC } from "react";
import { Menu } from "antd";
import Button from "../../atoms/buttons/button";
import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";
import { googleLogin } from "@/pages/api/firebaseLogin";
import { useRouter } from "next/router";
interface NavbarProps {
  defaultSelectedKeys: string[];
  items: { key: string; label: string }[];
}

const Navbar: FC<NavbarProps> = ({ defaultSelectedKeys, items }) => {
  const router = useRouter();

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      await googleLogin();
      router.push("/");
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };
  return (
    <div className={styles.navbarContainer}>
      <div className={styles.logoContainer}>
        <span className={styles.logo}>Retro</span>
        <span className={styles.logo}>spect</span>
      </div>
      <Menu
        className={styles.menu}
        theme="light"
        mode="horizontal"
        defaultSelectedKeys={defaultSelectedKeys}
        items={items}
        style={{ flex: 1, minWidth: 0 }}
      />

      <div className={styles.rightSection}>
        <div className={styles.contactInfo}>
          <MailOutlined />
          <PhoneOutlined />
        </div>
        <Button
          htmlType="button"
          icon={<UserOutlined />}
          onClick={handleGoogleLogin}
          className={styles.loginButton}
          text="Login"
        ></Button>
      </div>
    </div>
  );
};

export default Navbar;
