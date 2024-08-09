import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Buttons from "@/components/atoms/buttons/button";

interface FinalizeGroupingButtonProps {
  initialTemplateOwnerId: string | null;

  actualUserId: string;
  roomId: string;
  onFinalize: () => void;
}

const FinalizeGroupingButton: React.FC<FinalizeGroupingButtonProps> = ({
  initialTemplateOwnerId,
  actualUserId,
  roomId,
  onFinalize,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [templateOwnerId, setTemplateOwnerId] = useState<string | null>(
    initialTemplateOwnerId
  );

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

          if (!initialTemplateOwnerId) {
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
  }, [roomId, initialTemplateOwnerId]);

  const handleFinalizeGrouping = async () => {
    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu işlemi geri alamazsınız!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Evet, sonuçlandır!",
      cancelButtonText: "Hayır, iptal et",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const roomRef = doc(db, "rooms", roomId);
          await updateDoc(roomRef, {
            is_finished: true,
          });
          Swal.fire(
            "Sonuçlandırıldı!",
            "Yorumlar başarıyla sonuçlandırıldı.",
            "success"
          );
          onFinalize();
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
          text="Gruplandırmayı ve Oylamayı Sonlandır"
        />
      )}
    </>
  );
};

export default FinalizeGroupingButton;
