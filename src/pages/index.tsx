import React, { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import GoogleLogin from "@/components/googleLogin";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import Link from "next/link";

const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); 
  }, []); 

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  };

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1">Home</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          {user ? (
            <div>
              <p>Welcome, {user.displayName}</p>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <GoogleLogin />
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>©2023 Created by You</Footer>
    </Layout>
  );
};

export default Home;
