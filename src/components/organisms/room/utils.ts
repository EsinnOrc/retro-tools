import { collection, getDocs, getDoc, doc, query, where, onSnapshot, updateDoc, increment, setDoc } from "firebase/firestore";
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from "uuid";
import { db } from "@/firebaseConfig";

export interface Comment {
  id: string;
  message: string;
  userId: string;
  step_id: string;
  likes: number;
  dislikes: number;
  created_at: Date;
  room_id: string;
  userVotes: { [key: string]: number };
}

export interface Step {
  id: string;
  name: string;
}

export interface CommentGroup {
    id: string;
    comments: string[];
    room_id: string;
    total_likes: number;
    total_dislikes: number;
  }

export const fetchComments = (roomId: string, setComments: React.Dispatch<React.SetStateAction<{ [key: string]: Comment[] }>>) => {
  const commentsQuery = query(
    collection(db, "comments"),
    where("room_id", "==", roomId)
  );
  onSnapshot(commentsQuery, (snapshot) => {
    const commentsData: { [key: string]: Comment[] } = {};
    snapshot.forEach((doc) => {
      const data = doc.data() as Comment;
      if (!commentsData[data.step_id]) {
        commentsData[data.step_id] = [];
      }
      commentsData[data.step_id].push({ ...data, created_at: data.created_at.toDate() });
    });
    Object.keys(commentsData).forEach(stepId => {
      commentsData[stepId].sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    });
    setComments(commentsData);
  });
};

export const fetchRoomData = async (
  roomId: string,
  setTemplateOwnerId: React.Dispatch<React.SetStateAction<string | null>>,
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>,
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>,
  fetchComments: (roomId: string, setComments: React.Dispatch<React.SetStateAction<{ [key: string]: Comment[] }>>) => void,
  setComments: React.Dispatch<React.SetStateAction<{ [key: string]: Comment[] }>>
) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    const roomDoc = await getDoc(roomRef);

    if (roomDoc.exists()) {
      const roomData = roomDoc.data();
      const templateId = roomData.template_id;
      setIsActive(roomData.is_active);

      const templateRef = doc(db, "templates", templateId);
      const templateDoc = await getDoc(templateRef);

      if (templateDoc.exists()) {
        const templateData = templateDoc.data();
        setTemplateOwnerId(templateData.user_id);

        const stepsList = templateData.step_names.map((step: any) => ({
          id: step.id,
          name: step.name,
        }));
        setSteps(stepsList);

        fetchComments(roomId, setComments);
      } else {
        console.error("No such template!");
      }
    } else {
      console.error("No such room!");
    }
  } catch (error) {
    console.error("Error fetching room data:", error);
  }
};

export const fetchUserVotes = async (
  roomId: string,
  actualUserId: string,
  setUserVotes: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
  setTotalVotes: React.Dispatch<React.SetStateAction<number>>
) => {
  const commentsQuery = query(
    collection(db, "comments"),
    where("room_id", "==", roomId)
  );
  const snapshot = await getDocs(commentsQuery);

  const userVotesData: { [key: string]: number } = {};
  snapshot.forEach((doc) => {
    const data = doc.data() as Comment;
    if (data.userVotes && data.userVotes[actualUserId]) {
      userVotesData[doc.id] = data.userVotes[actualUserId];
    }
  });

  setUserVotes(userVotesData);
  setTotalVotes(Object.keys(userVotesData).length);
};

export const initializeSocket = (
  socket: any,
  setComments: React.Dispatch<React.SetStateAction<{ [key: string]: Comment[] }>>,
  setIsFinalized: React.Dispatch<React.SetStateAction<boolean>>
) => {
  socket.on("receiveMessage", (comment: Comment) => {
    setComments((prevComments) => {
      const currentComments = prevComments[comment.step_id] || [];
      const isAlreadyAdded = currentComments.some((c) => c.id === comment.id);
      if (isAlreadyAdded) return prevComments;
      return {
        ...prevComments,
        [comment.step_id]: [...currentComments, comment],
      };
    });
  });

  socket.on("finalizeComments", () => {
    setIsFinalized(true);
  });
};

