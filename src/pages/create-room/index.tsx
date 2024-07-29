import React, { useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { Layout, Input, Button } from "antd";
import { getAuth } from "firebase/auth";

const { Content, Footer } = Layout;

const CreateRoom: React.FC = () => {
  const [roomName, setRoomName] = useState("");
  const [step, setStep] = useState("");
  const router = useRouter();
  const auth = getAuth();

  const handleCreateRoom = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.error("No user is signed in.");
      return;
    }

    try {
      await addDoc(collection(db, "rooms"), {
        name: roomName,
        step: parseInt(step, 10),
        uid: user.uid,
      });
      console.log("Room created successfully");
      router.push("/");
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  return (
    <Layout className="layout">
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <h2>Create a New Room</h2>
          <Input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room Name"
          />
          <Input
            type="number"
            value={step}
            onChange={(e) => setStep(e.target.value)}
            placeholder="Step"
          />
          <Button type="primary" onClick={handleCreateRoom}>
            Create Room
          </Button>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>©2023 Created by You</Footer>
    </Layout>
  );
};

export default CreateRoom;
