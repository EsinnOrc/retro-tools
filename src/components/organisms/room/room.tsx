import React, { useState, useEffect } from "react";
import { Steps, Button, message } from "antd";
import { useRouter } from "next/router";
import io from "socket.io-client";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import StepList from "./stepList";
import FinalizeButton from "./finalizeButton";
import FinalizeGroupingButton from "./FinalizeGroupingButton";
import {
  fetchComments,
  fetchRoomData,
  initializeSnapshot,
  fetchUserVotes,
} from "./utils";
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
  const [commentGroups, setCommentGroups] = useState<{
    [key: string]: string[];
  }>({});
  const [groupLikes, setGroupLikes] = useState<{ [key: string]: number }>({});
  const [groupDislikes, setGroupDislikes] = useState<{ [key: string]: number }>(
    {}
  );

  const [currentStep, setCurrentStep] = useState(0);

  const router = useRouter();
  const { roomId } = router.query;

  useEffect(() => {
    const storedUserId =
      typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
    const storedTempUserId =
      typeof window !== "undefined"
        ? localStorage.getItem("temp_user_id")
        : null;

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
      fetchRoomData(
        roomId,
        setTemplateOwnerId,
        setSteps,
        setIsActive,
        fetchComments,
        setComments,
        setCommentGroups,
        setGroupLikes,
        setGroupDislikes
      );
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

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(1);
    }
  }, [isActive]);

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const stepsContent = [
    {
      title: "Yorum Yapma",
      content: (
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
      ),
    },
    {
      title: "Gruplama ve Oylama",
      content: (
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
          <FinalizeGroupingButton
            initialTemplateOwnerId={templateOwnerId}
            actualUserId={actualUserId}
            roomId={roomId as string}
            onFinalize={next}
          />
        </div>
      ),
    },
    {
      title: "Toplantı Notları",
      content: (
        <div>
          <h3>En Çok Oy Alan Yorumlar</h3>

          <h3>Toplantı Notları</h3>
          <textarea
            placeholder="Toplantı notlarını buraya yazın..."
            style={{ width: "100%", height: "200px" }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Steps current={currentStep}>
        {stepsContent.map((item) => (
          <Steps.Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div style={{ marginTop: 24 }}>{stepsContent[currentStep].content}</div>
      <div style={{ marginTop: 24 }}>
        {currentStep === stepsContent.length - 1 && (
          <Button
            type="primary"
            onClick={() => message.success("Tüm adımlar tamamlandı!")}
          >
            Export
          </Button>
        )}
      </div>
    </div>
  );
};

export default Room;
