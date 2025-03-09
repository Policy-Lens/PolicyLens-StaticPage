import React, { useState } from "react";
import { Button, Modal, Form, DatePicker, TimePicker, Input, Upload } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const KickoffMeetings = () => {
    const [isMeetingModalVisible, setIsMeetingModalVisible] = useState(false);
    const [isDataModalVisible, setIsDataModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [fileLists, setFileLists] = useState({});

    const handleMeetingSchedule = () => {
        setIsMeetingModalVisible(true);
    };

    const closeMeetingModal = () => {
        setIsMeetingModalVisible(false);
        form.resetFields();
    };

    const handleDataModal = () => {
        setIsDataModalVisible(true);
    };

    const closeDataModal = () => {
        setIsDataModalVisible(false);
    };

    const handleFileChange = (panelKey, { fileList }) => {
        setFileLists((prev) => ({ ...prev, [panelKey]: fileList }));
    };

    const renderLargeInputWithAttachButton = (panelKey, placeholder) => (
        <div className="relative border border-gray-300 rounded-lg overflow-hidden">
            <TextArea
                rows={4}
                placeholder={placeholder}
                className="border-none resize-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute bottom-3 right-4">
                <Upload
                    fileList={fileLists[panelKey] || []}
                    onChange={(info) => handleFileChange(panelKey, info)}
                    beforeUpload={() => false}
                    showUploadList={false}
                    multiple
                >
                    <button className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-200 focus:outline-none">
                        <PaperClipOutlined className="mr-2" />
                        Attach Files
                    </button>
                </Upload>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50" style={{ minHeight: "40vh" }}>
            <div className="bg-gray-100 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Kickoff Meetings</h2>
                <div className="flex justify-between">
                    <button className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded shadow-md">
                        Schedule a Meeting
                    </button>
                    <button className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded shadow-md">
                        Add Data
                    </button>
                </div>
            </div>


            {/* Meeting Details Modal */}
            <Modal
                title="Schedule a Meeting"
                visible={isMeetingModalVisible}
                onCancel={closeMeetingModal}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={() => closeMeetingModal()}>
                    <Form.Item name="title" label="Meeting Title" rules={[{ required: true, message: "Please enter a meeting title!" }]}>
                        <Input placeholder="Enter meeting title" />
                    </Form.Item>
                    <Form.Item name="date" label="Date" rules={[{ required: true, message: "Please select a date!" }]}>
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="time" label="Time" rules={[{ required: true, message: "Please select a time!" }]}>
                        <TimePicker style={{ width: "100%" }} use12Hours format="h:mm A" />
                    </Form.Item>
                    <Form.Item name="participants" label="Participants" rules={[{ required: true, message: "Please enter participants' names!" }]}>
                        <Input placeholder="Enter participants (e.g., John, Mary)" />
                    </Form.Item>
                    <Form.Item name="agenda" label="Agenda" rules={[{ required: true, message: "Please enter an agenda!" }]}>
                        <TextArea rows={4} placeholder="Enter meeting agenda" />
                    </Form.Item>
                    <div className="flex justify-end">
                        <Button onClick={closeMeetingModal} className="mr-2">Cancel</Button>
                        <Button type="primary" htmlType="submit">Submit</Button>
                    </div>
                </Form>
            </Modal>

            {/* Add Data Modal */}
            <Modal
                title="Add Data"
                visible={isDataModalVisible}
                onCancel={closeDataModal}
                footer={null}
            >
                <Form layout="vertical">
                    <Form.Item label="Discuss Project Plan">
                        {renderLargeInputWithAttachButton("projectPlan", "Add notes for project plan discussion")}
                    </Form.Item>
                    <Form.Item label="Discuss Next Steps">
                        {renderLargeInputWithAttachButton("nextSteps", "Add notes for next steps discussion")}
                    </Form.Item>
                </Form>
                <div className="flex justify-end mt-4">
                    <Button onClick={closeDataModal} className="mr-2">Cancel</Button>
                    <Button type="primary" onClick={closeDataModal}>Submit</Button>
                </div>
            </Modal>
        </div>
    );
};

export default KickoffMeetings;
