import React, { useState } from "react";
import {
    Button,
    Collapse,
    Modal,
    Form,
    DatePicker,
    TimePicker,
    Input,
    Upload,
} from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Panel } = Collapse;

const KickoffMeetings = () => {
    const [isMeetingModalVisible, setIsMeetingModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [fileLists, setFileLists] = useState({});

    const handleMeetingSchedule = () => {
        setIsMeetingModalVisible(true);
    };

    const closeMeetingModal = () => {
        setIsMeetingModalVisible(false);
        form.resetFields();
    };

    const handleFileChange = (panelKey, { fileList }) => {
        setFileLists((prev) => ({ ...prev, [panelKey]: fileList }));
    };

    const handleFormSubmit = (values) => {
        console.log("Meeting Details:", values);
        closeMeetingModal(); 
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
                    <button
                        className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-200 focus:outline-none"
                    >
                        <PaperClipOutlined className="mr-2" />
                        Attach Files
                    </button>
                </Upload>
            </div>
        </div>
    );

    const renderSmallInputWithAttachButton = (panelKey, placeholder) => (
        <div className="relative border border-gray-300 rounded-lg overflow-hidden">
            <Input
                placeholder={placeholder}
                className="border-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute top-1/2 right-4 -translate-y-1/2">
                <Upload
                    fileList={fileLists[panelKey] || []}
                    onChange={(info) => handleFileChange(panelKey, info)}
                    beforeUpload={() => false} 
                    showUploadList={false} 
                    multiple
                >
                    <button
                        className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-200 focus:outline-none"
                    >
                        <PaperClipOutlined className="mr-2" />
                        Attach Files
                    </button>
                </Upload>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50" style={{ minHeight: "40vh" }}>
            {/* Content Section */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Kickoff Meetings
                </h1>
                <Button
                    type="primary"
                    onClick={handleMeetingSchedule}
                    className="mt-4"
                >
                    Schedule a Meeting
                </Button>

                <Collapse accordion className="space-y-4 mt-6">
                    <Panel header="Discuss Project Plan" key="1">
                        {renderLargeInputWithAttachButton("projectPlan", "Add notes for project plan discussion")}
                    </Panel>
                    <Panel header="Discuss Next Steps" key="2">
                        {renderLargeInputWithAttachButton("nextSteps", "Add notes for next steps discussion")}
                    </Panel>
                </Collapse>
            </div>

            {/* Meeting Details Modal */}
            <Modal
                title="Schedule a Meeting"
                visible={isMeetingModalVisible}
                onCancel={closeMeetingModal}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={{ date: null, time: null }}
                >
                    <Form.Item
                        name="title"
                        label="Meeting Title"
                        rules={[{ required: true, message: "Please enter a meeting title!" }]}
                    >
                        <Input
                            placeholder="Enter meeting title"
                            className="border-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </Form.Item>
                    <Form.Item
                        name="date"
                        label="Date"
                        rules={[{ required: true, message: "Please select a date!" }]}
                    >
                        <DatePicker style={{ width: "100%" }} className="border-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </Form.Item>
                    <Form.Item
                        name="time"
                        label="Time"
                        rules={[{ required: true, message: "Please select a time!" }]}
                    >
                        <TimePicker
                            style={{ width: "100%" }}
                            use12Hours
                            format="h:mm A"
                            className="border-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </Form.Item>
                    <Form.Item
                        name="participants"
                        label="Participants"
                        rules={[{ required: true, message: "Please enter participants' names!" }]}
                    >
                        <Input
                            placeholder="Enter participants (e.g., John, Mary)"
                            className="border-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </Form.Item>
                    <Form.Item
                        name="agenda"
                        label="Agenda"
                        rules={[{ required: true, message: "Please enter an agenda!" }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter meeting agenda"
                            className="border-none resize-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </Form.Item>
                    <div className="flex justify-end">
                        <Button onClick={closeMeetingModal} className="mr-2">
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default KickoffMeetings;
