import React from "react";
import { Layout } from "antd";
import Headers from "../components/organisms/header/header";
import HomepageContent from "@/components/organisms/homePageContent/content";
import Footers from "@/components/organisms/footer/footer";
const { Content } = Layout;

const Home: React.FC = () => {
  return (
    <Layout className="layout">
      <Headers></Headers>
      <Content></Content>
      <HomepageContent></HomepageContent>
      <Footers></Footers>
    </Layout>
  );
};

export default Home;
