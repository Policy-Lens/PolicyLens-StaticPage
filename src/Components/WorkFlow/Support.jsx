import React, { useState } from "react";
import { Button, Collapse, Modal, Input, DatePicker, Select } from "antd";

const { Panel } = Collapse;
const { Option } = Select;

const Support = () => {
  const [queries, setQueries] = useState([
    {
      id: 1,
      headline: "Query 1",
      details: "Detailed explanation of query 1",
      resolved: false,
    },
    {
      id: 2,
      headline: "Query 2",
      details: "Detailed explanation of query 2",
      resolved: false,
    },
    {
      id: 3,
      headline: "Query 3",
      details: "Detailed explanation of query 3",
      resolved: false,
    },
  ]);

  const [isAssignTaskModalVisible, setIsAssignTaskModalVisible] = useState(false);

  const openAssignTaskModal = () => {
    setIsAssignTaskModalVisible(true);
  };

  const closeAssignTaskModal = () => {
    setIsAssignTaskModalVisible(false);
  };

  const handleResolveQuery = (queryId) => {
    setQueries(
      queries.map((query) =>
        query.id === queryId ? { ...query, resolved: true } : query
      )
    );
  };

  const consultants = ["Consultant A", "Consultant B", "Consultant C"];

  return (
    <div className="pt-8 p-16 bg-gray-50 flex-grow relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Policy Lens</h1>

      {/* Support Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Queries</h2>
        <Collapse defaultActiveKey={[]}>
          {queries.map((query) => (
            <Panel
              header={query.headline}
              key={query.id}
              extra={
                !query.resolved && (
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: "#f56a00",
                      borderColor: "#f56a00",
                    }}
                    onClick={() => handleResolveQuery(query.id)}
                  >
                    Resolve
                  </Button>
                )
              }
            >
              <p>{query.details}</p>
              {query.resolved && <p className="text-green-500">Resolved</p>}
            </Panel>
          ))}
        </Collapse>
      </div>

      {/* Assign Task Button positioned in the bottom-right corner */}
      <div className="absolute bottom-4 right-8">
        <Button type="default" onClick={openAssignTaskModal}>
          Assign Task
        </Button>
      </div>

      {/* Modal for Assign Task */}
      <Modal
        title="Assign Task"
        visible={isAssignTaskModalVisible}
        onCancel={closeAssignTaskModal}
        footer={null}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Members
          </label>
          <Select
            mode="multiple"
            placeholder="Select team members"
            className="w-full"
          >
            {consultants.map((consultant) => (
              <Option key={consultant} value={consultant}>
                {consultant}
              </Option>
            ))}
          </Select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Deadline
          </label>
          <DatePicker className="w-full" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Description
          </label>
          <Input placeholder="Enter task description" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task References
          </label>
          <Input placeholder="Add reference URLs" />
        </div>

        <div className="flex justify-center">
          <Button type="primary" onClick={closeAssignTaskModal}>
            Assign
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Support;
