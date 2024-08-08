import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import CommentList from "./commentList";
import CommentInput from "./commentInput";
import { Step, Comment, updateCommentLikes, updateCommentGroup, sendComment as sendCommentToDb, fetchCommentGroup } from "./utils";
import { db } from "@/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

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
}) => {
  const [commentGroups, setCommentGroups] = useState<{ [key: string]: Comment[] }>({});
  const [groupLikes, setGroupLikes] = useState<{ [key: string]: number }>({});
  const [groupDislikes, setGroupDislikes] = useState<{ [key: string]: number }>({});

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceIndex = parseInt(source.droppableId);
    const destinationIndex = parseInt(destination.droppableId);

    const sourceStep = steps[sourceIndex];
    const destinationStep = steps[destinationIndex];

    const sourceComments = Array.from(comments[sourceStep.id]);
    const [movedComment] = sourceComments.splice(source.index, 1);
    const destinationComments = Array.from(comments[destinationStep.id]);

    if (!destinationComments.some(comment => comment.id === movedComment.id)) {
      destinationComments.splice(destination.index, 0, movedComment);
    }

    const updatedComments = {
      ...comments,
      [sourceStep.id]: sourceComments,
      [destinationStep.id]: destinationComments,
    };

    setComments(updatedComments);

    const groupData = {
      comments: destinationComments.map(comment => comment.id),
      room_id: roomId,
      total_likes: destinationComments.reduce((acc, comment) => acc + comment.likes, 0),
      total_dislikes: destinationComments.reduce((acc, comment) => acc + comment.dislikes, 0),
    };

    const groupRef = doc(db, "comment_groups", destinationStep.id);
    await setDoc(groupRef, groupData, { merge: true });

    console.log("Group saved to Firebase:", groupData);
    setCommentGroups(prevGroups => ({
      ...prevGroups,
      [destinationStep.id]: destinationComments
    }));
    setGroupLikes(prevLikes => ({
      ...prevLikes,
      [destinationStep.id]: groupData.total_likes
    }));
    setGroupDislikes(prevDislikes => ({
      ...prevDislikes,
      [destinationStep.id]: groupData.total_dislikes
    }));
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
      [stepId]: prevComments[stepId] ? [...prevComments[stepId], newComment] : [newComment],
    }));

    setNewComments((prevComments) => ({
      ...prevComments,
      [stepId]: '',
    }));

    sendCommentToDb(stepId, { [stepId]: commentText }, tempUserId, roomId, socket);
  };

  useEffect(() => {
    if (steps.length > 0) {
      steps.forEach(async (step) => {
        const group = await fetchCommentGroup(step.id);
        if (group) {
          setCommentGroups(prevGroups => ({
            ...prevGroups,
            [step.id]: group.comments
          }));
          setGroupLikes(prevLikes => ({
            ...prevLikes,
            [step.id]: group.total_likes
          }));
          setGroupDislikes(prevDislikes => ({
            ...prevDislikes,
            [step.id]: group.total_dislikes
          }));
        }
      });
    }
  }, [steps]);

  useEffect(() => {
    if (commentGroups) {
      Object.keys(commentGroups).forEach(async (groupId) => {
        const group = await fetchCommentGroup(groupId);
        if (group) {
          setGroupLikes(prevLikes => ({
            ...prevLikes,
            [groupId]: group.total_likes
          }));
          setGroupDislikes(prevDislikes => ({
            ...prevDislikes,
            [groupId]: group.total_dislikes
          }));
        }
      });
    }
  }, [commentGroups]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {steps.map((step, index) => (
        <Droppable droppableId={String(index)} key={step.id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <h2>{step.name}</h2>
              <CommentList
                comments={commentGroups[step.id] || comments[step.id]}
                isActive={isActive}
                userVotes={userVotes}
                updateCommentLikes={(commentId, stepId, newVote, isGroup) =>
                  updateCommentLikes(commentId, stepId, newVote, actualUserId, setComments, setUserVotes, isGroup)
                }
                tempUserId={tempUserId}
                isGroup={!!commentGroups[step.id]}
                groupId={step.id}
                groupLikes={groupLikes[step.id]}
                groupDislikes={groupDislikes[step.id]}
              />
              <CommentInput
                stepId={step.id}
                newComment={newComments[step.id] || ''}
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
