import React, { useEffect, useState, useContext } from 'react'
import { apiRequest } from '../../../utils/api'
import { Button, Flex, Typography, Table, Tag, Space, Modal, Form, Input, message, Badge, Spin } from 'antd'
import { AuthContext } from '../../../AuthContext'
import Unauthorized from '../../Common/Unauthorized'
const { Title } = Typography;

const CompanyList = () => {
    const [companies, setCompanies] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [form] = Form.useForm()
    const { user } = useContext(AuthContext)

    const [representativesModal, setRepresentativesModal] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [representatives, setRepresentatives] = useState([])
    const [repsLoading, setRepsLoading] = useState(false)

    const isSuperConsultant = user?.role === 'Super Consultant' || user?.role === undefined
    const isAdmin = user?.role === 'Admin'
    
    // Check if user has access - Only Admin and Super Consultant
    const hasAccess = isSuperConsultant || isAdmin

    const fetchCompanies = async () => {
        try {
            setIsLoading(true)
            const response = await apiRequest("GET", "/api/auth/companies/?company_type=client", null, true)
            if (response.status == 200) {
                setCompanies(response.data)
            }
            setIsLoading(false)
        } catch (error) {
            console.log(error)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (hasAccess) {
            fetchCompanies()
        }
    }, [hasAccess])

    // Show unauthorized if user doesn't have access
    if (!hasAccess) {
        return <Unauthorized />
    }

    const handleCreateCompany = async (values) => {
        setCreateLoading(true)
        try {
            const payload = {
                name: values.name,
                website: values.website,
                linkedin: values.linkedin,
                admin_name: values.admin_name,
                admin_email: values.admin_email,
                admin_contact: values.admin_contact
            }
            const response = await apiRequest("POST", "/api/auth/company/create/", payload, true)
            if (response.status === 201) {
                message.success(response.data.message || 'Company created successfully!')
                setIsModalOpen(false)
                form.resetFields()
                fetchCompanies()
            }
        } catch (error) {
            if (error.data?.admin_email) {
                message.error(error.data.admin_email[0])
            } else if (error.admin_email) {
                message.error(error.admin_email[0])
            } else {
                message.error('Failed to create company')
            }
        } finally {
            setCreateLoading(false)
        }
    }

    const handleViewRepresentatives = async (company) => {
        setSelectedCompany(company)
        setRepresentativesModal(true)
        setRepsLoading(true)
        try {
            const response = await apiRequest('GET', `/api/auth/companies/${company.id}/representatives/`, null, true)
            if (response.status === 200) {
                setRepresentatives(response.data || [])
            }
        } catch (error) {
            console.error('Error fetching representatives:', error)
            setRepresentatives([])
        } finally {
            setRepsLoading(false)
        }
    }

    const handleCompleteOnboarding = (company) => {
        // TODO: Implement onboarding completion logic
        message.info('Onboarding completion feature coming soon!')
    }

    const columns = [
        {
            title: 'Company Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span style={{ color: '#5B5FC7', fontWeight: 500 }}>{text}</span>,
        },
        {
            title: 'Contact Person Name',
            dataIndex: ['company_admin', 'name'],
            key: 'contact_person',
        },
        {
            title: 'Contact Email',
            dataIndex: ['company_admin', 'email'],
            key: 'contact_email',
        },
        {
            title: 'Created By',
            dataIndex: ['created_by', 'name'],
            key: 'created_by',
        },
        {
            title: 'Representatives',
            key: 'representatives',
            align: 'center',
            render: (_, record) => (
                record.representatives_count !== undefined ? (
                    <Badge count={record.representatives_count} style={{ backgroundColor: '#ff4d4f' }}>
                    <Button type="link" onClick={() => handleViewRepresentatives(record)}>
                    View
                </Button>
                    </Badge>
                ) : (
                    <Button type="link" onClick={() => handleViewRepresentatives(record)}>
                    View
                </Button>)
            ),
        },
        {
            title: 'Onboarding Status',
            dataIndex: 'onboarding_status',
            key: 'status',
            align: 'center',
            render: (status) => {
                const statusConfig = {
                    pending: { color: 'orange', text: 'PENDING' },
                    in_review: { color: 'blue', text: 'IN REVIEW' },
                    completed: { color: 'green', text: 'COMPLETED' }
                }
                const config = statusConfig[status] || { color: 'default', text: status?.toUpperCase() }
                return <Tag color={config.color}>{config.text}</Tag>
            },
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    {isSuperConsultant && record.onboarding_status==='completed' && <Button type="link" onClick={() => message.info("View Feature Coming Soon")}>
                        View
                    </Button>}
                    {isSuperConsultant && record.onboarding_status === 'pending' && (
                        <Badge dot color="red">
                            <Button type="primary" size="small" onClick={() => handleCompleteOnboarding(record)}>
                                Complete Onboarding
                            </Button>
                        </Badge>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Flex vertical style={{ padding: '24px' }}>
            <Flex style={{ marginBottom: '24px' }} justify="space-between" align="center">
                <Title level={3} style={{ margin: 0 }}>Companies</Title>
                {isSuperConsultant && (
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>
                        Add Company
                    </Button>
                )}
            </Flex>

            <Table
                columns={columns}
                dataSource={companies}
                loading={isLoading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} companies`,
                }}
            />

            {/* Representatives Modal */}
            <Modal
                title={`${selectedCompany?.name} - Representatives`}
                open={representativesModal}
                onCancel={() => {
                    setRepresentativesModal(false)
                    setSelectedCompany(null)
                    setRepresentatives([])
                }}
                footer={null}
                width={800}
            >
                {repsLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: '16px' }}>Loading representatives...</div>
                    </div>
                ) : representatives.length > 0 ? (
                    <Table
                        dataSource={representatives}
                        rowKey="id"
                        pagination={false}
                        columns={[
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
                        ]}
                    />
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No representatives found for this company.
                    </div>
                )}
            </Modal>

            {/* Create Company Modal */}
            <Modal
                title="Create New Company"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false)
                    form.resetFields()
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateCompany}
                    style={{ marginTop: '20px' }}
                >
                    <Form.Item
                        label="Company Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter company name' }]}
                    >
                        <Input placeholder="Enter company name" />
                    </Form.Item>

                    <Form.Item
                        label="Website"
                        name="website"
                        rules={[
                            { required: true, message: 'Please enter website' },
                            { type: 'url', message: 'Please enter a valid URL' }
                        ]}
                    >
                        <Input placeholder="https://www.example.com" />
                    </Form.Item>

                    <Form.Item
                        label="LinkedIn"
                        name="linkedin"
                        rules={[
                            { required: true, message: 'Please enter LinkedIn URL' },
                            { type: 'url', message: 'Please enter a valid URL' }
                        ]}
                    >
                        <Input placeholder="https://linkedin.com/company/example" />
                    </Form.Item>

                    <Form.Item
                        label="Contact Name"
                        name="admin_name"
                        rules={[{ required: true, message: 'Please enter contact name' }]}
                    >
                        <Input placeholder="Enter contact name" />
                    </Form.Item>

                    <Form.Item
                        label="Contact Email"
                        name="admin_email"
                        rules={[
                            { required: true, message: 'Please enter contact email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="contact@example.com" />
                    </Form.Item>

                    <Form.Item
                        label="Contact Number"
                        name="admin_contact"
                        rules={[{ required: true, message: 'Please enter contact number' }]}
                    >
                        <Input placeholder="+91xxxxxxxxxx" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setIsModalOpen(false)
                                form.resetFields()
                            }}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={createLoading}>
                                Create Company
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Flex>
    )
}

export default CompanyList