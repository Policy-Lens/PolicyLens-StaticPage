import { useState, useContext } from "react";
import {
  Typography,
  Card,
  Table,
  Button,
  Modal,
  Input,
  message,
  Space,
  Upload,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { OnboardingContext } from "../../../../../Context/OnboardingContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import readXlsxFile from "read-excel-file";

const { Title, Text } = Typography;

const exampleData = {
  Title: "WorkFromHome",
  DocType: "Policy",
  "YYYY-MM-DD": "2023-12-24",
  "v#": "v1",
};

function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Pass listeners to children so only the handle gets them */}
      {typeof children === "function"
        ? children(listeners, attributes)
        : children}
    </div>
  );
}

const DocumentProtocols = ({
  projectId,
  canEdit,
  onboardingData,
  riskRatingSetup,
  ddpData,
  loadDDPData,
}) => {
  const {
    updateDDPEntry,
    deleteDDPEntry,
    createDDPEntry,
    bulkCreateRecipients,
    deleteRecipient,
    updateDocumentNomenclature,
  } = useContext(OnboardingContext);

  const [editDDPModal, setEditDDPModal] = useState(false);
  const [addClassificationModal, setAddClassificationModal] = useState(false);
  const [editRecipientModal, setEditRecipientModal] = useState(false);
  const [editNomenclatureModal, setEditNomenclatureModal] = useState(false);
  const [viewRecipientsModal, setViewRecipientsModal] = useState(false);
  const [selectedDDP, setSelectedDDP] = useState(null);
  const [loading, setLoading] = useState(false);

  // DDP Edit Form
  const [classification, setClassification] = useState("");
  const [internalDistribution, setInternalDistribution] = useState("");
  const [externalDistribution, setExternalDistribution] = useState("");

  // Recipient Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [uploadedRecipients, setUploadedRecipients] = useState([]);
  const [searchRecipient, setSearchRecipient] = useState("");

  // Nomenclature
  const availableItems = ["Title", "DocType", "YYYY-MM-DD", "v#"];
  const [nomenclatureItems, setNomenclatureItems] = useState(
    riskRatingSetup?.document_nomenclature || [
      "Title",
      "DocType",
      "YYYY-MM-DD",
      "v#",
    ]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isReadOnly = onboardingData?.status === "completed";

  const handleEditDDP = (ddp) => {
    setSelectedDDP(ddp);
    setClassification(ddp.classification);
    setInternalDistribution(ddp.internal_distribution);
    setExternalDistribution(ddp.external_distribution);
    setEditDDPModal(true);
  };

  const handleDeleteDDP = async (ddp) => {
    try {
      setLoading(true);
      const result = await deleteDDPEntry(projectId, ddp.id);

      if (result.success) {
        message.success("DDP entry deleted successfully");
        loadDDPData();
      }
    } catch (error) {
      message.error(error.data?.error || "Failed to delete DDP entry");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClassification = async () => {
    if (!classification || !internalDistribution || !externalDistribution) {
      message.warning("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const result = await createDDPEntry(projectId, {
        classification,
        internal_distribution: internalDistribution,
        external_distribution: externalDistribution,
      });

      if (result.success) {
        message.success("Classification added successfully");
        setAddClassificationModal(false);
        setClassification("");
        setInternalDistribution("");
        setExternalDistribution("");
        loadDDPData();
      }
    } catch (error) {
      message.error(error.data?.error || "Failed to add classification");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDDP = async () => {
    try {
      setLoading(true);
      const result = await updateDDPEntry(projectId, selectedDDP.id, {
        classification,
        internal_distribution: internalDistribution,
        external_distribution: externalDistribution,
      });

      if (result.success) {
        message.success("DDP entry updated successfully");
        setEditDDPModal(false);
        loadDDPData();
      }
    } catch (error) {
      message.error(error.data?.error || "Failed to update DDP entry");
    } finally {
      setLoading(false);
    }
  };

  const handleManageRecipients = (ddp) => {
    setSelectedDDP(ddp);
    setUploadedRecipients([]); // Start with empty list for new recipients
    setEmail("");
    setFirstName("");
    setLastName("");
    setSearchRecipient("");
    setEditRecipientModal(true);
  };

  const handleViewRecipients = (ddp) => {
    setSelectedDDP({ ...ddp });
    setViewRecipientsModal(true);
  };

  const handleDeleteRecipientFromView = async (recipientId) => {
    try {
      const result = await deleteRecipient(projectId, recipientId);
      if (result.success) {
        message.success("Recipient deleted");
        // Update the selectedDDP state to remove the deleted recipient
        setSelectedDDP((prev) => ({
          ...prev,
          recipients: prev.recipients.filter((r) => r.id !== recipientId),
        }));
        // Also reload the main data
        await loadDDPData();
      }
    } catch (error) {
      message.error("Failed to delete recipient");
    }
  };

  const handleAddRecipient = () => {
    if (!email) {
      message.warning("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      message.error("Please enter a valid email address");
      return;
    }

    // Check for duplicate emails
    if (uploadedRecipients.some((r) => r.email === email)) {
      message.warning("This email is already in the list");
      return;
    }

    const newRecipient = {
      email,
      first_name: firstName,
      last_name: lastName,
      temp_id: Date.now(),
    };

    setUploadedRecipients([...uploadedRecipients, newRecipient]);
    setEmail("");
    setFirstName("");
    setLastName("");
  };

  const handleFileUpload = (file) => {
    readXlsxFile(file)
      .then((rows) => {
        if (rows.length === 0) {
          message.error("File is empty");
          return;
        }

        // First row should be headers
        const headers = rows[0].map((h) => String(h).toLowerCase().trim());
        const emailIndex = headers.findIndex((h) => h.includes("email"));
        const firstNameIndex = headers.findIndex(
          (h) => h.includes("first") && h.includes("name")
        );
        const lastNameIndex = headers.findIndex(
          (h) => h.includes("last") && h.includes("name")
        );

        if (emailIndex === -1) {
          message.error("Excel file must have an 'email' column");
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Parse data rows
        const recipients = rows
          .slice(1)
          .map((row, index) => ({
            email: row[emailIndex] ? String(row[emailIndex]).trim() : "",
            first_name:
              firstNameIndex !== -1 && row[firstNameIndex]
                ? String(row[firstNameIndex]).trim()
                : "",
            last_name:
              lastNameIndex !== -1 && row[lastNameIndex]
                ? String(row[lastNameIndex]).trim()
                : "",
            temp_id: Date.now() + index,
          }))
          .filter((r) => r.email && emailRegex.test(r.email));
        if (recipients.length === 0) {
          message.error("No valid email addresses found in the file");
          return;
        }

        setUploadedRecipients([...uploadedRecipients, ...recipients]);
        message.success(`${recipients.length} recipients imported`);
      })
      .catch((error) => {
        console.error("Excel parse error:", error);
        message.error("Failed to parse Excel file. Please check the format.");
      });

    return false;
  };

  const handleRemoveFromPreview = (recipient) => {
    setUploadedRecipients(
      uploadedRecipients.filter((r) => r.temp_id !== recipient.temp_id)
    );
  };

  const handleSaveRecipients = async () => {
    if (uploadedRecipients.length === 0) {
      message.info("No recipients to save");
      setEditRecipientModal(false);
      return;
    }

    try {
      setLoading(true);
      const result = await bulkCreateRecipients(
        projectId,
        selectedDDP.id,
        uploadedRecipients.map((r) => ({
          email: r.email,
          first_name: r.first_name || "",
          last_name: r.last_name || "",
        }))
      );

      if (result.success) {
        message.success("Recipients saved successfully");
        setEditRecipientModal(false);
        setUploadedRecipients([]);
        loadDDPData();
      }
    } catch (error) {
      message.error(error.data?.error || "Failed to save recipients");
    } finally {
      setLoading(false);
    }
  };

  const handleEditNomenclature = () => {
    setNomenclatureItems(
      riskRatingSetup?.document_nomenclature || [
        "Title",
        "DocType",
        "YYYY-MM-DD",
        "v#",
      ]
    );
    setEditNomenclatureModal(true);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setNomenclatureItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddNomenclatureItem = (item) => {
    if (!nomenclatureItems.includes(item)) {
      setNomenclatureItems([...nomenclatureItems, item]);
    }
  };

  const handleRemoveNomenclatureItem = (item, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    console.log("item", item);
    if (nomenclatureItems.length > 1) {
      setNomenclatureItems(nomenclatureItems.filter((i) => i !== item));
    } else {
      message.warning("At least one item must be selected");
    }
  };

  const handleSaveNomenclature = async () => {
    try {
      setLoading(true);
      const result = await updateDocumentNomenclature(
        projectId,
        nomenclatureItems
      );

      if (result.success) {
        message.success("Document nomenclature updated successfully");
        setEditNomenclatureModal(false);
      }
    } catch (error) {
      message.error(error.data?.error || "Failed to update nomenclature");
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = () => {
    return nomenclatureItems.join("_");
  };

  const ddpColumns = [
    {
      title: "Classification",
      dataIndex: "classification",
      key: "classification",
    },
    {
      title: "Internal Distribution",
      dataIndex: "internal_distribution",
      key: "internal_distribution",
    },
    {
      title: "External Distribution",
      dataIndex: "external_distribution",
      key: "external_distribution",
    },
    {
      title: "Recipient List",
      key: "recipients",
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewRecipients(record)}>
          {record.recipients?.length || 0} Recipients
        </Button>
      ),
    },
    ...(canEdit && !isReadOnly
      ? [
          {
            title: "Action",
            key: "action",
            render: (_, record) => (
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEditDDP(record)}
                >
                  Edit
                </Button>
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={() => handleManageRecipients(record)}
                >
                  Add Recipients
                </Button>
                <Popconfirm
                  title="Delete this distribution protocol?"
                  description="This action cannot be undone."
                  onConfirm={() => handleDeleteDDP(record)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const filteredRecipients = uploadedRecipients.filter(
    (r) =>
      r.email.toLowerCase().includes(searchRecipient.toLowerCase()) ||
      r.first_name?.toLowerCase().includes(searchRecipient.toLowerCase()) ||
      r.last_name?.toLowerCase().includes(searchRecipient.toLowerCase())
  );

  return (
    <div>
      {/* Document Distribution Protocols */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Document Distribution Protocols
            </Title>
            <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
              Set rules for how documents are shared based on their
              classification level.
            </Text>
          </div>
          {canEdit && !isReadOnly && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddClassificationModal(true)}
            >
              Add Classification
            </Button>
          )}
        </div>

        <Table
          dataSource={ddpData}
          columns={ddpColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Document Nomenclature */}
      <Card style={{ marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Document Nomenclature
          </Title>
          {canEdit && !isReadOnly && (
            <Button type="primary" onClick={handleEditNomenclature}>
              Edit Structure
            </Button>
          )}
        </div>

        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Establish a consistent naming convention for documents to ensure
          clarity and organization.
        </Text>

        <div style={{ marginBottom: 16 }}>
          <Text strong>Define the structure for document filenames:</Text>
          <div
            style={{
              marginTop: 12,
              padding: 16,
              background: "#f5f5f5",
              borderRadius: 4,
              fontFamily: "monospace",
              color: "#1890ff",
            }}
          >
            {generatePreview()}
          </div>
        </div>

        <div>
          <Text strong>Example:</Text>
          <div style={{ marginTop: 8, color: "#666" }}>
            {
              riskRatingSetup.document_nomenclature
                .map((i) => exampleData[i])
                .join("_")}
          </div>
        </div>
      </Card>

      {/* Edit DDP Modal */}
      <Modal
        title="Edit Distribution Protocol"
        open={editDDPModal}
        onOk={handleSaveDDP}
        onCancel={() => setEditDDPModal(false)}
        confirmLoading={loading}
        okText="Save"
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Text strong>Classification</Text>
            <Input
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              placeholder="e.g., Public, Confidential"
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>Internal Distribution</Text>
            <Input
              value={internalDistribution}
              onChange={(e) => setInternalDistribution(e.target.value)}
              placeholder="e.g., All Employees"
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>External Distribution</Text>
            <Input
              value={externalDistribution}
              onChange={(e) => setExternalDistribution(e.target.value)}
              placeholder="e.g., Prohibited"
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>

      {/* Add Classification Modal */}
      <Modal
        title="Add New Classification"
        open={addClassificationModal}
        onOk={handleAddClassification}
        onCancel={() => {
          setAddClassificationModal(false);
          setClassification("");
          setInternalDistribution("");
          setExternalDistribution("");
        }}
        confirmLoading={loading}
        okText="Add"
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Text strong>Classification</Text>
            <Input
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              placeholder="e.g., Public, Confidential"
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>Internal Distribution</Text>
            <Input
              value={internalDistribution}
              onChange={(e) => setInternalDistribution(e.target.value)}
              placeholder="e.g., All Employees"
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>External Distribution</Text>
            <Input
              value={externalDistribution}
              onChange={(e) => setExternalDistribution(e.target.value)}
              placeholder="e.g., Prohibited"
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>

      {/* View Recipients Modal */}
      <Modal
        title={`Recipients - ${selectedDDP?.classification}`}
        open={viewRecipientsModal}
        onCancel={() => {
          setViewRecipientsModal(false);
          setSelectedDDP(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setViewRecipientsModal(false);
              setSelectedDDP(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={600}
      >
        <div
          style={{
            maxHeight: 400,
            overflowY: "auto",
            border: "1px solid #d9d9d9",
            borderRadius: 4,
            padding: 8,
          }}
        >
          {selectedDDP?.recipients?.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
              No recipients added yet
            </div>
          ) : (
            selectedDDP?.recipients?.map((recipient) => (
              <div
                key={recipient.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div>
                  <Text>
                    {recipient.email}
                    {(recipient.first_name || recipient.last_name) && (
                      <Text type="secondary">
                        {" "}
                        -{" "}
                        {`${recipient.first_name} ${recipient.last_name}`.trim()}
                      </Text>
                    )}
                  </Text>
                </div>
                {canEdit && !isReadOnly && (
                  <Popconfirm
                    title="Delete recipient?"
                    onConfirm={() =>
                      handleDeleteRecipientFromView(recipient.id)
                    }
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Manage Recipients Modal - Add New Recipients */}
      <Modal
        title="Add Recipients"
        open={editRecipientModal}
        onOk={handleSaveRecipients}
        onCancel={() => {
          setEditRecipientModal(false);
          setUploadedRecipients([]);
        }}
        confirmLoading={loading}
        okText="Save"
        width={700}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="medium">
          {/* Upload Template */}
          <div>
            <Text strong>Upload Template</Text>
            <Text
              type="secondary"
              style={{ display: "block", marginTop: 4, marginBottom: 12 }}
            >
              For bulk imports, please use a .csv or .xlsx file with columns for
              first name, last name, and email.
            </Text>
            <Upload
              beforeUpload={handleFileUpload}
              accept=".csv,.xlsx,.xls"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Upload CSV or Excel</Button>
            </Upload>
          </div>

          <div style={{ textAlign: "center", color: "#999" }}>OR</div>

          {/* Add Single Email */}
          <div>
            <Text strong>Add Single Email</Text>
            <Space style={{ width: "100%", marginTop: 8 }} direction="vertical">
              <Space style={{ width: "100%" }}>
                <Input
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ width: 150 }}
                />
                <Input
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ width: 150 }}
                />
                {/* </Space>
              <Space style={{ width: "100%" }}> */}
                <Input
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: 250 }}
                  onPressEnter={handleAddRecipient}
                  type="email"
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddRecipient}
                >
                  Add
                </Button>
              </Space>
            </Space>
          </div>

          {/* Preview of Recipients to be Added */}
          {uploadedRecipients.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                  marginTop: 14,
                }}
              >
                <Text strong>
                  Recipients to be Added ({uploadedRecipients.length})
                </Text>
                <Input
                  placeholder="Search recipients..."
                  value={searchRecipient}
                  onChange={(e) => setSearchRecipient(e.target.value)}
                  style={{ width: 250 }}
                />
              </div>

              <div
                style={{
                  maxHeight: 300,
                  overflowY: "auto",
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  padding: 8,
                  background: "#fafafa",
                }}
              >
                {filteredRecipients.map((recipient) => (
                  <div
                    key={recipient.temp_id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderBottom: "1px solid #f0f0f0",
                      background: "#fff",
                      marginBottom: 4,
                      borderRadius: 4,
                    }}
                  >
                    <div>
                      <Text>
                        {recipient.email}
                        {(recipient.first_name || recipient.last_name) && (
                          <Text type="secondary">
                            {" "}
                            -{" "}
                            {`${recipient.first_name} ${recipient.last_name}`.trim()}
                          </Text>
                        )}
                      </Text>
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => handleRemoveFromPreview(recipient)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Space>
      </Modal>

      {/* Edit Nomenclature Modal */}
      <Modal
        title="Edit Nomenclature Structure"
        open={editNomenclatureModal}
        onOk={handleSaveNomenclature}
        onCancel={() => setEditNomenclatureModal(false)}
        confirmLoading={loading}
        okText="Save"
        width={700}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Text type="secondary">
            Drag and drop components to re-arrange the filename structure. Use
            the underscore to add a separator.
          </Text>

          <div>
            <Text strong>Current Structure Preview:</Text>
            <div
              style={{
                marginTop: 8,
                padding: 12,
                background: "#e6f7ff",
                borderRadius: 4,
                fontFamily: "monospace",
                color: "#1890ff",
                fontSize: 16,
              }}
            >
              {generatePreview()}
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={nomenclatureItems}
              strategy={verticalListSortingStrategy}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {nomenclatureItems.map((item) => (
                  <SortableItem key={item} id={item}>
                    {(listeners, attributes) => (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 16px",
                          background: "#fafafa",
                          border: "1px solid #d9d9d9",
                          borderRadius: 4,
                        }}
                      >
                        <Space>
                          {/* ONLY the handle gets the drag listeners */}
                          <span
                            {...listeners}
                            {...attributes}
                            style={{
                              fontSize: 18,
                              cursor: "move",
                              padding: "0 8px",
                            }}
                          >
                            ☰
                          </span>
                          <Text strong>{item}</Text>
                          {item === "YYYY-MM-DD" && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              (Date)
                            </Text>
                          )}
                          {item === "v#" && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              (Version)
                            </Text>
                          )}
                        </Space>
                        {nomenclatureItems.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveNomenclatureItem(item);
                            }}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    )}
                  </SortableItem>
                ))}
              </Space>
            </SortableContext>
          </DndContext>

          <div>
            <Text strong>Select More Items:</Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {availableItems
                  .filter((item) => !nomenclatureItems.includes(item))
                  .map((item) => (
                    <Button
                      key={item}
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddNomenclatureItem(item)}
                    >
                      {item}
                    </Button>
                  ))}
              </Space>
            </div>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default DocumentProtocols;
