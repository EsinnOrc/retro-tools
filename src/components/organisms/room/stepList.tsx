import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CommentList from "./commentList";
import { Step, Comment, updateCommentLikes, updateCommentGroup } from "./utils";
import { db } from "@/firebaseConfig";
import { collection, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

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
  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceStep = steps[source.droppableId];
    const destinationStep = steps[destination.droppableId];

    const sourceComments = Array.from(comments[sourceStep.id]);
    const [movedComment] = sourceComments.splice(source.index, 1);
    const destinationComments = Array.from(comments[destinationStep.id]);

    // Kontrol: Eğer yorum zaten destinationComments içinde varsa ekleme
    if (!destinationComments.some(comment => comment.id === movedComment.id)) {
      destinationComments.splice(destination.index, 0, movedComment);
    }

    const updatedComments = {
      ...comments,
      [sourceStep.id]: sourceComments,
      [destinationStep.id]: destinationComments,
    };

    setComments(updatedComments);

    // Firebase'e comment_groups kaydetme
    const groupData = {
      comments: destinationComments.map(comment => comment.id),
      room_id: doc(db, "rooms", roomId),
      total_likes: destinationComments.reduce((acc, comment) => acc + comment.likes, 0),
      total_dislikes: destinationComments.reduce((acc, comment) => acc + comment.dislikes, 0),
    };

    const groupRef = doc(db, "comment_groups", destinationStep.id);
    await setDoc(groupRef, groupData, { merge: true });

    console.log("Group saved to Firebase:", groupData);
  };

  const removeFromGroup = async (commentId: string, groupId: string) => {
    const groupRef = doc(db, "comment_groups", groupId);
    await updateCommentGroup(groupId, commentId, "remove");
    
    const groupDoc = await getDoc(groupRef);
    const groupData = groupDoc.data();
    const updatedGroupComments = groupData.comments.filter((id: string) => id !== commentId);

    setComments(prevComments => {
      const groupComments = prevComments[groupId].filter(comment => comment.id !== commentId);
      return { ...prevComments, [groupId]: groupComments };
    });

    console.log(`Comment ${commentId} removed from group ${groupId}`);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {steps.map((step, index) => (
        <Droppable droppableId={`${index}`} key={step.id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <h2>{step.name}</h2>
              <CommentList
                comments={comments[step.id]}
                isActive={isActive}
                userVotes={userVotes}
                updateCommentLikes={(commentId, stepId, newVote) =>
                  updateCommentLikes(commentId, stepId, newVote, actualUserId, setComments, setUserVotes)
                }
                tempUserId={tempUserId}
                isGroup={true}
                groupId={step.id}
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
