import React from "react";
import { Table, Button, Space, message } from "antd";
import { TableProps } from "antd";
import { Room } from "@/types/dashboard";
import { useRouter } from "next/router";
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

interface RoomTableProps extends TableProps<Room> {
  data: Room[];
}

const RoomTable: React.FC<RoomTableProps> = ({ data, ...props }) => {
  const router = useRouter();

  const fetchRoomData = async (roomId: string) => {
    try {
      if (!roomId) {
        throw new Error("Invalid roomId");
      }

      const roomRef = doc(db, "rooms", roomId);
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        console.error("No such room!");
        return null;
      }

      const roomData = roomDoc.data();

      const templateId = roomData.template_id;
      const templateRef = doc(db, "templates", templateId);
      const templateDoc = await getDoc(templateRef);

      if (!templateDoc.exists()) {
        console.error("No such template!");
        return null;
      }

      const templateData = templateDoc.data();

      const stepsList = templateData.step_names.map((step: any) => ({
        id: step.id,
        name: step.name,
      }));

      const commentsQuery = query(collection(db, "comments"), where("room_id", "==", roomId));
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData: any = {};

      commentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!commentsData[data.step_id]) {
          commentsData[data.step_id] = [];
        }
        commentsData[data.step_id].push({
          ...data,
        });
      });

      return {
        templateId,
        isActive: roomData.is_active,
        steps: stepsList,
        comments: commentsData,
      };
    } catch (error) {
      console.error("Error fetching room data:", error);
      return null;
    }
  };

  const handleExport = async (room: Room) => {
    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
  
      const fontBytes = await fetch('/fonts/Roboto-Regular.ttf').then(res => res.arrayBuffer());
      const customFont = await pdfDoc.embedFont(fontBytes);
  
      const page = pdfDoc.addPage([600, 400]);
  
      page.setFont(customFont);
      page.setFontSize(16);
      page.drawText('Oda Detayları', {
        x: 50,
        y: 350,
        color: rgb(0, 0, 0),
      });
  
      page.setFontSize(12);
      page.drawText(`- Şablon Adı: ${room.templateName}`, {
        x: 50,
        y: 320,
      });
      page.drawText(`- Durum: ${room.is_active ? "Aktif" : "Pasif"}`, {
        x: 50,
        y: 300,
      });
      page.drawText(`- Oluşturulma Tarihi: ${new Date(room.created_at.seconds * 1000).toLocaleDateString()}`, {
        x: 50,
        y: 280,
      });
  
      let currentY = 240;

      const roomData = await fetchRoomData(room.id);
  
      if (!roomData) {
        throw new Error("Room data could not be fetched");
      }
  
      const { steps, comments } = roomData;
  
      steps.forEach((step: any) => {
        page.setFontSize(14);
        page.drawText(`Adım: ${step.name}`, {
          x: 50,
          y: currentY,
        });
        currentY -= 30; 
  
        page.setFontSize(12);
        const stepComments = comments[step.id];
        if (stepComments && stepComments.length > 0) {
          stepComments.forEach((comment: any) => {
            page.drawText(`• ${comment.message}`, {
              x: 70,
              y: currentY,
            });
            currentY -= 20;
          });
        } else {
          page.drawText("• Bu adım için yorum bulunmamaktadır.", {
            x: 70,
            y: currentY,
          });
          currentY -= 20;
        }
  
        currentY -= 30;
      });
  
      const pdfBytes = await pdfDoc.save();
  
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Oda_${room.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
    } catch (error) {
      console.error("Error exporting room data:", error);
      message.error("Oda verileri dışa aktarılırken bir hata oluştu");
    }
  };

  const columns = [
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (isActive ? "Active" : "Inactive"),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (createdAt: { seconds: number }) =>
        new Date(createdAt.seconds * 1000).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, room: Room) => (
        <Space size="middle">
          <Button onClick={() => handleExport(room)}>Export</Button>
          <Button type="link" onClick={() => router.push(`/room/${room.id}`)}>
            View Room
          </Button>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" {...props} />;
};

export default RoomTable;
