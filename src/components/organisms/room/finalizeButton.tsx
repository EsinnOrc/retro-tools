import React from 'react';
import { Button } from "antd";
import Swal from 'sweetalert2';
import { finalizeComments } from "./utils";

interface FinalizeButtonProps {
  templateOwnerId: string | null;
  actualUserId: string;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFinalized: React.Dispatch<React.SetStateAction<boolean>>;
  roomId: string;
}

const FinalizeButton: React.FC<FinalizeButtonProps> = ({ templateOwnerId, actualUserId, isActive, setIsActive, setIsFinalized, roomId }) => (
  <>
    {templateOwnerId === actualUserId && isActive && (
      <Button
        type="default"
        onClick={() => finalizeComments(roomId, setIsActive, setIsFinalized)}
      >
        Sonuçlandır
      </Button>
    )}
  </>
);

export default FinalizeButton;
