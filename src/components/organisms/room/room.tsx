import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { List, Input, Button, message } from "antd";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  getFirestore,
  collection,
  getDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const socket = io("http://localhost:3001");
const userId = uuidv4();

interface Comment {
  id: string;
  message: string;
}

interface Step {
  id: string;
  step_name: string;
}

const Room: React.FC = () => {
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const router = useRouter();
  const { roomId } = router.query;

  useEffect(() => {
    const fetchSteps = async () => {
      if (roomId) {
        try {
          console.log("Fetching template ID for roomId:", roomId);
          const db = getFirestore();
          const roomRef = doc(db, "rooms", roomId as string);
          const roomDoc = await getDoc(roomRef);

          if (roomDoc.exists()) {
            const templateId = roomDoc.data().template_id;
            console.log("Template ID:", templateId);

            const stepsQuery = query(
              collection(db, "template_steps"),
              where("template_id", "==", templateId)
            );
            const stepsSnapshot = await getDocs(stepsQuery);
            const stepsList = stepsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log("Fetched steps:", stepsList);
            setSteps(stepsList);
          } else {
            console.error("No such room!");
          }
        } catch (error) {
          console.error("Error fetching steps:", error);
        }
      }
    };

    fetchSteps();
  }, [roomId]);

  useEffect(() => {
    socket.on("receiveMessage", (comment: Comment) => {
      setComments((prevComments) => ({
        ...prevComments,
        [comment.id]: [...(prevComments[comment.id] || []), comment],
      }));
    });

    socket.on("finalizeComments", () => {
      setIsFinalized(true);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("finalizeComments");
    };
  }, []);

  const sendComment = (stepId: string) => {
    const comment = { id: stepId, message: newComments[stepId] };
    socket.emit("sendMessage", comment);
    setComments((prevComments) => ({
      ...prevComments,
      [stepId]: [...(prevComments[stepId] || []), comment],
    }));
    setNewComments((prevComments) => ({ ...prevComments, [stepId]: "" }));
  };

  const finalizeComments = () => {
    socket.emit("finalize");
  };

  return (
    <div>
      {steps.length > 0 ? (
        steps.map((step) => (
          <div key={step.id} style={{ marginBottom: "20px" }}>
            <h4>{step.step_name}</h4>
            <List
              dataSource={comments[step.id] || []}
              renderItem={(comment) => (
                <List.Item>
                  <div
                    style={{
                      filter: comment.id === userId ? "none" : "blur(4px)",
                      fontWeight: comment.id === userId ? "bold" : "normal",
                      color: comment.id === userId ? "blue" : "black",
                    }}
                  >
                    {comment.message}
                  </div>
                </List.Item>
              )}
            />
            <Input
              value={newComments[step.id] || ""}
              onChange={(e) =>
                setNewComments((prevComments) => ({
                  ...prevComments,
                  [step.id]: e.target.value,
                }))
              }
              placeholder="yorum yap"
            />
            <Button
              type="primary"
              onClick={() => sendComment(step.id)}
              disabled={isFinalized}
            >
              Gönder
            </Button>
          </div>
        ))
      ) : (
        <p>Loading steps...</p>
      )}
      <Button type="default" onClick={finalizeComments} disabled={isFinalized}>
        Sonuçlandır
      </Button>
    </div>
  );
};

export default Room;
