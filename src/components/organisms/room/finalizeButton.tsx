import React from "react";
import { finalizeComments } from "./utils";
import Buttons from "@/components/atoms/buttons/button";

interface FinalizeButtonProps {
  templateOwnerId: string | null;
  actualUserId: string;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFinished: React.Dispatch<React.SetStateAction<boolean>>; // isFinished durumunu ayarlamak için
  roomId: string;
}

const FinalizeButton: React.FC<FinalizeButtonProps> = ({
  templateOwnerId,
  actualUserId,
  isActive,
  setIsActive,
  setIsFinished,
  roomId,
}) => {
  const handleFinalize = () => {
    finalizeComments(roomId, (isActive) => {
      setIsActive(isActive);
      if (!isActive) {
        setIsFinished(false); // isFinished'ı false yaparak 2. aşamaya geçmesini sağlıyoruz
      }
    }, setIsFinished);
  };

  return (
    <>
      {templateOwnerId === actualUserId && isActive && (
        <Buttons text="Finished" onClick={handleFinalize} />
      )}
    </>
  );
};

export default FinalizeButton;
