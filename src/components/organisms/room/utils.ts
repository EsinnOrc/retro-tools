import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  increment,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import Swal from "sweetalert2";
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
  userVotes?: { [key: string]: number };
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
  userVotes?: { [key: string]: number };
}

export const fetchComments = (
  roomId: string,
  setComments: React.Dispatch<
    React.SetStateAction<{ [key: string]: Comment[] }>
  >,
  setCommentGroups: React.Dispatch<
    React.SetStateAction<{ [key: string]: string[] }>
  >,
  setGroupLikes: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >,
  setGroupDislikes: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >
) => {
  if (!roomId) {
    console.error("Invalid roomId:", roomId);
    return;
  }

  const commentsQuery = query(
    collection(db, "comments"),
    where("room_id", "==", roomId)
  );

  const groupsQuery = query(
    collection(db, "comment_groups"),
    where("room_id", "==", roomId)
  );

  onSnapshot(commentsQuery, (snapshot) => {
    const commentsData: { [key: string]: Comment[] } = {};
    snapshot.forEach((doc) => {
      const data = doc.data() as Comment;
      if (!commentsData[data.step_id]) {
        commentsData[data.step_id] = [];
      }
      commentsData[data.step_id].push({
        ...data,
        created_at: new Date(data.created_at),
      });
    });
    Object.keys(commentsData).forEach((stepId) => {
      commentsData[stepId].sort(
        (a, b) => a.created_at.getTime() - b.created_at.getTime()
      );
    });
    setComments(commentsData);
  });

  onSnapshot(groupsQuery, (snapshot) => {
    const groupsData: { [key: string]: string[] } = {};
    const groupLikesData: { [key: string]: number } = {};
    const groupDislikesData: { [key: string]: number } = {};

    snapshot.forEach((doc) => {
      const data = doc.data() as CommentGroup;
      groupsData[doc.id] = data.comments;
      groupLikesData[doc.id] = data.total_likes;
      groupDislikesData[doc.id] = data.total_dislikes;
    });

    try {
      setCommentGroups(groupsData);
      setGroupLikes(groupLikesData);
      setGroupDislikes(groupDislikesData);
    } catch (error) {
      console.error("Error setting state:", error);
    }
  });
};

