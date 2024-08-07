import React from 'react';
import { List, Button, Skeleton } from "antd";
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { Comment } from "./utils";

interface CommentListProps {
  comments: Comment[];
  isActive: boolean;
  userVotes: { [key: string]: number };
  updateCommentLikes: (commentId: string, stepId: string, newVote: number) => void;
  tempUserId: string;
}

const CommentList: React.FC<CommentListProps> = ({ comments, isActive, userVotes, updateCommentLikes, tempUserId }) => (
  <List
    dataSource={comments}
    renderItem={(comment) => (
      <List.Item>
        {comment.userId !== tempUserId ? (
          isActive ? (
            <Skeleton active paragraph={{ rows: Math.ceil(comment.message.length / 20), width: "80%" }}>
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
              disabled={userVotes[comment.id] === 1}
            >
              {comment.likes}
            </Button>
            <Button
              icon={<DislikeOutlined />}
              onClick={() => updateCommentLikes(comment.id, comment.step_id, -1)}
              disabled={userVotes[comment.id] === -1}
            >
              {comment.dislikes}
            </Button>
          </div>
        )}
      </List.Item>
    )}
  />
);

export default CommentList;
