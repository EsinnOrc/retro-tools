import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { List, Input, Skeleton, Button } from "antd";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/firebaseConfig";
import { collection, addDoc, getDoc, doc, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Swal from 'sweetalert2';
import { LikeOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
if (!socketUrl) {
  throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined");
}
const socket = io(socketUrl);

const auth = getAuth();
const actualUserId = auth.currentUser?.uid || (typeof window !== "undefined" ? localStorage.getItem("user_id") || uuidv4() : uuidv4());
const tempUserId = (typeof window !== "undefined" ? localStorage.getItem("temp_user_id") || uuidv4() : uuidv4());

if (typeof window !== "undefined") {
  localStorage.setItem("user_id", actualUserId);
  localStorage.setItem("temp_user_id", tempUserId);
}

interface Comment {
  id: string;
  message: string;
  userId: string;
  step_id: string;
  likes: number;
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
  const [isActive, setIsActive] = useState(true);
  const router = useRouter();
  const { roomId } = router.query;

  const fetchComments = (roomId: string) => {
    const commentsQuery = query(
      collection(db, "comments"),
      where("room_id", "==", roomId)
    );
    onSnapshot(commentsQuery, (snapshot) => {
      const commentsData: { [key: string]: Comment[] } = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as Comment;
        if (!commentsData[data.step_id]) {
          commentsData[data.step_id] = [];
        }
        commentsData[data.step_id].push(data);
      });
      setComments(commentsData);
    });
  };

  useEffect(() => {
    const fetchRoomData = async () => {
      if (roomId) {
        try {
          const roomRef = doc(db, "rooms", roomId as string);
          const roomDoc = await getDoc(roomRef);

          if (roomDoc.exists()) {
            const roomData = roomDoc.data();
            const templateId = roomData.template_id;
            setIsActive(roomData.is_active);

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
      setComments((prevComments) => {
        const currentComments = prevComments[comment.step_id] || [];
        const isAlreadyAdded = currentComments.some((c) => c.id === comment.id);
        if (isAlreadyAdded) return prevComments;
        return {
          ...prevComments,
          [comment.step_id]: [...currentComments, comment],
        };
      });
    });

    socket.on("finalizeComments", () => {
      setIsFinalized(true);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("finalizeComments");
    };
  }, []);

  const sendComment = async (stepId: string) => {
    const comment = {
      id: uuidv4(),
      message: newComments[stepId],
      userId: tempUserId,
      step_id: stepId,
      likes: 0,
    };

    try {
      await addDoc(collection(db, "comments"), {
        ...comment,
        room_id: roomId,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }

    socket.emit("sendMessage", comment);

    setNewComments((prevComments) => ({ ...prevComments, [stepId]: "" }));
  };

  const finalizeComments = () => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu işlemi geri alamazsınız!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sonuçlandır!',
      cancelButtonText: 'Hayır, iptal et'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const roomRef = doc(db, "rooms", roomId as string);
          await updateDoc(roomRef, {
            is_active: false,
          });
          setIsActive(false);
          setIsFinalized(true);
          Swal.fire(
            'Sonuçlandırıldı!',
            'Yorumlar başarıyla sonuçlandırıldı.',
            'success'
          );
        } catch (error) {
          console.error("Error updating document: ", error);
        }
      }
    });
  };

  const updateCommentLikes = async (commentId: string, stepId: string, change: number) => {
    const commentRef = doc(db, "comments", commentId);
    try {
      const commentDoc = await getDoc(commentRef);
      if (commentDoc.exists()) {
        const commentData = commentDoc.data();
        await updateDoc(commentRef, {
          likes: (commentData.likes || 0) + change,
        });
        setComments((prevComments) => {
          const updatedComments = prevComments[stepId].map((comment) => {
            if (comment.id === commentId) {
              return { ...comment, likes: (comment.likes || 0) + change };
            }
            return comment;
          });
          return { ...prevComments, [stepId]: updatedComments };
        });
      }
    } catch (error) {
      console.error("Error updating comment likes: ", error);
    }
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
                  {comment.userId !== tempUserId ? (
                    isActive ? (
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
                      <div style={{ fontWeight: "normal", color: "black" }}>
                        {comment.message}
                      </div>
                    )
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
                  {!isActive && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Button
                        icon={<LikeOutlined />}
                        onClick={() => updateCommentLikes(comment.id, comment.step_id, 1)}
                        style={{ marginRight: 8 }}
                      >
                        {comment.likes}
                      </Button>
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => updateCommentLikes(comment.id, comment.step_id, 1)}
                        style={{ marginRight: 8 }}
                      />
                      <Button
                        icon={<MinusOutlined />}
                        onClick={() => updateCommentLikes(comment.id, comment.step_id, -1)}
                      />
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
              disabled={!isActive}
              style={{ display: isActive ? "block" : "none" }}
            />
            {isActive && (
              <Button
                type="primary"
                onClick={() => sendComment(step.id)}
              >
                Gönder
              </Button>
            )}
          </div>
        ))
      ) : (
        <p>Loading steps...</p>
      )}
      {templateOwnerId === actualUserId && isActive && (
        <Button
          type="default"
          onClick={finalizeComments}
        >
          Sonuçlandır
        </Button>
      )}
    </div>
  );
};

export default Room;
