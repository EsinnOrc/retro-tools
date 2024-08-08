import React from "react";
import { Table, Button, Space } from "antd";
import { TableProps } from "antd";
import { Room } from "@/types/dashboard";
import { useRouter } from "next/router";

interface RoomTableProps extends TableProps<Room> {
  data: Room[];
}

const RoomTable: React.FC<RoomTableProps> = ({ data, ...props }) => {
  const router = useRouter();

  const handleExport = (room: Room) => {
    console.log("Exporting room:", room);
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
