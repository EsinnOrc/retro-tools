import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import CommentList from "./commentList";
import CommentInput from "./commentInput";
import {
  Step,
  Comment,
  updateCommentLikes,
  sendComment as sendCommentToDb,
  fetchComments,
} from "./utils";
import { db } from "@/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

interface StepListProps {
  steps: Step[];
  comments: { [key: string]: Comment[] };
  isActive: boolean;
  newComments: { [key: string]: string };
  setNewComments: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  tempUserId: string;
  actualUserId: string;
  socket: any;
  roomId: string;
  userVotes: { [key: string]: number };
  setComments: React.Dispatch<
    React.SetStateAction<{ [key: string]: Comment[] }>
  >;
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
}) => {
  const [commentGroups, setCommentGroups] = useState<{
    [key: string]: string[];
  }>({});
  const [groupLikes, setGroupLikes] = useState<{ [key: string]: number }>({});
  const [groupDislikes, setGroupDislikes] = useState<{ [key: string]: number }>(
    {}
  );

  const onDragEnd = async (result: DropResult) => {
    const { source, combine } = result;

    if (!combine) return;

    const sourceIndex = parseInt(source.droppableId);
    const destinationIndex = parseInt(combine.droppableId);

    const sourceStep = steps[sourceIndex];
    const destinationStep = steps[destinationIndex];

    const sourceComments = Array.from(comments[sourceStep.id]);
    const [movedComment] = sourceComments.splice(source.index, 1);
    const destinationComments = Array.from(comments[destinationStep.id]);

    const combinedWithComment = destinationComments.find(
      (comment) => comment.id === combine.draggableId
    );

    if (combinedWithComment) {
      const sourceGroupId = Object.keys(commentGroups).find((groupId) =>
        commentGroups[groupId].includes(movedComment.id)
      );
      const destinationGroupId = Object.keys(commentGroups).find((groupId) =>
        commentGroups[groupId].includes(combinedWithComment.id)
      );

      if (sourceGroupId && destinationGroupId) {
        const newGroup = Array.from(
          new Set([
            ...commentGroups[sourceGroupId],
            ...commentGroups[destinationGroupId],
          ])
        );
        const newGroupId = uuidv4();
        setCommentGroups({
          ...commentGroups,
          [newGroupId]: newGroup,
        });
        delete commentGroups[sourceGroupId];
        delete commentGroups[destinationGroupId];

        const groupData = {
          comments: newGroup,
          room_id: roomId,
          total_likes: newGroup.reduce((acc, commentId) => {
            const comment =
              destinationComments.find((comment) => comment.id === commentId) ||
              sourceComments.find((comment) => comment.id === commentId);
            return acc + (comment ? comment.likes : 0);
          }, 0),
          total_dislikes: newGroup.reduce((acc, commentId) => {
            const comment =
              destinationComments.find((comment) => comment.id === commentId) ||
              sourceComments.find((comment) => comment.id === commentId);
            return acc + (comment ? comment.dislikes : 0);
          }, 0),
        };

        const groupRef = doc(db, "comment_groups", newGroupId);
        await setDoc(groupRef, groupData, { merge: true });

        setGroupLikes({
          ...groupLikes,
          [newGroupId]: groupData.total_likes,
        });
        setGroupDislikes({
          ...groupDislikes,
          [newGroupId]: groupData.total_dislikes,
        });
      } else if (sourceGroupId) {
        const newGroup = Array.from(
          new Set([...commentGroups[sourceGroupId], combinedWithComment.id])
        );
        setCommentGroups({
          ...commentGroups,
          [sourceGroupId]: newGroup,
        });

        const groupData = {
          comments: newGroup,
          room_id: roomId,
          total_likes: newGroup.reduce((acc, commentId) => {
            const comment =
              destinationComments.find((comment) => comment.id === commentId) ||
              sourceComments.find((comment) => comment.id === commentId);
            return acc + (comment ? comment.likes : 0);
          }, 0),
          total_dislikes: newGroup.reduce((acc, commentId) => {
            const comment =
              destinationComments.find((comment) => comment.id === commentId) ||
              sourceComments.find((comment) => comment.id === commentId);
            return acc + (comment ? comment.dislikes : 0);
          }, 0),
        };

        const groupRef = doc(db, "comment_groups", sourceGroupId);
        await setDoc(groupRef, groupData, { merge: true });

        setGroupLikes({
          ...groupLikes,
          [sourceGroupId]: groupData.total_likes,
        });
        setGroupDislikes({
          ...groupDislikes,
          [sourceGroupId]: groupData.total_dislikes,
        });
      } else if (destinationGroupId) {
        const newGroup = Array.from(
          new Set([...commentGroups[destinationGroupId], movedComment.id])
        );
        setCommentGroups({
          ...commentGroups,
          [destinationGroupId]: newGroup,
        });

        const groupData = {
          comments: newGroup,
          room_id: roomId,
          total_likes: newGroup.reduce((acc, commentId) => {
            const comment =
              destinationComments.find((comment) => comment.id === commentId) ||
              sourceComments.find((comment) => comment.id === commentId);
            return acc + (comment ? comment.likes : 0);
          }, 0),
          total_dislikes: newGroup.reduce((acc, commentId) => {
            const comment =
              destinationComments.find((comment) => comment.id === commentId) ||
              sourceComments.find((comment) => comment.id === commentId);
            return acc + (comment ? comment.dislikes : 0);
          }, 0),
        };

        const groupRef = doc(db, "comment_groups", destinationGroupId);
        await setDoc(groupRef, groupData, { merge: true });

        setGroupLikes({
          ...groupLikes,
          [destinationGroupId]: groupData.total_likes,
        });
        setGroupDislikes({
          ...groupDislikes,
          [destinationGroupId]: groupData.total_dislikes,
        });
      } else {
        const groupId = uuidv4();
        const newGroup = [movedComment.id, combinedWithComment.id];
        setCommentGroups({
          ...commentGroups,
          [groupId]: newGroup,
        });

        const groupData = {
          comments: newGroup,
          room_id: roomId,
          total_likes: newGroup.reduce((acc, commentId) => {
            const comment =
              destinationComments.find((comment) => comment.id === commentId) ||
              sourceComments.find((comment) => comment.id === commentId);
            return acc + (comment ? comment.likes : 0);
          }, 0),
          total_dislikes: newGroup.reduce((acc, commentId) => {
            const comment =
              destinationComments.find((comment) => comment.id === commentId) ||
              sourceComments.find((comment) => comment.id === commentId);
            return acc + (comment ? comment.dislikes : 0);
          }, 0),
        };

        const groupRef = doc(db, "comment_groups", groupId);
        await setDoc(groupRef, groupData, { merge: true });

        setGroupLikes({
          ...groupLikes,
          [groupId]: groupData.total_likes,
        });
        setGroupDislikes({
          ...groupDislikes,
          [groupId]: groupData.total_dislikes,
        });
      }

      const updatedComments = {
        ...comments,
        [sourceStep.id]: sourceComments,
        [destinationStep.id]: destinationComments,
      };

      setComments(updatedComments);
    }
  };

  const sendComment = (stepId: string) => {
    const commentText = newComments[stepId];
    if (!commentText) return;

    const newComment: Comment = {
      id: uuidv4(),
      message: commentText,
      userId: actualUserId,
      step_id: stepId,
      likes: 0,
      dislikes: 0,
      created_at: new Date(),
      room_id: roomId as string,
    };

    setComments((prevComments) => ({
      ...prevComments,
      [stepId]: prevComments[stepId]
        ? [...prevComments[stepId], newComment]
        : [newComment],
    }));

    setNewComments((prevComments) => ({
      ...prevComments,
      [stepId]: "",
    }));

    sendCommentToDb(
      stepId,
      { [stepId]: commentText },
      tempUserId,
      roomId,
      socket
    );
  };

  useEffect(() => {
    if (roomId) {
      fetchComments(roomId, setComments, setCommentGroups, setGroupLikes, setGroupDislikes);
    }
  }, [roomId]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {steps.map((step, index) => (
        <Droppable droppableId={String(index)} key={step.id} isCombineEnabled>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <h2>{step.name}</h2>
              <CommentList
                comments={comments[step.id]}
                isActive={isActive}
                userVotes={userVotes}
                updateCommentLikes={(commentId, stepId, newVote, isGroup) =>
                  updateCommentLikes(
                    commentId,
                    stepId,
                    newVote,
                    actualUserId,
                    setComments,
                    setUserVotes,
                    isGroup
                  )
                }
                tempUserId={tempUserId}
                commentGroups={commentGroups}
                groupLikes={groupLikes}
                groupDislikes={groupDislikes}
              />
              <CommentInput
                stepId={step.id}
                newComment={newComments[step.id] || ""}
                setNewComments={setNewComments}
                isActive={isActive}
                sendComment={sendComment}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};

export default StepList;
