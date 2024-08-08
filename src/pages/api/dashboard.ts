import { getDocs, query, collection, where, addDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Template, Room } from "@/types/dashboard";

export const fetchTemplates = async (userId: string): Promise<Template[]> => {
  const templatesQuery = query(
    collection(db, "templates"),
    where("user_id", "==", userId)
  );
  const templatesSnapshot = await getDocs(templatesQuery);
  return templatesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Template[];
};

export const createRoom = async (templateId: string) => {
  const roomRef = await addDoc(collection(db, "rooms"), {
    template_id: templateId,
    is_active: true,
    created_at: new Date(),
  });
  return roomRef.id;
};

export const fetchUserRooms = async (
  userId: string
): Promise<(Room & { templateName: string })[]> => {
  const templatesQuery = query(
    collection(db, "templates"),
    where("user_id", "==", userId)
  );
  const templatesSnapshot = await getDocs(templatesQuery);
  const templates = templatesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Template[];

  if (templates.length === 0) {
    return [];
  }

  const templateIds = templates.map((template) => template.id);
  const rooms: (Room & { templateName: string })[] = [];
  const maxBatchSize = 10;

  for (let i = 0; i < templateIds.length; i += maxBatchSize) {
    const batch = templateIds.slice(i, i + maxBatchSize);
    const roomsQuery = query(
      collection(db, "rooms"),
      where("template_id", "in", batch)
    );
    const roomsSnapshot = await getDocs(roomsQuery);
    roomsSnapshot.docs.forEach((doc) => {
      const roomData = doc.data() as Room;
      const template = templates.find((t) => t.id === roomData.template_id);
      rooms.push({
        ...roomData,
        id: doc.id,
        templateName: template ? template.name : "Unknown",
      });
    });
  }

  return rooms;
};
