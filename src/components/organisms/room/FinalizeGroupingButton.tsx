import React, { useEffect, useState } from "react";
import { Button } from "antd";
import Swal from "sweetalert2";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

interface FinalizeGroupingButtonProps {
  initialTemplateOwnerId: string | null;
  actualUserId: string;
  roomId: string;
}

const FinalizeGroupingButton: React.FC<FinalizeGroupingButtonProps> = ({
  initialTemplateOwnerId,
  actualUserId,
  roomId,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [templateOwnerId, setTemplateOwnerId] = useState<string | null>(initialTemplateOwnerId);

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
            is_finished: false,
          });
          Swal.fire("Sonuçlandırıldı!", "Yorumlar başarıyla sonuçlandırıldı.", "success");
        } catch (error) {
          console.error("Error finalizing grouping:", error);
        }
      }
    });
  };

  return (
    <>
      {templateOwnerId === actualUserId && !isActive && (
        <Button type="default" onClick={handleFinalizeGrouping}>
          Gruplandırmayı ve Oylamayı Sonlandır
        </Button>
      )}
    </>
  );
};

export default FinalizeGroupingButton;
