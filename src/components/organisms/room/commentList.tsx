import React from "react";
import { List, Button, Skeleton, Card } from "antd";
import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";
import { Comment } from "./utils";
import { Draggable } from "react-beautiful-dnd";
import styles from "./index.module.scss";

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
              className={styles.commentListItem}
            >
              {isGroup ? (
                <Card
                  className={styles.commentCard}
                  actions={
                    !isActive
                      ? [
                          <Button
                            icon={<LikeOutlined />}
                            onClick={() =>
                              updateCommentLikes(
                                groupId!,
                                comment.step_id,
                                1,
                                true
                              )
                            }
                            disabled={userVotes[groupId!] === 1}
                          >
                            {groupLikes[groupId!]}
                          </Button>,
                          <Button
                            icon={<DislikeOutlined />}
                            onClick={() =>
                              updateCommentLikes(
                                groupId!,
                                comment.step_id,
                                -1,
                                true
                              )
                            }
                            disabled={userVotes[groupId!] === -1}
                          >
                            {groupDislikes[groupId!]}
                          </Button>,
                        ]
                      : undefined
                  }
                >
                  {groupedComments.map((groupedComment, idx) =>
                    groupedComment ? (
                      <div
                        key={groupedComment.id}
                        className={`${styles.groupedComment} ${
                          groupedComment.userId === tempUserId
                            ? styles.groupedCommentActive
                            : ""
                        }`}
                      >
                        {groupedComment.message}
                      </div>
                    ) : null
                  )}
                </Card>
              ) : (
                <Card
                  className={styles.singleCommentCard}
                  actions={
                    !isActive
                      ? [
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
                            disabled={userVotes[comment.id] === 1}
                          >
                            {comment.likes}
                          </Button>,
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
                          </Button>,
                        ]
                      : undefined
                  }
                >
                  {comment.userId !== tempUserId ? (
                    isActive ? (
                      <Skeleton
                        active
                        title={false}
                        paragraph={{ rows: 1 }}
                        className={styles.skeletonPlaceholder}
                      />
                    ) : (
                      <div className={styles.groupedComment}>
                        {comment.message}
                      </div>
                    )
                  ) : (
                    <div className={styles.groupedCommentActive}>
                      {comment.message}
                    </div>
                  )}
                </Card>
              )}
            </List.Item>
          )}
        </Draggable>
      );
    }}
  />
);

export default CommentList;
