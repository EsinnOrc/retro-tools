import React from 'react';
import { Input, Button } from "antd";

interface CommentInputProps {
  stepId: string;
  newComment: string;
  setNewComments: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  isActive: boolean;
  sendComment: (stepId: string) => void;
}

const CommentInput: React.FC<CommentInputProps> = ({ stepId, newComment, setNewComments, isActive, sendComment }) => (
  <>
    <Input
      value={newComment}
      onChange={(e) =>
        setNewComments((prevComments) => ({
          ...prevComments,
          [stepId]: e.target.value,
        }))
      }
      placeholder="yorum yap"
      disabled={!isActive}
      style={{ display: isActive ? "block" : "none" }}
    />
    {isActive && (
      <Button
        type="primary"
        onClick={() => sendComment(stepId)}
      >
        Gönder
      </Button>
    )}
  </>
);

export default CommentInput;
