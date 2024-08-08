import React, { useState, useEffect } from "react";
import { message } from "antd";
import { fetchUserRooms } from "@/pages/api/dashboard";
import { Room } from "@/types/dashboard";
import { useRouter } from "next/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import RoomTable from "@/components/molecules/roomTable/roomTable";

const RoomList: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      const fetchUserRoomsList = async () => {
        try {
          const roomsList = await fetchUserRooms(user.uid);
          console.log("Fetched Rooms: ", roomsList);
          setRooms(roomsList);
        } catch (error) {
          console.error("Error fetching rooms:", error);
          message.error("Error fetching rooms");
        }
      };

      fetchUserRoomsList();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return <RoomTable data={rooms} />;
};

export default RoomList;
