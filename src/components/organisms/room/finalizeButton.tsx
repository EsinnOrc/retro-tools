import React from 'react';
import { Button } from "antd";
import { finalizeComments } from "./utils";

interface FinalizeButtonProps {
  templateOwnerId: string | null;
  actualUserId: string;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFinalized: React.Dispatch<React.SetStateAction<boolean>>;
  roomId: string;
}

const FinalizeButton: React.FC<FinalizeButtonProps> = ({ templateOwnerId, actualUserId, isActive, setIsActive, setIsFinalized, roomId }) => {
  const handleFinalize = () => {
    finalizeComments(roomId, setIsActive, setIsFinalized);
  };

  return (
    <>
      {templateOwnerId === actualUserId && isActive && (
        <Button
          type="default"
          onClick={handleFinalize}
        >
          Sonuçlandır
        </Button>
      )}
    </>
  );
};

export default FinalizeButton;
