import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { List, Input, Button } from "antd";
import { v4 as uuidv4 } from "uuid";

const socket = io("http://localhost:3001");
const userId = uuidv4();

interface Comment {
  id: string;
  message: string;
}

const CommentSection: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    socket.on("receiveMessage", (comment: Comment) => {
      setComments((prevComments) => [...prevComments, comment]);
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
    const comment = { id: userId, message: newComment };
    socket.emit("sendMessage", comment);
    setComments((prevComments) => [...prevComments, comment]);
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