import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { List, Button, Card } from "antd";
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { Comment } from "./utils";

interface CommentGroupProps {
  groupId: string;
  comments: Comment[];
  isActive: boolean;
  userVotes: { [key: string]: number };
  updateCommentLikes: (commentId: string, stepId: string, newVote: number) => void;
  tempUserId: string;
}

const CommentGroup: React.FC<CommentGroupProps> = ({ groupId, comments, isActive, userVotes, updateCommentLikes, tempUserId }) => (
  <Droppable droppableId={groupId}>
    {(provided) => (
      <Card
        title={`Group ${groupId}`}
        ref={provided.innerRef}
        {...provided.droppableProps}
        style={{ marginBottom: "20px" }}
      >
        <List
          dataSource={comments}
          renderItem={(comment, index) => (
            <Draggable draggableId={comment.id} index={index} key={comment.id}>
              {(provided) => (
                <List.Item
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  {comment.userId !== tempUserId ? (
                    isActive ? (
                      <div
                        style={{
                          filter: "blur(4px)",
                          fontWeight: "normal",
                          color: "black",
                        }}
                      >
                        {comment.message}
                      </div>
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
            </Draggable>
          )}
        />
        {provided.placeholder}
      </Card>
    )}
  </Droppable>
);

export default CommentGroup;