export const sendComment = async (
  stepId: string,
  newComments: { [key: string]: string },
  tempUserId: string,
  roomId: string | string[],
  socket: any
) => {
  const commentId = uuidv4();
  const comment = {
    id: commentId,
    message: newComments[stepId],
    userId: tempUserId,
    step_id: stepId,
    likes: 0,
    dislikes: 0,
    created_at: new Date(),
    room_id: roomId,
    userVotes: {}
  };

  try {
    await setDoc(doc(db, "comments", commentId), comment);
    console.log("Document written with ID: ", commentId);
  } catch (error) {
    console.error("Error adding document: ", error);
  }

  socket.emit("sendMessage", comment);
};

export const finalizeComments = async (
  roomId: string | string[],
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>,
  setIsFinalized: React.Dispatch<React.SetStateAction<boolean>>
) => {
  Swal.fire({
    title: 'Emin misiniz?',
    text: "Bu işlemi geri alamazsınız!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Evet, sonuçlandır!',
    cancelButtonText: 'Hayır, iptal et'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const roomRef = doc(db, "rooms", roomId as string);
        await updateDoc(roomRef, {
          is_active: false,
        });
        setIsActive(false);
        setIsFinalized(true);
        Swal.fire(
          'Sonuçlandırıldı!',
          'Yorumlar başarıyla sonuçlandırıldı.',
          'success'
        );
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  });
};

export const updateCommentLikes = async (
    commentId: string,
    stepId: string,
    newVote: number,
    actualUserId: string,
    setComments: React.Dispatch<React.SetStateAction<{ [key: string]: Comment[] }>>,
    setUserVotes: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>
  ) => {
    const commentRef = doc(db, "comments", commentId);
    try {
      const commentDoc = await getDoc(commentRef);
      if (commentDoc.exists()) {
        const commentData = commentDoc.data() as Comment;
        const currentVote = commentData.userVotes ? commentData.userVotes[actualUserId] : 0;
  
        if (currentVote === newVote) {
          Swal.fire({
            title: 'Hata',
            text: 'Bu yoruma zaten oy verdiniz.',
            icon: 'error',
            confirmButtonText: 'Tamam'
          });
          return;
        }
  
        const updates: any = {
          likes: increment(newVote === 1 ? 1 : currentVote === 1 ? -1 : 0),
          dislikes: increment(newVote === -1 ? 1 : currentVote === -1 ? -1 : 0),
          [`userVotes.${actualUserId}`]: newVote
        };
  
        await updateDoc(commentRef, updates);
  
        const updatedCommentDoc = await getDoc(commentRef);
        const updatedCommentData = updatedCommentDoc.data() as Comment;
  
        setComments((prevComments) => {
          const updatedComments = prevComments[stepId].map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes: updatedCommentData.likes,
                dislikes: updatedCommentData.dislikes,
                userVotes: updatedCommentData.userVotes
              };
            }
            return comment;
          });
          return { ...prevComments, [stepId]: updatedComments };
        });
  
        setUserVotes((prevVotes) => ({
          ...prevVotes,
          [commentId]: newVote
        }));
      } else {
        console.error("No document to update:", commentId);
      }
    } catch (error) {
      console.error("Error updating comment likes/dislikes:", error);
    }
  };

export const saveCommentGroup = async (groupId: string, groupData: CommentGroup) => {
    const groupRef = doc(db, "comment_groups", groupId);
    await setDoc(groupRef, groupData, { merge: true });
    console.log("Group saved to Firebase:", groupData);
  };
  
  // Firebase'de grubu güncelleme
  export const updateCommentGroup = async (groupId: string, commentId: string, action: "add" | "remove") => {
    const groupRef = doc(db, "comment_groups", groupId);
    const updateData = action === "add" ? { comments: arrayUnion(commentId) } : { comments: arrayRemove(commentId) };
    await updateDoc(groupRef, updateData);
    console.log("Group updated in Firebase:", updateData);
  };
  // Yorumların grupta olup olmadığını kontrol etme
  export const checkIfCommentInGroup = async (commentId: string, groupId: string) => {
    const groupRef = doc(db, "comment_groups", groupId);
    const groupDoc = await getDoc(groupRef);
    if (groupDoc.exists()) {
      const groupData = groupDoc.data() as CommentGroup;
      return groupData.comments.includes(commentId);
    }
    return false;
  };
