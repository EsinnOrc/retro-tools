import React from 'react';
import CommentList from "./CommentList";
import CommentInput from "./commentInput";
import { Step, Comment } from "./utils";
import { sendComment, updateCommentLikes } from "./utils";

interface StepListProps {
  steps: Step[];
  comments: { [key: string]: Comment[] };
  isActive: boolean;
  newComments: { [key: string]: string };
  setNewComments: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  tempUserId: string;
  actualUserId: string;
  socket: any;
  roomId: string;
  userVotes: { [key: string]: number };
  setComments: React.Dispatch<React.SetStateAction<{ [key: string]: Comment[] }>>;
  setUserVotes: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
}

const StepList: React.FC<StepListProps> = ({
  steps,
  comments,
  isActive,
  newComments,
  setNewComments,
  tempUserId,
  actualUserId,
  socket,
  roomId,
  userVotes,
  setComments,
  setUserVotes,
}) => (
  <>
    {steps.map((step) => (
      <div key={step.id} style={{ marginBottom: "20px" }}>
        <h4>{step.name}</h4>
        <CommentList
          comments={comments[step.id] || []}
          isActive={isActive}
          userVotes={userVotes}
          updateCommentLikes={(commentId: string, stepId: string, newVote: number) =>
            updateCommentLikes(commentId, stepId, newVote, actualUserId, setComments, setUserVotes)
          }
          tempUserId={tempUserId}
        />
        <CommentInput
          stepId={step.id}
          newComment={newComments[step.id] || ""}
          setNewComments={setNewComments}
          isActive={isActive}
          sendComment={() => sendComment(step.id, newComments, tempUserId, roomId, socket)}
        />
      </div>
    ))}
  </>
);

export default StepList;
