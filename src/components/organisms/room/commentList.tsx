import React from 'react';
import { List, Button, Skeleton } from "antd";
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { Comment } from "./utils";
import { Draggable } from "react-beautiful-dnd";

interface CommentListProps {
  comments: Comment[];
  isActive: boolean;
  userVotes: { [key: string]: number };
  updateCommentLikes: (commentId: string, stepId: string, newVote: number, isGroup: boolean) => void;
  tempUserId: string;
  isGroup?: boolean;
  groupId?: string;
  groupLikes?: number;
  groupDislikes?: number;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  isActive,
  userVotes,
  updateCommentLikes,
  tempUserId,
  isGroup,
  groupId,
  groupLikes,
  groupDislikes
}) => (
  <List
    dataSource={comments}
    renderItem={(comment, index) => (
      <Draggable draggableId={comment.id} index={index} key={comment.id}>
        {(provided) => (
          <List.Item ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            {comment.userId !== tempUserId ? (
              isActive ? (
                <Skeleton active title={false} paragraph={{ rows: 1 }} />
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
              isGroup ? (
                index === 0 && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Button
                      icon={<LikeOutlined />}
                      onClick={() => updateCommentLikes(groupId!, comment.step_id, 1, true)}
                      style={{ marginRight: 8 }}
                      disabled={userVotes[groupId!] === 1}
                    >
                      {groupLikes}
                    </Button>
                    <Button
                      icon={<DislikeOutlined />}
                      onClick={() => updateCommentLikes(groupId!, comment.step_id, -1, true)}
                      disabled={userVotes[groupId!] === -1}
                    >
                      {groupDislikes}
                    </Button>
                  </div>
                )
              ) : (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    icon={<LikeOutlined />}
                    onClick={() => updateCommentLikes(comment.id, comment.step_id, 1, false)}
                    style={{ marginRight: 8 }}
                    disabled={userVotes[comment.id] === 1}
                  >
                    {comment.likes}
                  </Button>
                  <Button
                    icon={<DislikeOutlined />}
                    onClick={() => updateCommentLikes(comment.id, comment.step_id, -1, false)}
                    disabled={userVotes[comment.id] === -1}
                  >
                    {comment.dislikes}
                  </Button>
                </div>
              )
            )}
          </List.Item>
        )}
      </Draggable>
    )}
  />
);

export default CommentList;