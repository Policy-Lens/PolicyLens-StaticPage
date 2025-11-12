import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Row, Col, Divider, Typography } from 'antd';
import { getCurrencyOptions } from '../../../../utils/getMasterData';
import { debounce } from 'lodash';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ContractualInformationSection = ({ getFormItemProps }) => {
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  useEffect(() => {
    loadCurrencies('');
  }, []);

  const loadCurrencies = async (searchText) => {
    setLoadingCurrencies(true);
    try {
      const options = await getCurrencyOptions(searchText);
      setCurrencyOptions(options);
    } catch (error) {
      console.error('Error loading currencies:', error);
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const debouncedCurrencySearch = useCallback(
    debounce((value) => loadCurrencies(value), 350),
    []
  );

  return (
    <>
      <Title level={4} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%',
        marginBottom: '16px',
        marginTop:"36px"
      }}>
        Contractual Information
        <span style={{ 
          flex: 1, 
          height: '1px', 
          background: '#d9d9d9',
          marginLeft: '12px' 
        }}></span>
      </Title>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('bill_to_person_name')}
            name="bill_to_person_name"
            label="Bill to person name"
          >
            <Input placeholder="Enter person name" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('bill_to_department')}
            name="bill_to_department"
            label="Bill to department"
          >
            <Input placeholder="Enter department" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('billing_currency')}
            name="billing_currency"
            label="Billing currency"
          >
            <Select
              showSearch
              placeholder="Select currency"
              options={currencyOptions}
              loading={loadingCurrencies}
              onSearch={debouncedCurrencySearch}
              filterOption={false}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            {...getFormItemProps('billing_address')}
            name="billing_address"
            label="Billing address"
          >
            <TextArea rows={3} placeholder="Enter billing address" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default ContractualInformationSection;
