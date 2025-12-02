import React, { useState } from "react";
import {
  Button,
  Divider,
  Typography,
  Table,
  Modal,
  Form,
  Input,
  message,
  Upload,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UndoOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { TextArea } = Input;

const FontsSection = ({
  fonts,
  setFonts,
  isEditMode,
  itemsToAdd,
  setItemsToAdd,
  itemsToRemove,
  setItemsToRemove,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fontFile, setFontFile] = useState(null);

  const handleAdd = (values) => {
    if (!fontFile) {
      message.error("Please upload a font file");
      return;
    }

    const fontData = {
      font_usage: values.font_usage || "",
      font_file: fontFile,
    };

    setItemsToAdd((prev) => ({
      ...prev,
      add_font: [...prev.add_font, fontData],
    }));
    const newFont = { ...fontData, id: `temp-${Date.now()}` };
    setFonts([...fonts, newFont]);
    setModalVisible(false);
    form.resetFields();
    setFontFile(null);
    message.success("Font added (will be saved when you click Save)");
  };

  const beforeUpload = (file) => {
    const isValidType = ["ttf", "otf", "woff", "woff2"].some((ext) =>
      file.name.toLowerCase().endsWith(`.${ext}`)
    );
    if (!isValidType) {
      message.error(
        "You can only upload .ttf, .otf, .woff, or .woff2 font files!"
      );
      return Upload.LIST_IGNORE;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("Font file must be smaller than 10MB!");
      return Upload.LIST_IGNORE;
    }
    setFontFile(file);
    return false; // Prevent auto upload
  };

  const handleDelete = (id) => {
    if (String(id).startsWith("temp-")) {
      setFonts(fonts.filter((item) => item.id !== id));
      const tempFonts = fonts.filter((item) =>
        String(item.id).startsWith("temp-")
      );
      const index = tempFonts.findIndex((t) => t.id === id);
      setItemsToAdd((prev) => ({
        ...prev,
        add_font: prev.add_font.filter((_, i) => i !== index),
      }));
    } else {
      setItemsToRemove((prev) => ({
        ...prev,
        remove_fonts: [...prev.remove_fonts, id],
      }));
    }
  };

  const handleRevert = (id) => {
    setItemsToRemove((prev) => ({
      ...prev,
      remove_fonts: prev.remove_fonts.filter((itemId) => itemId !== id),
    }));
  };

  const isMarkedForDeletion = (id) => itemsToRemove.remove_fonts.includes(id);

  const columns = [
    {
      title: "Font File",
      dataIndex: "font_file",
      key: "font_file",
      render: (file) => {
        if (file && typeof file === "string") {
          const fileName = file.split("/").pop();
          return (
            <a href={file} target="_blank" rel="noopener noreferrer">
              {fileName}
            </a>
          );
        }
        if (file instanceof File) {
          return <span>{file.name}</span>;
        }
        return "No file";
      },
    },
    { title: "Usage", dataIndex: "font_usage", key: "font_usage" },
    ...(isEditMode
      ? [
          {
            title: "Actions",
            key: "actions",
            align: "center",
            render: (_, record) => {
              const markedForDeletion = isMarkedForDeletion(record.id);
              return markedForDeletion ? (
                <Button
                  type="link"
                  icon={<UndoOutlined />}
                  onClick={() => handleRevert(record.id)}
                >
                  Revert
                </Button>
              ) : (
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.id)}
                >
                  Delete
                </Button>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <>
      <Title
        level={4}
        style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          marginTop: "36px",
        }}
      >
        Company Font
        <span
          style={{
            flex: 1,
            height: "1px",
            background: "#d9d9d9",
            marginLeft: "12px",
          }}
        ></span>
      </Title>

      <Table
        dataSource={fonts}
        columns={columns}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: "No fonts added" }}
        rowClassName={(record) =>
          isMarkedForDeletion(record.id) ? "row-deleted" : ""
        }
      />

      {isEditMode && (
        <Button
          color="default"
          variant="dashed"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          style={{ width: "100%", marginTop: "16px" }}
        >
          Add Font
        </Button>
      )}

      <style>{`
        .row-deleted {
          background-color: #ffebee !important;
          opacity: 0.7;
        }
        .row-deleted:hover {
          background-color: #ffcdd2 !important;
        }
      `}</style>

      <Modal
        title="Add Font"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setFontFile(null);
        }}
        onOk={() => form.submit()}
        okText="Add"
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            label="Font File"
            required
            rules={[
              {
                validator: () =>
                  fontFile
                    ? Promise.resolve()
                    : Promise.reject("Please upload a font file"),
              },
            ]}
          >
            <Upload
              beforeUpload={beforeUpload}
              onRemove={() => setFontFile(null)}
              fileList={fontFile ? [fontFile] : []}
              maxCount={1}
              accept=".ttf,.otf,.woff,.woff2"
            >
              <Button icon={<UploadOutlined />}>
                Upload Font File (.ttf, .otf, .woff, .woff2)
              </Button>
            </Upload>
            {fontFile && (
              <div style={{ marginTop: "8px", color: "#52c41a" }}>
                Selected: {fontFile.name}
              </div>
            )}
          </Form.Item>
          <Form.Item name="font_usage" label="Usage">
            <TextArea rows={2} placeholder="e.g., Headers and body text" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FontsSection;
