import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tabs,
  Card,
  Button,
  Form,
  message,
  Space,
  Typography,
  Spin,
  Tag,
  Modal,
  Table,
  Input
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  SendOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../../AuthContext';
import { apiRequest } from '../../../utils/api';
import Unauthorized from '../../Common/Unauthorized';
import html2pdf from 'html2pdf.js';

// Import section components
import BasicInformationSection from './sections/BasicInformationSection';
import ContractualInformationSection from './sections/ContractualInformationSection';
import LegalInformationSection from './sections/LegalInformationSection';
import ITInformationSection from './sections/ITInformationSection';
import LocationsSection from './sections/LocationsSection';
import ColorPaletteSection from './sections/ColorPaletteSection';
import FontsSection from './sections/FontsSection';
import ClientsSection from './sections/ClientsSection';
import VendorsSection from './sections/VendorsSection';
import CloudServicesSection from './sections/CloudServicesSection';
import OtherInformationSection from './sections/OtherInformationSection';
import { div } from 'framer-motion/client';

const { Title, Text } = Typography;

const CompanyDetail = () => {
  const { companyId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [changedFields, setChangedFields] = useState(new Set());
  const [activeTab, setActiveTab] = useState('details');
  const [unauthorized, setUnauthorized] = useState(false);

  // Profile preview state
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Representatives state
  const [representatives, setRepresentatives] = useState([]);
  const [repsLoading, setRepsLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRepId, setSelectedRepId] = useState(null);
  const [addRepModalVisible, setAddRepModalVisible] = useState(false);
  const [repForm] = Form.useForm();
  const [addingRep, setAddingRep] = useState(false);

  // Dynamic lists state
  const [assets, setAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [colorPalette, setColorPalette] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [cloudServices, setCloudServices] = useState([]);

  // Items to add/remove
  const [itemsToAdd, setItemsToAdd] = useState({
    add_asset: [],
    add_location: [],
    add_color: [],
    add_font: [],
    add_client: [],
    add_vendor: [],
    add_cloud_service: []
  });
  const [itemsToRemove, setItemsToRemove] = useState({
    remove_assets: [],
    remove_locations: [],
    remove_colors: [],
    remove_fonts: [],
    remove_clients: [],
    remove_vendors: [],
    remove_cloud_services: []
  });

  // File uploads
  const [fileUploads, setFileUploads] = useState({});

  const isSuperConsultant = user?.role === 'Super Consultant' || user?.is_staff;
  const isCompanyRole = user?.role === 'Company';

  // Handle file change
  const handleFileChange = (fieldName, file) => {
    setFileUploads(prev => ({
      ...prev,
      [fieldName]: file
    }));
    message.success(`${file.name} selected. Will be uploaded on save.`);
  };

  // Fetch company details
  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', `/api/company/${companyId}/details/`, null, true);
      if (response.status === 200) {
        const data = response.data;
        setCompanyData(data);
        const dataClone = JSON.parse(JSON.stringify(data));
        form.setFieldsValue(dataClone);
        setOriginalData(dataClone);

        // Set dynamic lists
        setAssets(data.assets || []);
        setLocations(data.locations || []);
        setColorPalette(data.color_palette || []);
        setFonts(data.font || []);
        setClients(data.client || []);
        setVendors(data.vendor || []);
        setCloudServices(data.cloud_service || []);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      if (error.status === 403) {
        setUnauthorized(true);
      } else {
        message.error('Failed to load company details');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch representatives
  const fetchRepresentatives = async () => {
    try {
      setRepsLoading(true);
      const response = await apiRequest('GET', `/api/auth/companies/${companyId}/representatives/`, null, true);
      if (response.status === 200) {
        setRepresentatives(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching representatives:', error);
      setRepresentatives([]);
    } finally {
      setRepsLoading(false);
    }
  };

  // Fetch profile preview
  const fetchProfilePreview = async () => {
    try {
      setPreviewLoading(true);
      const response = await apiRequest('GET', `/api/company/${companyId}/profile/preview/`, null, true);
      if (response.status === 200) {
        setPreviewHtml(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile preview:', error);
      message.error('Failed to load profile preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Download profile as PDF
  const downloadProfileAsPDF = async () => {
    message.loading({ content: 'Preparing PDF...', key: 'pdf-download' });
    
    const element = document.getElementById('profile-preview-content');
    
    // Store original styles
    const originalStyles = {
      maxHeight: element.style.maxHeight,
      overflow: element.style.overflow
    };
    
    // Remove scroll constraints temporarily for PDF generation
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    
    // Wait for all images to load
    const images = element.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails to load
        }
      });
    });
    
    try {
      await Promise.all(imagePromises);
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${companyData?.company_name || 'Company'}_Profile.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          scrollY: 0,
          scrollX: 0,
          windowHeight: element.scrollHeight
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy']
        }
      };
      
      await html2pdf().set(opt).from(element).save();
      message.success({ content: 'PDF downloaded successfully!', key: 'pdf-download' });
    } catch (error) {
      console.error('PDF generation error:', error);
      message.error({ content: 'Failed to generate PDF', key: 'pdf-download' });
    } finally {
      // Restore original styles
      element.style.maxHeight = originalStyles.maxHeight;
      element.style.overflow = originalStyles.overflow;
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  useEffect(() => {
    if (activeTab === 'representatives') {
      fetchRepresentatives();
    }
  }, [activeTab]);

  // Check if user can edit
  const canEdit = () => {
    if (!companyData) return false;
    
    // Super Consultant can edit only if status is pending
    if (isSuperConsultant && companyData.onboarding_status === 'pending') {
      return true;
    }
    
    // Company role can edit in other statuses
    if (isCompanyRole && companyData.onboarding_status !== 'pending') {
      return true;
    }
    
    return false;
  };

  // Track field changes
  const handleFieldChange = (changedValues, allValues) => {
    const newChangedFields = new Set(changedFields);
    
    Object.keys(changedValues).forEach(field => {
      const currentValue = allValues[field];
      const originalValue = originalData[field];
      
      const normalizedCurrent = currentValue === undefined || currentValue === null ? '' : String(currentValue).trim();
      const normalizedOriginal = originalValue === undefined || originalValue === null ? '' : String(originalValue).trim();
      
      if (normalizedCurrent !== normalizedOriginal) {
        newChangedFields.add(field);
      } else {
        newChangedFields.delete(field);
      }
    });
    
    setChangedFields(newChangedFields);
  };

  // Save changes
  const handleSave = async (values) => {
    if (!canEdit()) {
      message.error('You do not have permission to edit');
      return;
    }

    try {
      setSaving(true);
      
      // Only send changed fields
      let dataToSend = {};
      if (changedFields.size > 0) {
        changedFields.forEach(field => {
          dataToSend[field] = values[field];
        });
      }

      const hasFiles = Object.keys(fileUploads).length > 0;

      let response;
      if (hasFiles) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        // Add files
        Object.keys(fileUploads).forEach(key => {
          formData.append(key, fileUploads[key]);
        });
        
        // Add JSON data as strings
        formData.append('companyDetails', JSON.stringify(dataToSend));
        Object.keys(itemsToAdd).forEach(key => {
          if (itemsToAdd[key].length > 0) {
            formData.append(key, JSON.stringify(itemsToAdd[key]));
          }
        });
        Object.keys(itemsToRemove).forEach(key => {
          if (itemsToRemove[key].length > 0) {
            formData.append(key, JSON.stringify(itemsToRemove[key]));
          }
        });

        response = await apiRequest('PATCH', `/api/company/${companyId}/details/update/`, formData, true, true);
      } else {
        // JSON only
        const payload = {
          companyDetails: dataToSend,
          ...itemsToAdd,
          ...itemsToRemove
        };
        
        response = await apiRequest('PATCH', `/api/company/${companyId}/details/update/`, payload, true);
      }
      
      if (response.status === 200) {
        message.success('Company details updated successfully');
        setIsEditMode(false);
        setChangedFields(new Set());
        setFileUploads({});
        // Reset add/remove arrays
        setItemsToAdd({
          add_asset: [],
          add_location: [],
          add_color: [],
          add_font: [],
          add_client: [],
          add_vendor: [],
          add_cloud_service: []
        });
        setItemsToRemove({
          remove_assets: [],
          remove_locations: [],
          remove_colors: [],
          remove_fonts: [],
          remove_clients: [],
          remove_vendors: [],
          remove_cloud_services: []
        });
        fetchCompanyDetails();
      }
    } catch (error) {
      console.error('Error saving company details:', error);
      message.error('Failed to save company details');
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    form.setFieldsValue(originalData);
    setChangedFields(new Set());
    setIsEditMode(false);
    setFileUploads({});
    // Reset add/remove arrays
    setItemsToAdd({
      add_asset: [],
      add_location: [],
      add_color: [],
      add_font: [],
      add_client: [],
      add_vendor: [],
      add_cloud_service: []
    });
    setItemsToRemove({
      remove_assets: [],
      remove_locations: [],
      remove_colors: [],
      remove_fonts: [],
      remove_clients: [],
      remove_vendors: [],
      remove_cloud_services: []
    });
    // Restore original lists
    if (companyData) {
      setAssets(companyData.assets || []);
      setLocations(companyData.locations || []);
      setColorPalette(companyData.color_palette || []);
      setFonts(companyData.font || []);
      setClients(companyData.client || []);
      setVendors(companyData.vendor || []);
      setCloudServices(companyData.cloud_service || []);
    }
  };

  // Send for approval (Super Consultant, pending status)
  const handleSendForApproval = async () => {
    try {
      setSaving(true);
      const response = await apiRequest('PATCH', `/api/company/${companyId}/onboarding/status/`, 
        { status: 'in_review' }, true);
      
      if (response.status === 200) {
        message.success('Company sent for approval. Activation email sent to admin.');
        navigate(`/home/company/`);
        // fetchCompanyDetails();
      }
    } catch (error) {
      console.error('Error sending for approval:', error);
      message.error('Failed to send for approval');
    } finally {
      setSaving(false);
    }
  };

  // Approve (Company role, in_review status)
  const handleApprove = async () => {
    try {
      setSaving(true);
      const response = await apiRequest('PATCH', `/api/company/${companyId}/onboarding/status/`, 
        { status: 'completed' }, true);
      
      if (response.status === 200) {
        message.success('Onboarding completed successfully');
        fetchCompanyDetails();
      }
    } catch (error) {
      console.error('Error approving:', error);
      message.error('Failed to complete onboarding');
    } finally {
      setSaving(false);
    }
  };

  // Handle add representative
  const handleAddRepresentative = () => {
    setAddRepModalVisible(true);
  };

  // Create new representative
  const handleCreateRepresentative = async (values) => {
    try {
      setAddingRep(true);
      const response = await apiRequest(
        'POST',
        `/api/auth/company/${companyId}/representatives/create/`,
        values,
        true
      );
      
      if (response.status === 201) {
        message.success('Representative created successfully!');
        if (response.data.email_sent) {
          message.info('Activation email sent to the representative.');
        }
        else{
            message.info('Activation email not sent to the representative.');
        }
        // Refresh representatives list
        fetchRepresentatives();
        // Close modal and reset form
        setAddRepModalVisible(false);
        repForm.resetFields();
      }
    } catch (error) {
      console.error('Error creating representative:', error);
      if (error.response?.status === 403) {
        message.error('You are not authorized to add representatives.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Invalid data provided.';
        message.error(errorMsg);
      } else {
        message.error('Failed to create representative. Please try again.');
      }
    } finally {
      setAddingRep(false);
    }
  };

  // Handle delete representative (fake for now)
  const handleDeleteRepresentative = (repId) => {
    setSelectedRepId(repId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await apiRequest(
        'DELETE',
        `/api/auth/company/${companyId}/representatives/${selectedRepId}/`,
        null,
        true
      );
      
      if (response.status === 204) {
        message.success('Representative deleted successfully!');
        // Refresh representatives list
        fetchRepresentatives();
      }
    } catch (error) {
      console.error('Error deleting representative:', error);
      if (error.response?.status === 403) {
        message.error('You are not authorized to delete representatives.');
      } else if (error.response?.status === 404) {
        message.error('Representative not found.');
      } else {
        message.error('Failed to delete representative. Please try again.');
      }
    } finally {
      setDeleteModalVisible(false);
      setSelectedRepId(null);
    }
  };

  // Check if we have any changes or pending adds/removes
  const hasChanges = () => {
    return changedFields.size > 0 || 
           Object.values(itemsToAdd).some(arr => arr.length > 0) ||
           Object.values(itemsToRemove).some(arr => arr.length > 0) ||
           Object.keys(fileUploads).length > 0;
  };

  // Get form item props with visual indicator for changes
  const getFormItemProps = (fieldName, baseProps = {}) => {
    const isChanged = changedFields.has(fieldName);
    return {
      ...baseProps,
      className: isChanged ? 'field-changed' : ''
    };
  };

  // Representatives columns
  const representativesColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => text || record.email,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => <a href={`mailto:${email}`}>{email}</a>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => role || record.role_input,
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
      render: (contact) => contact || 'N/A',
    },
    ...(isCompanyRole ? [{
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRepresentative(record.id)}
        >
          Delete
        </Button>
      ),
    }] : [])
  ];

  if (unauthorized) {
    return <Unauthorized />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!companyData) {
    return (
      <div style={{ padding: '24px' }}>
        <Text type="danger">Company not found</Text>
      </div>
    );
  }

  const renderActionButtons = () => {
    if (isEditMode) return null;

    return (
      <Space>
        
        {isSuperConsultant && companyData.onboarding_status === 'pending' && (
          <Button
            icon={<SendOutlined />}
            onClick={handleSendForApproval}
            loading={saving}
            color="black"
            variant="solid"
          >
            Send for Approval
          </Button>
        )}
        {isCompanyRole && companyData.onboarding_status === 'in_review' && (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleApprove}
            loading={saving}
          >
            Approve
          </Button>
        )}
      </Space>
    );
  };

  
  const ProfilePreview = () => {
    fetchProfilePreview();
    return (
        <div>
            {previewLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Loading preview...</div>
          </div>
        ) : (
            <div>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        key="download"
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={downloadProfileAsPDF}
                        disabled={previewLoading}
                        >
                        Download as PDF
                    </Button>
                </div>
                <div 
                    id="profile-preview-content"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                    style={{ 
                    // maxHeight: '55vh', 
                    // overflowY: 'auto',
                    // padding: '20px',
                    // backgroundColor: '#fff',
                    // overflowX: 'hidden',
                    // maxWidth: '1200px',
                    }}
                />
            </div>
        )}
        </div>
    )
    }

  const renderEditSaveButtons = () => {
    if (isEditMode) {
      return (
        <Space>
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            disabled={!hasChanges()}
            loading={saving}
            onClick={() => form.submit()}
          >
            Save
          </Button>
        </Space>
      );
    }

    if (canEdit()) {
      return (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => setIsEditMode(true)}
        >
          Edit
        </Button>
      );
    }

    return null;
  };

  const tabItems = [
    {
      key: 'details',
      label: 'Company Details',
      children: (
        <div>
          <style>
            {`
              .field-changed .ant-input,
              .field-changed .ant-input-number-input,
              .field-changed .ant-select-selector,
              .field-changed textarea {
                border-color: #52c41a !important;
                box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
              }
              
              .field-changed .ant-form-item-label > label::after {
                content: " ●";
                color: #52c41a;
                font-weight: bold;
              }
            `}
          </style>

            <div style={{ marginBottom: 0, display: 'flex', justifyContent: 'flex-end' }}>
              {renderEditSaveButtons()}
            </div>

          <Form
            style={{ width: '100%' }}
            form={form}
            layout="vertical"
            onFinish={handleSave}
            onValuesChange={handleFieldChange}
            initialValues={companyData}
            disabled={!isEditMode}
          >
            {/* Basic Information */}
            <BasicInformationSection 
              getFormItemProps={getFormItemProps}
            />

            {/* Contractual Information */}
            <ContractualInformationSection 
              getFormItemProps={getFormItemProps}
            />

            {/* Legal Information */}
            <LegalInformationSection 
              getFormItemProps={getFormItemProps}
              isEditMode={isEditMode}
              companyData={companyData}
              onFileChange={handleFileChange}
            />

            {/* IT Information */}
            <ITInformationSection 
              assets={assets}
              setAssets={setAssets}
              isEditMode={isEditMode}
              itemsToAdd={itemsToAdd}
              setItemsToAdd={setItemsToAdd}
              itemsToRemove={itemsToRemove}
              setItemsToRemove={setItemsToRemove}
              companyData={companyData}
              onFileChange={handleFileChange}
            />

            {/* Locations */}
            <LocationsSection 
              locations={locations}
              setLocations={setLocations}
              isEditMode={isEditMode}
              itemsToAdd={itemsToAdd}
              setItemsToAdd={setItemsToAdd}
              itemsToRemove={itemsToRemove}
              setItemsToRemove={setItemsToRemove}
            />

            {/* Other Information */}
            <OtherInformationSection 
              isEditMode={isEditMode}
              companyData={companyData}
              onFileChange={handleFileChange}
            />

            {/* Color Palette */}
            <ColorPaletteSection 
              colorPalette={colorPalette}
              setColorPalette={setColorPalette}
              isEditMode={isEditMode}
              itemsToAdd={itemsToAdd}
              setItemsToAdd={setItemsToAdd}
              itemsToRemove={itemsToRemove}
              setItemsToRemove={setItemsToRemove}
            />

            {/* Fonts */}
            <FontsSection 
              fonts={fonts}
              setFonts={setFonts}
              isEditMode={isEditMode}
              itemsToAdd={itemsToAdd}
              setItemsToAdd={setItemsToAdd}
              itemsToRemove={itemsToRemove}
              setItemsToRemove={setItemsToRemove}
            />

            {/* Clients */}
            <ClientsSection 
              clients={clients}
              setClients={setClients}
              isEditMode={isEditMode}
              itemsToAdd={itemsToAdd}
              setItemsToAdd={setItemsToAdd}
              itemsToRemove={itemsToRemove}
              setItemsToRemove={setItemsToRemove}
            />

            {/* Vendors */}
            <VendorsSection 
              vendors={vendors}
              setVendors={setVendors}
              isEditMode={isEditMode}
              itemsToAdd={itemsToAdd}
              setItemsToAdd={setItemsToAdd}
              itemsToRemove={itemsToRemove}
              setItemsToRemove={setItemsToRemove}
            />

            {/* Cloud Services */}
            <CloudServicesSection 
              cloudServices={cloudServices}
              setCloudServices={setCloudServices}
              isEditMode={isEditMode}
              itemsToAdd={itemsToAdd}
              setItemsToAdd={setItemsToAdd}
              itemsToRemove={itemsToRemove}
              setItemsToRemove={setItemsToRemove}
            />

            {/* Hidden submit button */}
            <Form.Item style={{ display: 'none' }}>
              <Button htmlType="submit" />
            </Form.Item>
          </Form>

          {/* Save buttons at bottom (only in edit mode) */}
          {isEditMode && (
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
              {renderEditSaveButtons()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'representatives',
      label: 'Company Representatives',
      children: (
        <div>
          {isCompanyRole && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddRepresentative}
              >
                Add Representative
              </Button>
            </div>
          )}

          <Table
            dataSource={representatives}
            columns={representativesColumns}
            loading={repsLoading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} representatives`,
            }}
            locale={{
              emptyText: 'No representatives found'
            }}
          />
        </div>
      ),
    },
    {
        key: 'profile',
        label: 'Profile',
        children: (
            <ProfilePreview/>
        )
    }
  ];

  return (
    <div style={{ padding: '24px', width:"100%", margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px',display:"flex" }}>
        {!isCompanyRole && 
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{
                borderRadius: '40px',
                height:"50px",
                width:"50px",
                marginRight:"20px",
              hover: {
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                color: '#fff',
              },
            }}
          >
          </Button>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-center',width:"100%" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {companyData.company_name || 'Company Details'}
            </Title>
            <Space style={{ marginTop: '2px',color:"gray"}}>
                Status: 
              <Tag color={
                companyData.onboarding_status === 'pending' ? 'orange' :
                companyData.onboarding_status === 'in_review' ? 'blue' :
                companyData.onboarding_status === 'completed' ? 'green' : 'default'
              }>
                {companyData.onboarding_status?.toUpperCase() || 'UNKNOWN'}
              </Tag>
            </Space>
          </div>

          <div style={{right:0}}>
            {renderActionButtons()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Add Representative Modal */}
      <Modal
        title="Add Company Representative"
        open={addRepModalVisible}
        onCancel={() => {
          setAddRepModalVisible(false);
          repForm.resetFields();
        }}
        onOk={() => repForm.submit()}
        okText="Add Representative"
        confirmLoading={addingRep}
        width={600}
      >
        <Form
          form={repForm}
          layout="vertical"
          onFinish={handleCreateRepresentative}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter representative name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="contact"
            label="Contact Number (Optional)"
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedRepId(null);
        }}
        okText="Yes, Delete"
        okButtonProps={{ danger: true }}
      >
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '22px' }} />
          <Text>Are you sure you want to delete this representative?</Text>
        </Space>
      </Modal>

    </div>
  );
};

export default CompanyDetail;
