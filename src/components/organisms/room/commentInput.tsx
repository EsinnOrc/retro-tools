import React, { useState } from "react";
import { Form, Row, Col } from "antd";
import * as yup from "yup";
import Inputs from "@/components/atoms/inputs/inputs";
import Buttons from "@/components/atoms/buttons/button";
import styles from "./index.module.scss";

interface CommentInputProps {
  stepId: string;
  newComment: string;
  setNewComments: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  isActive: boolean;
  sendComment: (stepId: string) => void;
}

const commentSchema = yup.object().shape({
  comment: yup.string().required("Yorum boş olamaz"),
});

const CommentInput: React.FC<CommentInputProps> = ({
  stepId,
  newComment,
  setNewComments,
  isActive,
  sendComment,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleSendComment = async () => {
    try {
      await commentSchema.validate({ comment: newComment });
      sendComment(stepId);
      setError(null);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setError(error.message);
      }
    }
  };
  return (
    <Form.Item
      validateStatus={error ? "error" : ""}
      help={error}
      className={styles.commentInputContainer}
    >
      {isActive && (
        <Row gutter={8} align="middle">
          <Col span={18}>
            <Inputs
              name="comment"
              type="text"
              value={newComment}
              onChange={(e) =>
                setNewComments((prevComments) => ({
                  ...prevComments,
                  [stepId]: e.target.value,
                }))
              }
            />
          </Col>
          <Col span={6}>
            {" "}
            <Buttons
              text="Gönder"
              onClick={handleSendComment}
              className={styles.button}
            />
          </Col>
        </Row>
      )}
    </Form.Item>
  );
};

export default CommentInput;
