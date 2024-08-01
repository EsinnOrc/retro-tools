import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { List, Input, Button, Skeleton } from "antd";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/firebaseConfig";
import { collection, addDoc, getDoc, doc, query, where, onSnapshot } from "firebase/firestore";

const socket = io("http://localhost:3001");
const userId = uuidv4();

interface Comment {
  id: string;
  message: string;
  userId: string;
}

interface Step {
  id: string;
  name: string;
}

const Room: React.FC = () => {
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [templateOwnerId, setTemplateOwnerId] = useState<string | null>(null);
  const router = useRouter();
  const { roomId } = router.query;

  useEffect(() => {
    const fetchRoomData = async () => {
      if (roomId) {
        try {
          const roomRef = doc(db, "rooms", roomId as string);
          const roomDoc = await getDoc(roomRef);

          if (roomDoc.exists()) {
            const roomData = roomDoc.data();
            const templateId = roomData.template_id;

            const templateRef = doc(db, "templates", templateId);
            const templateDoc = await getDoc(templateRef);

            if (templateDoc.exists()) {
              const templateData = templateDoc.data();
              setTemplateOwnerId(templateData.user_id);

              const stepsList = templateData.step_names.map((step: any) => ({
                id: step.id,
                name: step.name,
              }));
              setSteps(stepsList);

              fetchComments(roomId as string);
            } else {
              console.error("No such template!");
            }
          } else {
            console.error("No such room!");
          }
        } catch (error) {
          console.error("Error fetching room data:", error);
        }
      }
    };

    fetchRoomData();
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

  const fetchComments = (roomId: string) => {
    const commentsQuery = query(collection(db, "comments"), where("room_id", "==", roomId));
    onSnapshot(commentsQuery, (snapshot) => {
      const commentsData: { [key: string]: Comment[] } = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as Comment;
        if (!commentsData[data.id]) {
          commentsData[data.id] = [];
        }
        commentsData[data.id].push(data);
      });
      setComments(commentsData);
    });
  };

  const sendComment = async (stepId: string) => {
    const comment = { id: stepId, message: newComments[stepId], userId };

    try {
      await addDoc(collection(db, "comments"), {
        comment: comment.message,
        group_id: null,
        likes: 0,
        room_id: roomId,
        step_id: stepId,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }

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
            <h4>{step.name}</h4>
            <List
              dataSource={comments[step.id] || []}
              renderItem={(comment) => (
                <List.Item>
                  {comment.userId !== userId ? (
                    <Skeleton active paragraph={{ rows: 1, width: "80%" }}>
                      <div
                        style={{
                          filter: "blur(4px)",
                          fontWeight: "normal",
                          color: "black",
                        }}
                      >
                        {comment.message}
                      </div>
                    </Skeleton>
                  ) : (
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "blue",
                      }}
                    >
                      {comment.message}
                    </div>
                  )}
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
              disabled={isFinalized}
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
      {templateOwnerId === userId && (
        <Button type="default" onClick={finalizeComments} disabled={isFinalized}>
          Sonuçlandır
        </Button>
      )}
    </div>
  );
};

export default Room;
