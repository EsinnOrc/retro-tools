// components/CommentSection.tsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { List, Input, Button } from "antd";

const socket = io("http://localhost:3001");

const CommentSection: React.FC = () => {
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    socket.on("receiveMessage", (message: string) => {
      setComments((prevComments) => [...prevComments, message]);
    });

    socket.on("finalizeComments", () => {
      setIsFinalized(true);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("finalizeComments");
    };
  }, []);

  const sendComment = () => {
    socket.emit("sendMessage", newComment);
    setNewComment("");
  };

  const finalizeComments = () => {
    socket.emit("finalize");
  };

  return (
    <div>
      <List
        dataSource={comments}
        renderItem={(comment) => (
          <List.Item>
            <div style={{ filter: isFinalized ? "none" : "blur(4px)" }}>
              {comment}
            </div>
          </List.Item>
        )}
      />
      <Input
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="yorum yap"
      />
      <Button type="primary" onClick={sendComment}>
        Gönder
      </Button>
      <Button type="default" onClick={finalizeComments}>
        Sonuçlandır
      </Button>
    </div>
  );
};

export default CommentSection;
