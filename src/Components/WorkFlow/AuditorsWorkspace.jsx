import React, { useState } from 'react';
import { Select, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import SideNav from './SideNav';

const { Dragger } = Upload;

const AuditorWorkspace = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);

    const handleSourceChange = (value) => {
        setSelectedSource(value);
    };

    return (
        <div className="auditor-workspace-container" style={{ display: 'flex', fontFamily: 'Arial, sans-serif' }}>
            {/* Sidebar (SideNav) */}
            <SideNav />

            {/* Main Content */}
            <div
                className="auditor-workspace"
                style={{ flex: 1, padding: '20px', backgroundColor: '#f4f6f9', color: '#333' }}
            >
                <h1 style={{ color: '#003a8c', marginBottom: '20px', fontWeight: '700', fontSize: 'px' }}>
                    Auditor Workspace
                </h1>
                {/* Upload Policy Section */}
                <div className="upload-section" style={{ marginBottom: '20px' }}>
                    <Dragger
                        name="file"
                        multiple={false}
                        customRequest={({ file, onSuccess }) => {
                            setTimeout(() => {
                                onSuccess("ok"); 
                                setUploadedFile(file.name); 
                                message.success(`${file.name} uploaded successfully.`);
                            }, 500);
                        }}
                        style={{ padding: '20px', border: '1px dashed #1890ff', backgroundColor: '#ffffff' }}
                    >
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                        </p>
                        <p className="ant-upload-text">Upload a policy</p>
                        <p className="ant-upload-hint">Supports single file uploads.</p>
                    </Dragger>
                </div>

                {/* Show uploaded file name */}
                {uploadedFile && (
                    <div style={{ marginBottom: '20px', fontSize: '16px' }}>
                        <strong>Uploaded File:</strong> {uploadedFile}
                    </div>
                )}

                {/* Policy Source Dropdown */}
                {uploadedFile && (
                    <div className="dropdown-section" style={{ marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '10px', color: '#003a8c' }}>Select the Policy Source</h3>
                        <Select
                            style={{ width: 300 }}
                            placeholder="Select Policy Source"
                            onChange={handleSourceChange}
                        >
                            <Select.Option value="iso27001">ISO 27001</Select.Option>
                            <Select.Option value="iso27701">ISO 27701</Select.Option>
                            <Select.Option value="pcidss">PCI DSS</Select.Option>
                        </Select>
                    </div>
                )}

                {/* Generate ML Report and Skip Buttons */}
                {selectedSource && (
                    <div className="create-report-section" style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            type="primary"
                            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                        >
                            Generate ML Report
                        </Button>
                        <Button
                            type="default"
                            style={{ borderColor: '#d9d9d9' }}
                        >
                            Skip
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditorWorkspace;
