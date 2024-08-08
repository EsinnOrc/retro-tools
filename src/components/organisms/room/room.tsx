import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from "uuid";
import StepList from "./stepList";
import FinalizeButton from "./finalizeButton";
import { fetchComments, fetchRoomData, initializeSnapshot, fetchUserVotes } from "./utils";
import { Comment, Step } from "./utils";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
if (!socketUrl) {
  throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined");
}
const socket = io(socketUrl);

const Room: React.FC = () => {
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [templateOwnerId, setTemplateOwnerId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [userVotes, setUserVotes] = useState<{ [key: string]: number }>({});
  const [actualUserId, setActualUserId] = useState<string>("");
  const [tempUserId, setTempUserId] = useState<string>("");
  const router = useRouter();
  const { roomId } = router.query;

  useEffect(() => {
    const storedUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
    const storedTempUserId = typeof window !== "undefined" ? localStorage.getItem("temp_user_id") : null;

    const userId = storedUserId || uuidv4();
    const tempId = storedTempUserId || uuidv4();

    if (typeof window !== "undefined") {
      localStorage.setItem("user_id", userId);
      localStorage.setItem("temp_user_id", tempId);
    }

    setActualUserId(userId);
    setTempUserId(tempId);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setActualUserId(user.uid);
        localStorage.setItem("user_id", user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (roomId && typeof roomId === "string") {
      fetchRoomData(roomId, setTemplateOwnerId, setSteps, setIsActive, fetchComments, setComments);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId && typeof roomId === "string") {
      initializeSnapshot(roomId, setIsFinalized, setIsActive);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId && typeof roomId === "string" && actualUserId) {
      fetchUserVotes(roomId, actualUserId, setUserVotes, setTotalVotes);
    }
  }, [roomId, actualUserId]);

  return (
    <div>
      <StepList
        steps={steps}
        comments={comments}
        isActive={isActive}
        newComments={newComments}
        setNewComments={setNewComments}
        tempUserId={tempUserId}
        actualUserId={actualUserId}
        socket={socket}
        roomId={roomId as string}
        userVotes={userVotes}
        setComments={setComments}
        setUserVotes={setUserVotes}
      />
      <FinalizeButton
        templateOwnerId={templateOwnerId}
        actualUserId={actualUserId}
        isActive={isActive}
        setIsActive={setIsActive}
        setIsFinalized={setIsFinalized}
        roomId={roomId as string}
      />
    </div>
  );
};

export default Room;
