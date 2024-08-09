import React from "react";
import { finalizeComments } from "./utils";
import Buttons from "@/components/atoms/buttons/button";

interface FinalizeButtonProps {
  templateOwnerId: string | null;
  actualUserId: string;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
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
        setIsFinished(false);
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
