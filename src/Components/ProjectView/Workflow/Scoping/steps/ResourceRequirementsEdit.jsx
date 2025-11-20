import React, { useState, useContext, useMemo } from "react";
import {
  Button,
  Space,
  InputNumber,
  Input,
  Select,
  Modal,
  Table,
  message,
  Checkbox,
  Typography,
  Form,
} from "antd";
const { Text } = Typography;
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  UndoOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import { ScopingContext } from "../../../../../Context/ScopingContext";

const ResourceRequirementsEdit = ({
  projectId,
  initialData = [],
  onCancel,
  onSave,
}) => {
  const { updateResourceRequirements, getPredefinedRR } =
    useContext(ScopingContext);

  // Initialize tasks with unique keys
  const [tasks, setTasks] = useState(
    initialData.map((item, index) => ({
      ...item,
      key: item.id ? `existing-${item.id}` : `temp-${index}`,
    }))
  );
  const [deleteSet, setDeleteSet] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [predefinedModalVisible, setPredefinedModalVisible] = useState(false);
  const [predefinedTasks, setPredefinedTasks] = useState([]);
  const [selectedPredefined, setSelectedPredefined] = useState([]);
  const [loadingPredefined, setLoadingPredefined] = useState(false);

  // Task edit modal state
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [insertIndex, setInsertIndex] = useState(null);
  const [form] = Form.useForm();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const phaseOptions = [
    { value: "project_onboarding", label: "Project Onboarding" },
    { value: "gap_analysis", label: "Gap Analysis" },
    { value: "organizational_setup", label: "Organizational Setup" },
    { value: "risk_assessment", label: "Risk Assessment" },
    { value: "control_implementation", label: "Control Implementation" },
    { value: "evidence_and_monitoring", label: "Evidence & Monitoring" },
    { value: "internal_audit", label: "Internal Audit" },
    { value: "document_library", label: "Document Library" },
    { value: "sustenance", label: "Sustenance" },
  ];

  // Check if there are changes
  const hasChanges = useMemo(() => {
    if (deleteSet.size > 0) return true;

    if (tasks.length !== initialData.length) return true;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const original = initialData[i];

      if (!original || task.id !== original.id) return true;

      if (
        task.phase !== original.phase ||
        task.task_title !== original.task_title ||
        task.la_est_days !== original.la_est_days ||
        task.a_est_days !== original.a_est_days ||
        task.aa_est_days !== original.aa_est_days ||
        task.ta_est_days !== original.ta_est_days
      ) {
        return true;
      }
    }

    return false;
  }, [tasks, initialData, deleteSet]);

  const getTaskState = (task) => {
    if (task.key.startsWith("new-")) return "new";
    if (deleteSet.has(task.id)) return "to_be_deleted";
    return "existing";
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTasks((items) => {
      const oldIndex = items.findIndex((item) => item.key === active.id);
      const newIndex = items.findIndex((item) => item.key === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleOpenAddModal = (index) => {
    setEditingTask(null);
    setInsertIndex(index);
    form.resetFields();
    form.setFieldsValue({
      phase: "project_onboarding",
      task_title: "",
      la_est_days: 0,
      a_est_days: 0,
      aa_est_days: 0,
      ta_est_days: 0,
    });
    setTaskModalVisible(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setInsertIndex(null);
    form.setFieldsValue({
      phase: task.phase,
      task_title: task.task_title,
      la_est_days: task.la_est_days,
      a_est_days: task.a_est_days,
      aa_est_days: task.aa_est_days,
      ta_est_days: task.ta_est_days,
    });
    setTaskModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingTask) {
        // Update existing task
        setTasks(
          tasks.map((item) =>
            item.key === editingTask.key ? { ...item, ...values } : item
          )
        );
        message.success("Task updated");
      } else {
        // Add new task
        const newTask = {
          key: `new-${Date.now()}`,
          id: null,
          ...values,
          responsible: null,
          accountable: null,
          consulted: null,
          informed: null,
        };
        const newTasks = [...tasks];
        newTasks.splice(insertIndex + 1, 0, newTask);
        setTasks(newTasks);
        message.success("Task added");
      }

      setTaskModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleModalCancel = () => {
    setTaskModalVisible(false);
    form.resetFields();
    setEditingTask(null);
    setInsertIndex(null);
  };

  const handleDelete = (task) => {
    if (task.key.startsWith("new-")) {
      // Permanently remove new tasks
      setTasks(tasks.filter((item) => item.key !== task.key));
    } else {
      // Mark existing tasks for deletion
      setDeleteSet(new Set([...deleteSet, task.id]));
    }
  };

  const handleRestore = (task) => {
    const newSet = new Set(deleteSet);
    newSet.delete(task.id);
    setDeleteSet(newSet);
  };

  const handleLoadPredefined = async () => {
    try {
      setLoadingPredefined(true);
      setPredefinedModalVisible(true);
      const data = await getPredefinedRR();
      setPredefinedTasks(data);
    } catch (error) {
      message.error("Failed to load predefined tasks");
    } finally {
      setLoadingPredefined(false);
    }
  };

  const handleSelectAllPredefined = (checked) => {
    if (checked) {
      setSelectedPredefined(predefinedTasks.map((t) => t.id));
    } else {
      setSelectedPredefined([]);
    }
  };

  const handleAddPredefinedTasks = () => {
    const tasksToAdd = predefinedTasks
      .filter((t) => selectedPredefined.includes(t.id))
      .map((t) => ({
        key: `new-${t.id}-${Date.now()}`,
        id: null,
        phase: t.phase,
        task_title: t.task_title,
        la_est_days: t.la_est_days,
        a_est_days: t.a_est_days,
        aa_est_days: t.aa_est_days,
        ta_est_days: t.ta_est_days,
        responsible: t.responsible,
        accountable: t.accountable,
        consulted: t.consulted,
        informed: t.informed,
      }));

    setTasks([...tasks, ...tasksToAdd]);
    setPredefinedModalVisible(false);
    setSelectedPredefined([]);
    message.success(`Added ${tasksToAdd.length} tasks`);
  };

  const handleSave = async () => {
    // Validate all non-deleted tasks
    for (const task of tasks) {
      if (
        !deleteSet.has(task.id) &&
        (!task.task_title || !task.task_title.trim())
      ) {
        message.error("All tasks must have a title");
        return;
      }
    }

    try {
      setSaving(true);

      // Prepare data for API
      const new_rr_list = tasks
        .filter((task) => !deleteSet.has(task.id))
        .map((task, index) => ({
          id: task.key.startsWith("new-") ? null : task.id,
          order: index + 1,
          phase: task.phase,
          task_title: task.task_title,
          la_est_days: task.la_est_days || 0,
          a_est_days: task.a_est_days || 0,
          aa_est_days: task.aa_est_days || 0,
          ta_est_days: task.ta_est_days || 0,
          responsible: task.responsible,
          accountable: task.accountable,
          consulted: task.consulted,
          informed: task.informed,
        }));

      const delete_list = Array.from(deleteSet);

      const result = await updateResourceRequirements(projectId, {
        new_rr_list,
        delete_list,
      });

      if (result.success) {
        message.success("Resource requirements updated successfully");
        onSave();
      } else {
        message.error("Failed to update resource requirements");
      }
    } catch (error) {
      message.error(
        error.data?.error || "Failed to update resource requirements"
      );
    } finally {
      setSaving(false);
    }
  };

  const SortableRow = ({ task, index }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.key });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const taskState = getTaskState(task);
    const isDeleted = taskState === "to_be_deleted";

    return (
      <>
        {/* Add task button above */}
        <div
          style={{
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #f0f0f0",
            cursor: "pointer",
            opacity: 0.5,
            transition: "opacity 0.2s",
            backgroundColor: "#f0f0f0",
          }}
          className="add-task-divider"
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
          onClick={() => handleOpenAddModal(index - 1)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#1890ff",
              fontSize: "12px",
            }}
          >
            <PlusOutlined style={{ fontSize: "10px" }} />
            <span>Add Task</span>
          </div>
        </div>

        {/* Task row */}
        <div
          ref={setNodeRef}
          style={{
            ...style,
            display: "grid",
            gridTemplateColumns:
              "40px 180px 250px 100px 100px 100px 100px 80px 180px",
            gap: "12px",
            padding: "12px",
            borderBottom: "1px solid #f0f0f0",
            backgroundColor: isDeleted ? "#fff1f0" : "#fff",
            opacity: isDeleted ? 0.6 : 1,
            alignItems: "center",
          }}
        >
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            style={{
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            <HolderOutlined />
          </div>

          {/* Phase */}
          <div>
            <span style={{ fontSize: "13px" }}>
              {phaseOptions.find((p) => p.value === task.phase)?.label ||
                task.phase}
            </span>
          </div>

          {/* Task Title */}
          <div>
            <span style={{ fontSize: "13px" }}>{task.task_title}</span>
          </div>

          {/* Lead Advisor */}
          <div>
            <span style={{ fontSize: "13px" }}>{task.la_est_days}</span>
          </div>

          {/* Advisor */}
          <div>
            <span style={{ fontSize: "13px" }}>{task.a_est_days}</span>
          </div>

          {/* Associate */}
          <div>
            <span style={{ fontSize: "13px" }}>{task.aa_est_days}</span>
          </div>

          {/* Technical */}
          <div>
            <span style={{ fontSize: "13px" }}>{task.ta_est_days}</span>
          </div>

          {/* Status */}
          <div>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 500,
                backgroundColor:
                  taskState === "new"
                    ? "#e6f7ff"
                    : taskState === "to_be_deleted"
                    ? "#fff1f0"
                    : "#f0f0f0",
                color:
                  taskState === "new"
                    ? "#1890ff"
                    : taskState === "to_be_deleted"
                    ? "#ff4d4f"
                    : "#666",
              }}
            >
              {taskState === "new"
                ? "New"
                : taskState === "to_be_deleted"
                ? "To Delete"
                : "Existing"}
            </span>
          </div>

          {/* Actions */}
          <div>
            <Space size="small">
              {isDeleted ? (
                <Button
                  type="link"
                  onClick={() => handleRestore(task)}
                  icon={<UndoOutlined />}
                  size="small"
                  style={{ padding: "0 4px" }}
                >
                  Restore
                </Button>
              ) : (
                <>
                  <Button
                    type="link"
                    onClick={() => handleOpenEditModal(task)}
                    icon={<EditOutlined />}
                    size="small"
                    style={{ padding: "0 4px" }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="link"
                    danger
                    onClick={() => handleDelete(task)}
                    icon={<DeleteOutlined />}
                    size="small"
                    style={{ padding: "0 4px" }}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Space>
          </div>
        </div>
      </>
    );
  };

  const predefinedColumns = [
    {
      title: "Select",
      key: "select",
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedPredefined.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedPredefined([...selectedPredefined, record.id]);
            } else {
              setSelectedPredefined(
                selectedPredefined.filter((id) => id !== record.id)
              );
            }
          }}
        />
      ),
    },
    {
      title: "Phase Title",
      dataIndex: "phase",
      key: "phase",
      width: 180,
      render: (phase) => {
        const phaseLabels = {
          project_onboarding: "Project Onboarding",
          gap_analysis: "Gap Analysis",
          organizational_setup: "Organizational Setup",
          risk_analysis: "Risk Analysis",
          control_implementation: "Control Implementation",
          evidence_and_monitoring: "Evidence and Monitoring",
          internal_audit: "Internal Audit",
          document_library: "Document Library",
          sustenance: "Sustenance",
        };
        return <Text>{phaseLabels[phase] || phase}</Text>;
      },
    },
    {
      title: "Task Title",
      dataIndex: "task_title",
      key: "task_title",
      width: 300,
    },
    {
      title: "Est. Effort Required (man days)",
      children: [
        {
          title: "Lead Advisor",
          dataIndex: "la_est_days",
          key: "la_est_days",
          width: 120,
          align: "center",
        },
        {
          title: "Advisor",
          dataIndex: "a_est_days",
          key: "a_est_days",
          width: 120,
          align: "center",
        },
        {
          title: "Associate",
          dataIndex: "aa_est_days",
          key: "aa_est_days",
          width: 120,
          align: "center",
        },
        {
          title: "Technical",
          dataIndex: "ta_est_days",
          key: "ta_est_days",
          width: 120,
          align: "center",
        },
      ],
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <style>
        {`
          .add-task-divider {
            background: linear-gradient(to right, transparent, #e6f7ff 30%, transparent);
          }
          .add-task-divider:hover {
            background: linear-gradient(to right, transparent, #e6f7ff 50%, transparent);
          }
        `}
      </style>

      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ margin: 0 }}>
          Add, Edit, Delete and Reorder Resource Requirements
        </h3>
        <Space>
          <Button onClick={handleLoadPredefined}>Load Predefined Tasks</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!hasChanges}
            loading={saving}
          >
            Save Changes
          </Button>
        </Space>
      </Space>

      {/* Table Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "40px 180px 250px 100px 100px 100px 100px 80px 180px",
          gap: "12px",
          padding: "12px",
          backgroundColor: "#fafafa",
          borderBottom: "2px solid #e0e0e0",
          fontWeight: 600,
          fontSize: "13px",
          color: "#333",
        }}
      >
        <div></div>
        <div>Phase</div>
        <div>Task Title</div>
        <div
          style={{
            gridColumn: "4 / 8",
            textAlign: "center",
            fontWeight: 700,
            paddingBottom: "6px",
          }}
        >
          Est. Effort Required (man days)
        </div>
        <div>Status</div>
        <div>Actions</div>
        <div></div>
        <div></div>
        <div></div>
        <div>Lead Advisor</div>
        <div>Advisor</div>
        <div>Associate</div>
        <div>Technical</div>
        <div></div>
        <div></div>
      </div>

      {/* Scrollable Content */}
      <div
        style={{
          border: "1px solid #f0f0f0",
          borderTop: "none",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((t) => t.key)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task, index) => (
              <SortableRow key={task.key} task={task} index={index} />
            ))}
          </SortableContext>
        </DndContext>

        {/* Add task at end */}
        <div
          style={{
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #f0f0f0",
            cursor: "pointer",
            opacity: 0.5,
            transition: "opacity 0.2s",
            backgroundColor: "#f0f0f0",
          }}
          className="add-task-divider"
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
          onClick={() => handleOpenAddModal(tasks.length - 1)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#1890ff",
              fontSize: "12px",
            }}
          >
            <PlusOutlined style={{ fontSize: "10px" }} />
            <span>Add Task</span>
          </div>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <Modal
        title={editingTask ? "Edit Task" : "Add New Task"}
        open={taskModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText={editingTask ? "Update Task" : "Add Task"}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Phase"
            name="phase"
            rules={[{ required: true, message: "Please select a phase" }]}
          >
            <Select options={phaseOptions} placeholder="Select phase" />
          </Form.Item>

          <Form.Item
            label="Task Title"
            name="task_title"
            rules={[{ required: true, message: "Please enter task title" }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item label="Estimated Effort (man days)">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Form.Item
                label="Lead Advisor"
                name="la_est_days"
                noStyle
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber
                  min={0}
                  step={0.5}
                  style={{ width: "100%" }}
                  placeholder="Lead Advisor days"
                />
              </Form.Item>

              <Form.Item
                label="Advisor"
                name="a_est_days"
                noStyle
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber
                  min={0}
                  step={0.5}
                  style={{ width: "100%" }}
                  placeholder="Advisor days"
                />
              </Form.Item>

              <Form.Item
                label="Associate"
                name="aa_est_days"
                noStyle
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber
                  min={0}
                  step={0.5}
                  style={{ width: "100%" }}
                  placeholder="Associate days"
                />
              </Form.Item>

              <Form.Item
                label="Technical"
                name="ta_est_days"
                noStyle
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber
                  min={0}
                  step={0.5}
                  style={{ width: "100%" }}
                  placeholder="Technical days"
                />
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Predefined Tasks Modal */}
      <Modal
        title="Load Predefined Tasks"
        open={predefinedModalVisible}
        onOk={handleAddPredefinedTasks}
        onCancel={() => {
          setPredefinedModalVisible(false);
          setSelectedPredefined([]);
        }}
        width={1000}
        okText={`Add ${selectedPredefined.length} Selected Tasks`}
        okButtonProps={{ disabled: selectedPredefined.length === 0 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Checkbox
            checked={
              selectedPredefined.length === predefinedTasks.length &&
              predefinedTasks.length > 0
            }
            indeterminate={
              selectedPredefined.length > 0 &&
              selectedPredefined.length < predefinedTasks.length
            }
            onChange={(e) => handleSelectAllPredefined(e.target.checked)}
          >
            Select All
          </Checkbox>
        </div>
        <Table
          columns={predefinedColumns}
          dataSource={predefinedTasks}
          rowKey="id"
          loading={loadingPredefined}
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 800 }}
        />
      </Modal>
    </div>
  );
};

export default ResourceRequirementsEdit;
