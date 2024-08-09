import React, { useState, useEffect } from "react";
import { List, Input, Button, message } from "antd";
import { addDoc, collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Buttons from "@/components/atoms/buttons/button";
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

interface RoomTaskProps {
  roomId: string;
}

interface MeetingNote {
  id: string;
  description: string;
  timestamp: Date;
}

const RoomTask: React.FC<RoomTaskProps> = ({ roomId }) => {
  const [description, setDescription] = useState<string>("");
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);

  useEffect(() => {
    if (!roomId) {
      console.error("roomId is undefined. Cannot query Firestore.");
      return;
    }

    const q = query(
      collection(db, "meeting_notes"),
      where("room_id", "==", roomId)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notes: MeetingNote[] = [];
      querySnapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() } as MeetingNote);
      });
      setMeetingNotes(notes);
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleSaveMeetingNote = async () => {
    if (description.trim() === "") {
      message.error("Description cannot be empty");
      return;
    }

    try {
      const meetingNotesRef = collection(db, "meeting_notes");
      await addDoc(meetingNotesRef, {
        room_id: roomId,
        description: description,
        timestamp: new Date(),
      });
      setDescription("");
      message.success("Meeting note saved successfully");
    } catch (error) {
      console.error("Error saving meeting note: ", error);
      message.error("Failed to save meeting note");
    }
  };

  const handleExport = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      const fontBytes = await fetch('/fonts/Roboto-Regular.ttf').then(res => res.arrayBuffer());
      const customFont = await pdfDoc.embedFont(fontBytes);

      let page = pdfDoc.addPage([600, 400]);

      page.setFont(customFont);
      page.setFontSize(16);
      page.drawText('Meeting Notes', {
        x: 50,
        y: 350,
        color: rgb(0, 0, 0),
      });

      page.setFontSize(12);
      page.drawText(`Room ID: ${roomId}`, {
        x: 50,
        y: 320,
      });

      let currentY = 300;

      meetingNotes.forEach((note, index) => {
        page.drawText(`Note ${index + 1}: ${note.description}`, {
          x: 50,
          y: currentY,
        });
        currentY -= 20;
        if (currentY < 50) {
          page = pdfDoc.addPage([600, 400]);
          currentY = 350;
        }
      });

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Room_${roomId}_Meeting_Notes.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (error) {
      console.error("Error exporting meeting notes:", error);
      message.error("Failed to export meeting notes");
    }
  };

  return (
    <div>
      <h3>Meeting Notes</h3>
      <Input.TextArea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter your meeting notes here..."
        rows={4}
      />
      <Buttons
        htmlType="button"
        onClick={handleSaveMeetingNote}
        text="Save Meeting Note"
      ></Buttons>

      <h4 style={{ marginTop: "20px" }}>Notes</h4>
      <List
        dataSource={meetingNotes}
        renderItem={(note) => (
          <List.Item key={note.id}>
            <List.Item.Meta description={note.description} />
          </List.Item>
        )}
      />
      <a href="/room-lists">
      <Buttons  text="For Export"></Buttons></a>
    </div>
  );
};

export default RoomTask;
