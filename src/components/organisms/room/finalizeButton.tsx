import React from "react";
import { finalizeComments } from "./utils";
import Buttons from "@/components/atoms/buttons/button";

interface FinalizeButtonProps {
  templateOwnerId: string | null;
  actualUserId: string;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFinalized: React.Dispatch<React.SetStateAction<boolean>>;
  roomId: string;
}

const FinalizeButton: React.FC<FinalizeButtonProps> = ({
  templateOwnerId,
  actualUserId,
  isActive,
  setIsActive,
  setIsFinalized,
  roomId,
}) => {
  const handleFinalize = () => {
    finalizeComments(
      roomId,
      (newIsActive) => {
        setIsActive(newIsActive);
        if (!newIsActive) {
          console.log("Finalizing: Setting isFinalized to false");
          setIsFinalized(false);
        }
      },
      setIsFinalized
    );
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