export const fetchRoomData = async (
  roomId: string,
  setTemplateOwnerId: React.Dispatch<React.SetStateAction<string | null>>,
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>,
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>,
  fetchComments: (
    roomId: string,
    setComments: React.Dispatch<
      React.SetStateAction<{ [key: string]: Comment[] }>
    >,
    setCommentGroups: React.Dispatch<
      React.SetStateAction<{ [key: string]: string[] }>
    >,
    setGroupLikes: React.Dispatch<
      React.SetStateAction<{ [key: string]: number }>
    >,
    setGroupDislikes: React.Dispatch<
      React.SetStateAction<{ [key: string]: number }>
    >
  ) => void,
  setComments: React.Dispatch<
    React.SetStateAction<{ [key: string]: Comment[] }>
  >,
  setCommentGroups: React.Dispatch<
    React.SetStateAction<{ [key: string]: string[] }>
  >,
  setGroupLikes: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >,
  setGroupDislikes: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >
) => {
  try {
    if (!roomId) {
      throw new Error("Invalid roomId");
    }

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

        fetchComments(
          roomId,
          setComments,
          setCommentGroups,
          setGroupLikes,
          setGroupDislikes
        );
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

export const initializeSnapshot = (
  roomId: string,
  setIsFinalized: React.Dispatch<React.SetStateAction<boolean>>,
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const roomRef = doc(db, "rooms", roomId);
  onSnapshot(roomRef, (snapshot) => {
    const roomData = snapshot.data();
    if (roomData && roomData.is_active === false) {
      setIsFinalized(true);
      setIsActive(false);
    }
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
  const comment: Comment = {
    id: commentId,
    message: newComments[stepId],
    userId: tempUserId,
    step_id: stepId,
    likes: 0,
    dislikes: 0,
    created_at: new Date(),
    room_id: roomId as string,
    userVotes: {},
  };

  try {
    await setDoc(doc(db, "comments", commentId), comment);
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
    title: "Emin misiniz?",
    text: "Bu işlemi geri alamazsınız!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#219ebc",
    cancelButtonColor: "rgba(99, 99, 99, 0.5) ",
    confirmButtonText: "Evet, sonuçlandır!",
    cancelButtonText: "Hayır, iptal et",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const roomRef = doc(db, "rooms", roomId as string);
        await updateDoc(roomRef, {
          is_active: false,
          is_finished: false,
        });
        setIsActive(false);
        setIsFinalized(false);
        Swal.fire(
          "Sonuçlandırıldı!",
          "Yorumlar başarıyla sonuçlandırıldı.",
          "success"
        ).then(() => {});
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
  setComments: React.Dispatch<
    React.SetStateAction<{ [key: string]: Comment[] }>
  >,
  setUserVotes: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
  isGroup: boolean
) => {
  const ref = isGroup
    ? doc(db, "comment_groups", commentId)
    : doc(db, "comments", commentId);

  try {
    const docSnapshot = await getDoc(ref);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data() as Comment | CommentGroup;
      const userVote = data.userVotes ? data.userVotes[actualUserId] : null;

      if (userVote !== null) {
        const previousVote = userVote;
        if (previousVote === newVote) {
          Swal.fire({
            title: "Hata",
            text: "Bu yoruma zaten oy verdiniz.",
            icon: "error",
            confirmButtonText: "Tamam",
          });
          return;
        } else {
          const updates: any = {
            ...(isGroup
              ? {
                  total_likes: increment(previousVote === 1 ? -1 : 0),
                  total_dislikes: increment(previousVote === -1 ? -1 : 0),
                }
              : {
                  likes: increment(previousVote === 1 ? -1 : 0),
                  dislikes: increment(previousVote === -1 ? -1 : 0),
                }),
          };
          await updateDoc(ref, updates);
        }
      }

      const updates: any = {
        ...(isGroup
          ? {
              total_likes: increment(newVote === 1 ? 1 : 0),
              total_dislikes: increment(newVote === -1 ? 1 : 0),
            }
          : {
              likes: increment(newVote === 1 ? 1 : 0),
              dislikes: increment(newVote === -1 ? 1 : 0),
            }),
        [`userVotes.${actualUserId}`]: newVote,
      };

      await updateDoc(ref, updates);

      const updatedDocSnapshot = await getDoc(ref);
      const updatedData = updatedDocSnapshot.data() as Comment | CommentGroup;

      setComments((prevComments) => {
        const updatedComments = prevComments[stepId].map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              ...(isGroup
                ? {
                    total_likes: (updatedData as CommentGroup).total_likes,
                    total_dislikes: (updatedData as CommentGroup)
                      .total_dislikes,
                  }
                : {
                    likes: (updatedData as Comment).likes,
                    dislikes: (updatedData as Comment).dislikes,
                  }),
            };
          }
          return comment;
        });
        return { ...prevComments, [stepId]: updatedComments };
      });

      setUserVotes((prevVotes) => ({
        ...prevVotes,
        [commentId]: newVote,
      }));
    } else {
      console.error("No document to update:", commentId);
    }
  } catch (error) {
    console.error("Error updating comment likes/dislikes:", error);
  }
};

export const saveCommentGroup = async (
  groupId: string,
  groupData: CommentGroup
) => {
  const groupRef = doc(db, "comment_groups", groupId);
  await setDoc(groupRef, groupData, { merge: true });
};

export const updateCommentGroup = async (
  groupId: string,
  commentId: string,
  action: "add" | "remove"
) => {
  const groupRef = doc(db, "comment_groups", groupId);
  const updateData =
    action === "add"
      ? { comments: arrayUnion(commentId) }
      : { comments: arrayRemove(commentId) };
  await updateDoc(groupRef, updateData);
};

export const checkIfCommentInGroup = async (
  commentId: string,
  groupId: string
) => {
  const groupRef = doc(db, "comment_groups", groupId);
  const groupDoc = await getDoc(groupRef);
  if (groupDoc.exists()) {
    const groupData = groupDoc.data() as CommentGroup;
    return groupData.comments.includes(commentId);
  }
  return false;
};

export const fetchCommentGroup = async (groupId: string) => {
  const groupRef = doc(db, "comment_groups", groupId);
  const groupDoc = await getDoc(groupRef);
  if (groupDoc.exists()) {
    const groupData = groupDoc.data() as CommentGroup;
    const groupComments = await Promise.all(
      groupData.comments.map(async (commentId) => {
        const commentRef = doc(db, "comments", commentId);
        const commentDoc = await getDoc(commentRef);
        return commentDoc.exists() ? (commentDoc.data() as Comment) : null;
      })
    );
    return {
      ...groupData,
      comments: groupComments.filter((comment) => comment !== null),
    };
  }
  return null;
};
