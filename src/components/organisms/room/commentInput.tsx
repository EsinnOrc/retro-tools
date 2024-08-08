import React, { useState } from 'react';
import { Input, Button, Form } from "antd";
import * as yup from 'yup';

interface CommentInputProps {
  stepId: string;
  newComment: string;
  setNewComments: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  isActive: boolean;
  sendComment: (stepId: string) => void;
}

const commentSchema = yup.object().shape({
  comment: yup.string().required('Yorum boş olamaz'),
});

const CommentInput: React.FC<CommentInputProps> = ({ stepId, newComment, setNewComments, isActive, sendComment }) => {
  const [error, setError] = useState<string | null>(null);

  const handleSendComment = async () => {
    try {
      await commentSchema.validate({ comment: newComment });
      sendComment(stepId);
      setError(null); // Clear error after successful validation
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setError(error.message);
      }
    }
  };

  return (
    <Form.Item
      validateStatus={error ? 'error' : ''}
      help={error}
    >
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
        style={{ display: isActive ? 'block' : 'none' }}
      />
      {isActive && (
        <Button type="primary" onClick={handleSendComment}>
          Gönder
        </Button>
      )}
    </Form.Item>
  );
};

export default CommentInput;
