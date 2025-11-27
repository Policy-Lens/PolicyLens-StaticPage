import { useState, useEffect, useContext } from "react";
import { Modal, Table, message, Alert, Spin } from "antd";
import { OnboardingContext } from "../../../../../../Context/OnboardingContext";

const ManageIssuesModal = ({
  visible,
  onClose,
  category,
  projectId,
  maxIssues,
  currentCount,
  loadAllIssues,
}) => {
  const [issueBank, setIssueBank] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { getIssueBank, selectIssue, unselectIssue } =
    useContext(OnboardingContext);

  useEffect(() => {
    if (visible) {
      loadIssueBank();
    }
  }, [visible, category]);

  const loadIssueBank = async () => {
    try {
      setLoading(true);
      const data = await getIssueBank(projectId);
      // Filter by category
      const filteredData = data.filter((issue) => issue.category === category);
      setIssueBank(filteredData);

      // Set initially selected rows
      const selected = filteredData
        .filter((issue) => issue.selected)
        .map((issue) => issue.id);
      setSelectedRowKeys(selected);
    } catch (error) {
      message.error("Failed to load issue bank");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = async (selectedKeys) => {
    // Check if we're at max capacity when trying to select
    if (maxIssues && selectedKeys.length > maxIssues) {
      message.warning(`Maximum ${maxIssues} issues allowed for this section`);
      return;
    }

    try {
      setUpdating(true);

      // Find newly selected and deselected items
      const newlySelected = selectedKeys.filter(
        (key) => !selectedRowKeys.includes(key)
      );
      const newlyDeselected = selectedRowKeys.filter(
        (key) => !selectedKeys.includes(key)
      );

      // Handle newly selected
      for (const issueId of newlySelected) {
        await selectIssue(projectId, issueId);
      }

      // Handle newly deselected
      for (const issueId of newlyDeselected) {
        const issue = issueBank.find((i) => i.id === issueId);
        if (issue && issue.project_issue_item_id) {
          await unselectIssue(projectId, issue.project_issue_item_id);
        }
      }

      setSelectedRowKeys(selectedKeys);
      message.success("Issues updated successfully");

      // Reload issue bank and all issues
      await loadIssueBank();
      await loadAllIssues();
    } catch (error) {
      if (error.data?.error) {
        message.error(error.data.error);
      } else {
        message.error("Failed to update issues");
      }
      // Reload to reset state
      await loadIssueBank();
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      title: "Issue",
      dataIndex: "text",
      key: "text",
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectionChange,
    getCheckboxProps: (record) => ({
      disabled:
        updating ||
        (!selectedRowKeys.includes(record.id) &&
          maxIssues &&
          selectedRowKeys.length >= maxIssues),
    }),
  };

  const getCategoryTitle = () => {
    const titles = {
      internal: "Internal Issues",
      external: "External Issues",
      risk: "Risks and Threats",
      opportunity: "Opportunities",
    };
    return titles[category] || category;
  };

  return (
    <Modal
      title={`Manage ${getCategoryTitle()}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {maxIssues && (
        <Alert
          message={`${selectedRowKeys.length} / ${maxIssues} issues selected`}
          type={selectedRowKeys.length >= maxIssues ? "warning" : "info"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Spin spinning={loading || updating}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={issueBank}
          rowKey="id"
          pagination={false}
          scroll={{ y: 400 }}
          size="small"
        />
      </Spin>
    </Modal>
  );
};

export default ManageIssuesModal;
