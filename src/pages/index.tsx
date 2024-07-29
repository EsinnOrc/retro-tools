import React from "react";
import { Layout, Menu } from "antd";
import CommentSection from "../components/CommentSection";
import GoogleLogin from "@/components/googleLogin";

const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1">Home</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: "0 50px" }}>
        <div className="site-layout-content">
          <CommentSection />
        </div>
      </Content>
      <GoogleLogin />{" "}
      <Footer style={{ textAlign: "center" }}>©2023 Created by You</Footer>
    </Layout>
  );
};

export default Home;
