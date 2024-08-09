import Room from "@/components/organisms/room/room";
import { Layout } from "antd";
import React from "react";
import RoomNavbar from "@/components/organisms/room/roomNavbar/roomNavbar";

const { Header, Content, Footer } = Layout;

function Index() {
  return (
    <Layout className="layout">
      <RoomNavbar />

      <Layout>
        <Content className="content">
          <Room />
        </Content>
      </Layout>
      <Footer className="footer">footer</Footer>
    </Layout>
  );
}

export default Index;
