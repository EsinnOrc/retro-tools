import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Buttons from "@/components/atoms/buttons/button";

interface FinalizeGroupingButtonProps {
  isFinalized: boolean;
  templateOwnerId: string | null;
  setTemplateOwnerId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFinalized: React.Dispatch<React.SetStateAction<boolean>>;
  actualUserId: string;
  roomId: string;
  onFinalize: () => void;
}

const FinalizeGroupingButton: React.FC<FinalizeGroupingButtonProps> = ({
  templateOwnerId,
  actualUserId,
  roomId,
  onFinalize,
  setIsFinalized,
  isFinalized,
  setTemplateOwnerId,
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (typeof roomId !== "string" || !roomId) {
        return;
      }

      try {
        const roomRef = doc(db, "rooms", roomId);
        const roomDoc = await getDoc(roomRef);

        if (roomDoc.exists()) {
          const roomData = roomDoc.data();
          setIsActive(roomData.is_active);

          if (!templateOwnerId) {
            const templateRef = doc(db, "templates", roomData.template_id);
            const templateDoc = await getDoc(templateRef);

            if (templateDoc.exists()) {
              const templateData = templateDoc.data();
              setTemplateOwnerId(templateData.user_id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
    };

    fetchRoomDetails();
  }, [roomId, templateOwnerId]);

  const handleFinalizeGrouping = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You cannot undo this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#219ebc",
      cancelButtonColor: "rgba(99, 99, 99, 0.5) ",
      confirmButtonText: "Yes, finalize!",
      cancelButtonText: " No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const roomRef = doc(db, "rooms", roomId);
          await updateDoc(roomRef, {
            is_finished: true,
            is_finalized: true,
          });
          if (!isFinalized) {
            setIsFinalized(true);
          }
          Swal.fire(
            "Concluded!",
            "Comments concluded successfully.",
            "success"
          );
          onFinalize(); // This will trigger the next step
        } catch (error) {
          console.error("Error finalizing grouping:", error);
        }
      }
    });
  };

  return (
    <>
      {templateOwnerId === actualUserId && !isActive && (
        <Buttons
          htmlType="button"
          onClick={handleFinalizeGrouping}
          text="End Grouping and Voting"
        />
      )}
    </>
  );
};

export default FinalizeGroupingButton;
