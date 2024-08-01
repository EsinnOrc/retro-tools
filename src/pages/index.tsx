import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Layout, Menu, Card, message } from "antd";
import GoogleLogin from "@/components/googleLogin";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { getFirestore, collection, getDocs, query, where, addDoc } from "firebase/firestore";

const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchTemplates = async () => {
        try {
          const templatesQuery = query(
            collection(db, "templates"),
            where("user_id", "==", user.uid)
          );
          const templatesSnapshot = await getDocs(templatesQuery);
          const templatesList = templatesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTemplates(templatesList);
        } catch (error) {
          console.error("Error fetching templates:", error);
        }
      };

      fetchTemplates();
    }
  }, [user]);

  const handleCreateRoom = async (templateId: string) => {
    try {
      const roomRef = await addDoc(collection(db, "rooms"), {
        template_id: templateId,
        is_active: true,
        created_at: new Date(),
      });
      message.success("Room created successfully");
      router.push(`/room/${roomRef.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
      message.error("Failed to create room");
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
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
      <Content style={{ padding: "0 50px" }}>
        <div className="site-layout-content">
          {user ? (
            <div>
              <p>Welcome, {user.displayName}</p>
              <Button
                onClick={() => (window.location.href = "/create-template")}
              >
                Create Template
              </Button>
              <Button onClick={handleLogout}>Logout</Button>
              <div className="templates-list">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    title={template.name}
                    style={{ margin: "10px" }}
                  >
                    <Button onClick={() => handleCreateRoom(template.id)}>
                      Create Room
                    </Button>
                    <div>
                      <h4>Steps:</h4>
                      <ul>
                        {template.step_names?.map((step, index) => (
                          <li key={index}>{step.name}</li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <GoogleLogin />
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        © 2024 Created by Esin and Semih
      </Footer>
    </Layout>
  );
};

export default Home;
