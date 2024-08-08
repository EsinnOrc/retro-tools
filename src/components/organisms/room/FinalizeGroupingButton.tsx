import React, { useEffect, useState } from "react";
import { Button } from "antd";
import Swal from "sweetalert2";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

interface FinalizeGroupingButtonProps {
  templateOwnerId: string | null;
  actualUserId: string;
  roomId: string;
}

const FinalizeGroupingButton: React.FC<FinalizeGroupingButtonProps> = ({
  templateOwnerId,
  actualUserId,
  roomId,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

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
          if (!roomData.is_active) {
            setIsActive(roomData.is_active);
            setIsFinished(roomData.is_finished);
          }
        }
      } catch (error) {
        // Hata yönetimi
      }
    };

    fetchRoomDetails();
  }, [roomId]);

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
          setIsFinished(false);
          Swal.fire("Sonuçlandırıldı!", "Yorumlar başarıyla sonuçlandırıldı.", "success");
        } catch (error) {
          // Hata yönetimi
        }
      }
    });
  };

  return (
    <>
      {templateOwnerId === actualUserId && isFinished && !isActive && (
        <Button type="default" onClick={handleFinalizeGrouping}>
          Gruplandırmayı ve Oylamayı Sonlandır
        </Button>
      )}
    </>
  );
};

export default FinalizeGroupingButton;
