import React, { useState } from "react";
import {
  Button,
  Card,
  Modal,
  Input,
  Select,
  List,
  Avatar,
  Tag,
  Menu,
} from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  SettingOutlined,
  MessageOutlined,
  ProjectOutlined,
  TeamOutlined,
  BankOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const ConsultantTeam = () => {
  const [teams, setTeams] = useState([
    {
      name: "Team Alpha",
      members: [
        { name: "Alice", role: "Consultant" },
        { name: "Bob", role: "Consultant" },
        { name: "Charlie", role: "Auditor" },
        { name: "Diana", role: "Auditor" },
      ],
      project: "Project A",
    },
    {
      name: "Team Beta",
      members: [
        { name: "Eve", role: "Consultant" },
        { name: "Frank", role: "Consultant" },
        { name: "Grace", role: "Auditor" },
        { name: "Hank", role: "Auditor" },
      ],
      project: "Project B",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newProject, setNewProject] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const membersList = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Eve",
    "Frank",
    "Grace",
    "Hank",
  ];

  const roles = ["Consultant", "Auditor"];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setNewTeamName("");
    setNewProject("");
    setSelectedMembers([]);
  };

  const handleCreateTeam = () => {
    if (newTeamName && newProject && selectedMembers.length > 0) {
      const membersWithRoles = selectedMembers.map((member) => {
        const [name, role] = member.split("-");
        return { name, role };
      });

      const newTeam = {
        name: newTeamName,
        members: membersWithRoles,
        project: newProject,
      };

      setTeams([...teams, newTeam]);
      handleCancel();
    }
  };

  const topMenuItems = [
    { key: "dashboard", label: "Dashboard", icon: <HomeOutlined /> },
    { key: "projects", label: "Projects", icon: <ProjectOutlined /> },
    { key: "company", label: "Company", icon: <BankOutlined /> },
    { key: "auditors", label: "Consultant Team", icon: <TeamOutlined /> },
    { key: "documents", label: "Documents", icon: <FileTextOutlined /> },
    { key: "messages", label: "Messages", icon: <MessageOutlined /> },
    { key: "settings", label: "Settings", icon: <SettingOutlined /> },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <div className="bg-white shadow p-4">
        <Menu
          mode="horizontal"
          items={topMenuItems.map(({ key, label, icon }) => ({
            key,
            label,
            icon,
          }))}
          className="flex justify-between hover:shadow-lg transition duration-200"
        />
      </div>

      {/* Main Content */}
      <div className="p-8 bg-gray-50 flex-grow">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Consultant Teams
        </h1>

        {/* Sample Teams */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {teams.map((team, index) => (
            <Card
              key={index}
              title={team.name}
              extra={<Tag color="blue">{team.project}</Tag>}
              className="shadow-md hover:shadow-lg transition"
            >
              <List
                itemLayout="horizontal"
                dataSource={team.members}
                renderItem={(member) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar>{member.name[0]}</Avatar>}
                      title={member.name}
                      description={member.role}
                    />
                  </List.Item>
                )}
              />
            </Card>
          ))}
        </div>

        {/* Create New Team Button */}
        <Button type="primary" onClick={showModal}>
          Create New Team
        </Button>

        {/* Modal for Creating New Team */}
        <Modal
          title="Create New Team"
          visible={isModalVisible}
          onCancel={handleCancel}
          onOk={handleCreateTeam}
          okText="Create Team"
        >
          <Input
            placeholder="Enter team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="mb-4"
          />
          <Input
            placeholder="Assign to project"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            className="mb-4"
          />
          <Select
            mode="multiple"
            placeholder="Select team members and their roles"
            style={{ width: "100%" }}
            value={selectedMembers}
            onChange={setSelectedMembers}
            className="mb-4"
          >
            {membersList.map((member) =>
              roles.map((role) => (
                <Option key={`${member}-${role}`} value={`${member}-${role}`}>
                  {member} ({role})
                </Option>
              ))
            )}
          </Select>
        </Modal>
      </div>
    </div>
  );
};

export default ConsultantTeam;
