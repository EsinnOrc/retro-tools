import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { useRouter } from "next/router";
import { message } from "antd";
import { fetchTemplates, createRoom } from "@/pages/api/dashboard";
import { Template, Step } from "@/types/dashboard";
import CardGroup from "@/components/molecules/cardGroup/cardGroup";
import Pagination from "@/components/atoms/pagination/pagination";
import Layout from "@/components/organisms/layout/layout";
import styles from "@/styles/dashboard.module.scss";

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
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
      const fetchUserTemplates = async () => {
        try {
          const templatesList = await fetchTemplates(user.uid);
          setTemplates(templatesList);
          console.log(templatesList);
        } catch (error) {
          console.error("Error fetching templates:", error);
        }
      };

      fetchUserTemplates();
    }
  }, [user]);

  const handleCreateRoom = async (templateId: string) => {
    try {
      const roomId = await createRoom(templateId);
      message.success("Room created successfully");
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      message.error("Failed to create room");
    }
  };

  if (!user) {
    return null;
  }

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTemplates = templates.slice(startIndex, startIndex + pageSize);

  const cardData = paginatedTemplates.map((template) => ({
    title: template.name,
    description: "Description for " + template.name,
    steps: template.step_names
      ? template.step_names.map((step: Step) => step.name)
      : [],
    buttonText: "Create Room",
    onButtonClick: () => handleCreateRoom(template.id),
  }));

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Layout user={user} collapsed={collapsed} toggleSidebar={toggleSidebar}>
      <div className={styles.dashboardContainer}>
        <h2>Create a New Template</h2>

        <CardGroup cards={cardData} />
        {templates.length > pageSize && (
          <Pagination
            total={templates.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
