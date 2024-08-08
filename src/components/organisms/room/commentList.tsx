import React from "react";
import { List, Button, Skeleton, Card } from "antd";
import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";
import { Comment } from "./utils";
import { Draggable } from "react-beautiful-dnd";

interface CommentListProps {
  comments: Comment[];
  isActive: boolean;
  userVotes: { [key: string]: number };
  updateCommentLikes: (
    commentId: string,
    stepId: string,
    newVote: number,
    isGroup: boolean
  ) => void;
  tempUserId: string;
  commentGroups: { [key: string]: string[] };
  groupLikes: { [key: string]: number };
  groupDislikes: { [key: string]: number };
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  isActive,
  userVotes,
  updateCommentLikes,
  tempUserId,
  commentGroups,
  groupLikes,
  groupDislikes,
}) => (
  <List
    dataSource={comments}
    renderItem={(comment, index) => {
      const groupId = Object.keys(commentGroups).find((key) =>
        commentGroups[key].includes(comment.id)
      );
      const isGroup = !!groupId;

      if (isGroup && commentGroups[groupId!].indexOf(comment.id) !== 0) {
     
        return null;
      }

      const groupedComments = isGroup
        ? commentGroups[groupId!].map((commentId) =>
            comments.find((comment) => comment.id === commentId)
          )
        : [];

      return (
        <Draggable draggableId={comment.id} index={index} key={comment.id}>
          {(provided, snapshot) => (
            <List.Item
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{
                ...provided.draggableProps.style,
                backgroundColor: snapshot.isDropAnimating
                  ? "lightgreen"
                  : "white",
                marginBottom: "8px",
                borderRadius: "4px",
                padding: "8px",
              }}
            >
              {isGroup ? (
                <Card
                  title={`Grup ${groupId}`}
                  style={{ marginBottom: "8px" }}
                  actions={[
                    <Button
                      icon={<LikeOutlined />}
                      onClick={() =>
                        updateCommentLikes(groupId!, comment.step_id, 1, true)
                      }
                      disabled={userVotes[groupId!] === 1}
                    >
                      {groupLikes[groupId!]}
                    </Button>,
                    <Button
                      icon={<DislikeOutlined />}
                      onClick={() =>
                        updateCommentLikes(groupId!, comment.step_id, -1, true)
                      }
                      disabled={userVotes[groupId!] === -1}
                    >
                      {groupDislikes[groupId!]}
                    </Button>,
                  ]}
                >
                  {groupedComments.map((groupedComment, idx) =>
                    groupedComment ? (
                      <div
                        key={groupedComment.id}
                        style={{
                          fontWeight:
                            groupedComment.userId === tempUserId
                              ? "bold"
                              : "normal",
                          color:
                            groupedComment.userId === tempUserId ? "blue" : "black",
                          marginBottom: "4px",
                        }}
                      >
                        {groupedComment.message}
                      </div>
                    ) : null
                  )}
                </Card>
              ) : (
                <>
                  {comment.userId !== tempUserId ? (
                    isActive ? (
                      <Skeleton active title={false} paragraph={{ rows: 1 }} />
                    ) : (
                      <div style={{ fontWeight: "normal", color: "black" }}>
                        {comment.message}
                      </div>
                    )
                  ) : (
                    <div style={{ fontWeight: "bold", color: "blue" }}>
                      {comment.message}
                    </div>
                  )}
                  {!isActive && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Button
                        icon={<LikeOutlined />}
                        onClick={() =>
                          updateCommentLikes(
                            comment.id,
                            comment.step_id,
                            1,
                            false
                          )
                        }
                        style={{ marginRight: 8 }}
                        disabled={userVotes[comment.id] === 1}
                      >
                        {comment.likes}
                      </Button>
                      <Button
                        icon={<DislikeOutlined />}
                        onClick={() =>
                          updateCommentLikes(
                            comment.id,
                            comment.step_id,
                            -1,
                            false
                          )
                        }
                        disabled={userVotes[comment.id] === -1}
                      >
                        {comment.dislikes}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </List.Item>
          )}
        </Draggable>
      );
    }}
  />
);

export default CommentList;
