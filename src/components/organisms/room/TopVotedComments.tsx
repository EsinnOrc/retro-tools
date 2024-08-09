import React from "react";
import { Row, Col, Card, Button, List } from "antd";
import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";

interface Comment {
  id: string;
  message: string;
  likes: number;
  dislikes: number;
  step_id: string;
}

interface CommentGroup extends Comment {
  id: string;
}

interface TopVotedCommentsProps {
  topComments: Comment[];
  topGroups: CommentGroup[];
  isActive: boolean;
  userVotes: { [key: string]: number };
  groupLikes: { [key: string]: number };
  groupDislikes: { [key: string]: number };
  updateCommentLikes: (
    commentId: string,
    stepId: string,
    newVote: number,
    isGroup: boolean
  ) => void;
}

const TopVotedComments: React.FC<TopVotedCommentsProps> = ({
  topComments,
  topGroups,
  isActive,
  userVotes,
  groupLikes,
  groupDislikes,
  updateCommentLikes,
}) => {
  const renderComment = (
    comment: Comment,
    index: number,
    isGroup: boolean,
    groupId?: string
  ) => (
    <Col span={24} key={comment.id}>
      <Card
        className={isGroup ? styles.commentCard : styles.singleCommentCard}
        actions={
          !isActive
            ? [
                <Button
                  key="like"
                  icon={<LikeOutlined />}
                  onClick={() =>
                    updateCommentLikes(
                      isGroup ? groupId! : comment.id,
                      comment.step_id,
                      1,
                      isGroup
                    )
                  }
                  disabled={userVotes[isGroup ? groupId! : comment.id] === 1}
                >
                  {isGroup ? groupLikes[groupId!] : comment.likes}
                </Button>,
                <Button
                  key="dislike"
                  icon={<DislikeOutlined />}
                  onClick={() =>
                    updateCommentLikes(
                      isGroup ? groupId! : comment.id,
                      comment.step_id,
                      -1,
                      isGroup
                    )
                  }
                  disabled={userVotes[isGroup ? groupId! : comment.id] === -1}
                >
                  {isGroup ? groupDislikes[groupId!] : comment.dislikes}
                </Button>,
              ]
            : undefined
        }
      >
        {comment.message}
      </Card>
    </Col>
  );

  return (
    <div>
      <h3>En Çok Oy Alan Yorumlar</h3>
      <Row gutter={[16, 16]}>
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={topComments}
          renderItem={(comment, index) =>
            renderComment(comment, index, false)
          }
        />
      </Row>
      <h3>En Çok Oy Alan Yorum Grupları</h3>
      <Row gutter={[16, 16]}>
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={topGroups}
          renderItem={(group, index) =>
            renderComment(
              { ...group, message: `Grup: ${group.id}` } as Comment,
              index,
              true,
              group.id
            )
          }
        />
      </Row>
    </div>
  );
};

export default TopVotedComments;
