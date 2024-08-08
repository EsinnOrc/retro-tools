import React, { FC } from "react";
import { Row, Col } from "antd";
import Navbar from "../../molecules/navbar/navbar";
import Buttons from "../../atoms/buttons/button";
import styles from "./index.module.scss";
import { googleLogin } from "@/pages/api/firebaseLogin";
import { useRouter } from "next/router";

const Header: FC = () => {
  const router = useRouter();

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      await googleLogin();
      router.push("/dashboard");
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  return (
    <>
      <Navbar
        defaultSelectedKeys={["1"]}
        items={[
          { key: "home", label: "Home" },
          { key: "campaign", label: "Campaign" },
          { key: "about", label: "About" },
          { key: "blog", label: "Blog" },
          { key: "pages", label: "Pages" },
          { key: "contact", label: "Contact Us" },
        ]}
      />
      <header className={styles.header}>
        <div className={styles.heroSection}>
          <Row gutter={[16, 16]} align="middle" justify="center">
            <Col xs={24} md={10}>
              <div className={styles.textContainer}>
                <h1>Fun, Easy & awesome Retro Spectives!</h1>
                <p>
                  ISO-27001 certified retrospective tool for agile teams,
                  collaborate with your team and get better in what you do with
                  a simple, powerful and beautiful tool.
                </p>
                <Buttons
                  text="Login with Google"
                  onClick={handleGoogleLogin}
                  htmlType="button"
                  className={styles.googleLoginButton}
                ></Buttons>
              </div>
            </Col>
            <Col xs={24} md={14}>
              <div className={styles.imageContainer}>
                <img
                  src="/header2.jpeg"
                  alt="Hero"
                  className={styles.heroImage}
                />
              </div>
            </Col>
          </Row>
        </div>
      </header>
    </>
  );
};

export default Header;
