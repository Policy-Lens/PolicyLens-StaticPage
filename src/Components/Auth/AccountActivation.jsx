import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../utils/api'
import { 
    Card, Form, Input, Button, Typography, Alert, Spin, 
    Progress, Space, Row, Col 
} from 'antd'
import { 
    CheckCircleOutlined, CloseCircleOutlined, 
    LockOutlined, UserOutlined 
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

const AccountActivation = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [form] = Form.useForm()
    
    const [validating, setValidating] = useState(true)
    const [isValid, setIsValid] = useState(false)
    const [validationError, setValidationError] = useState(null)
    const [userData, setUserData] = useState(null)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)

    const uid = searchParams.get('uid')
    const token = searchParams.get('token')

    useEffect(() => {
        console.log("uid",uid,"token",token)
        if (uid && token) {
            validateToken()
        } else {
            setValidating(false)
            setValidationError('Invalid activation link')
        }
    }, [uid, token])

    const validateToken = async () => {
        setValidating(true)
        try {
            const response = await apiRequest(
                'POST', 
                '/api/auth/activate/validate/', 
                { uid, token },
                false
            )
            
            if (response.status === 200) {
                setIsValid(true)
                setUserData(response.data.user)
            }
        } catch (error) {
            setIsValid(false)
            if (error.data) {
                const data = error.data
                if (data.status === 'token_expired') {
                    setValidationError({
                        type: 'error',
                        title: data.error,
                        message: data.message
                    })
                } else if (data.status === 'password_already_set') {
                    setValidationError({
                        type: 'warning',
                        title: data.error,
                        message: data.message
                    })
                } else {
                    setValidationError({
                        type: 'error',
                        title: 'Invalid Token',
                        message: 'Please contact your consultant to resend the activation link'
                    })
                }
            }
        } finally {
            setValidating(false)
        }
    }

    const calculatePasswordStrength = (password) => {
        let strength = 0
        if (!password) return 0

        // Length check
        if (password.length >= 8) strength += 25
        if (password.length >= 12) strength += 25

        // Complexity checks
        if (/[a-z]/.test(password)) strength += 12.5
        if (/[A-Z]/.test(password)) strength += 12.5
        if (/[0-9]/.test(password)) strength += 12.5
        if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5

        return Math.min(100, strength)
    }

    const handlePasswordChange = (e) => {
        const password = e.target.value
        setPasswordStrength(calculatePasswordStrength(password))
    }

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 40) return '#ff4d4f'
        if (passwordStrength < 70) return '#faad14'
        return '#52c41a'
    }

    const getPasswordStrengthText = () => {
        if (passwordStrength < 40) return 'Weak'
        if (passwordStrength < 70) return 'Medium'
        return 'Strong'
    }

    const handleSetPassword = async (values) => {
        setSubmitLoading(true)
        try {
            const response = await apiRequest(
                'POST',
                '/api/auth/activate/set-password/',
                {
                    uid,
                    token,
                    password: values.password
                },
                false
            )

            if (response.status === 200) {
                // Store tokens
                localStorage.setItem('access_token', response.data.access)
                localStorage.setItem('refresh_token', response.data.refresh)
                
                // Show success message and redirect
                setTimeout(() => {
                    navigate('/home/dashboard')
                }, 2000)
            }
        } catch (error) {
            if (error.data?.token) {
                form.setFields([
                    {
                        name: 'token_error',
                        errors: [error.data.token[0]]
                    }
                ])
            } else if (error.data?.password) {
                form.setFields([
                    {
                        name: 'password',
                        errors: [error.data.password[0]]
                    }
                ])
            } else if (error.data?.error) {
                form.setFields([
                    {
                        name: 'general_error',
                        errors: [error.data.error[0]]
                    }
                ])
            }
        } finally {
            setSubmitLoading(false)
        }
    }

    if (validating) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                backgroundColor: '#f0f2f5'
            }}>
                <Card style={{ width: 400, textAlign: 'center' }}>
                    <Spin size="large" />
                    <Title level={4} style={{ marginTop: '20px' }}>
                        Validating your activation link...
                    </Title>
                </Card>
            </div>
        )
    }

    if (!isValid) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                backgroundColor: '#f0f2f5'
            }}>
                <Card style={{ width: 500, textAlign: 'center' }}>
                    <CloseCircleOutlined 
                        style={{ fontSize: '64px', color: validationError?.type === 'warning' ? '#faad14' : '#ff4d4f' }} 
                    />
                    <Title level={3} style={{ marginTop: '20px' }}>
                        {validationError?.title || 'Invalid Activation Link'}
                    </Title>
                    <Paragraph type="secondary">
                        {validationError?.message || 'The activation link is invalid or has expired.'}
                    </Paragraph>
                    <Button type="primary" onClick={() => navigate('/')}>
                        Go to Login
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            padding: '20px'
        }}>
            <Card style={{ width: 500 }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                    <Title level={3} style={{ marginTop: '16px', marginBottom: '8px' }}>
                        Account Activation
                    </Title>
                    <Text type="secondary">
                        Welcome, {userData?.name}! Set your password to activate your account.
                    </Text>
                </div>

                {userData && (
                    <Alert
                        message="Account Details"
                        description={
                            <div>
                                <div><strong>Name:</strong> {userData.name}</div>
                                <div><strong>Email:</strong> {userData.email}</div>
                                <div><strong>Role:</strong> {userData.role}</div>
                            </div>
                        }
                        type="info"
                        style={{ marginBottom: '24px' }}
                    />
                )}

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSetPassword}
                >
                    <Form.Item
                        label="Create Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Please enter your password' },
                            { min: 8, message: 'Password must be at least 8 characters' },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
                                message: 'Password must contain uppercase, lowercase, number, and special character'
                            }
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />}
                            placeholder="Enter your password"
                            onChange={handlePasswordChange}
                            size="large"
                        />
                    </Form.Item>

                    {passwordStrength > 0 && (
                        <div style={{ marginTop: '-16px', marginBottom: '24px' }}>
                            <Progress 
                                percent={passwordStrength} 
                                strokeColor={getPasswordStrengthColor()}
                                showInfo={false}
                                size="small"
                            />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                Password Strength: <span style={{ color: getPasswordStrengthColor() }}>
                                    {getPasswordStrengthText()}
                                </span>
                            </Text>
                        </div>
                    )}

                    <Form.Item
                        label="Confirm Password"
                        name="confirm_password"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('Passwords do not match'))
                                },
                            }),
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />}
                            placeholder="Confirm your password"
                            size="large"
                        />
                    </Form.Item>

                    <Alert
                        message="Password Requirements"
                        description={
                            <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '12px' }}>
                                <li>At least 8 characters long</li>
                                <li>Contains uppercase and lowercase letters</li>
                                <li>Contains at least one number</li>
                                <li>Contains at least one special character (@$!%*?&#)</li>
                            </ul>
                        }
                        type="info"
                        style={{ marginBottom: '24px' }}
                    />

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={submitLoading}
                            block
                            size="large"
                        >
                            Activate Account & Set Password
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default AccountActivation
