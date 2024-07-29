import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/router";

const CreateRoom: React.FC = () => {
  const [roomName, setRoomName] = useState("");
  const [step, setStep] = useState("");
  const router = useRouter();

  const handleCreateRoom = async () => {
    try {
      await addDoc(collection(db, "rooms"), {
        name: roomName,
        step: parseInt(step),
      });
      console.log("Room created successfully");
      router.push("/"); 
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  return (
    <div>
      <h2>Create a New Room</h2>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Room Name"
      />
      <input
        type="number"
        value={step}
        onChange={(e) => setStep(e.target.value)}
        placeholder="Step"
      />
      <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  );
};

export default CreateRoom;
