import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Layout, Menu, Card, message } from "antd";
import GoogleLogin from "@/components/googleLogin";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { getFirestore, collection, getDocs, query, where, addDoc } from "firebase/firestore";

const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateSteps, setTemplateSteps] = useState<{ [key: string]: any[] }>({});
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
          const db = getFirestore();
          const templatesSnapshot = await getDocs(collection(db, "templates"));
          const templatesList = templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTemplates(templatesList);

          const templateStepsData: { [key: string]: any[] } = {};
          for (const template of templatesList) {
            const stepsQuery = query(collection(db, "template_steps"), where("template_id", "==", template.id));
            const stepsSnapshot = await getDocs(stepsQuery);
            templateStepsData[template.id] = stepsSnapshot.docs.map(doc => doc.data());
          }
          setTemplateSteps(templateStepsData);

        } catch (error) {
          console.error("Error fetching templates or steps:", error);
        }
      };

      fetchTemplates();
    }
  }, [user]);

  const handleCreateRoom = async (templateId: string) => {
    try {
      const db = getFirestore();
      const roomRef = await addDoc(collection(db, "rooms"), {
        template_id: templateId,
        is_active: true,
        created_at: new Date(),
      });
      message.success("Room created successfully");
      router.push(`/rooms/${roomRef.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
      message.error("Failed to create room");
    }
  };

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
              <Button onClick={() => window.location.href = "/create-template"}>Create Template</Button>
              <Button onClick={handleLogout}>Logout</Button>
              <div className="templates-list">
                {templates.map(template => (
                  <Card key={template.id} title={template.name} style={{ margin: '10px' }}>
                    <Button onClick={() => handleCreateRoom(template.id)}>Create Room</Button>
                    <div>
                      <h4>Steps:</h4>
                      <ul>
                        {templateSteps[template.id]?.map((step, index) => (
                          <li key={index}>{step.step_name}</li>
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
      <Footer style={{ textAlign: "center" }}>©2024 Created by Esin and Semih</Footer>
    </Layout>
  );
};

export default Home;
