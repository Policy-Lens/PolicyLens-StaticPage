import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Row, Col, Typography, Divider } from 'antd';
import { getCountryOptions,getCurrencyOptions } from '../../../../utils/getMasterData';
import { debounce } from 'lodash';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const BasicInformationSection = ({ getFormItemProps }) => {
  const [countryOptions, setCountryOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  // Load initial options
  useEffect(() => {
    loadCountries('');
    loadCurrencies('');
  }, []);

  const loadCountries = async (searchText) => {
    setLoadingCountries(true);
    try {
      const options = await getCountryOptions(searchText);
      setCountryOptions(options);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  };

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

  // Debounced search functions
  const debouncedCountrySearch = useCallback(
    debounce((value) => loadCountries(value), 350),
    []
  );

  const debouncedCurrencySearch = useCallback(
    debounce((value) => loadCurrencies(value), 350),
    []
  );

  return (
    <>
      <Title level={4} style={{ 
        display: 'flex', 
        alignItems: 'center',
        fontWeight: 600,
        marginBottom: '16px',
      }}>
        Basic Information
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
            {...getFormItemProps('company_name')}
            name="company_name"
            label="Legal Name of the Company"
          >
            <Input placeholder="Enter legal name" disabled />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('company_website')}
            name="company_website"
            label="Website"
          >
            <Input placeholder="Enter website" disabled />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('company_linkedin')}
            name="company_linkedin"
            label="LinkedIn"
          >
            <Input placeholder="Enter LinkedIn URL" disabled />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('company_brands')}
            name="company_brands"
            label="Company Brands"
          >
            <Input placeholder="Enter company brands" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('company_aliases')}
            name="company_aliases"
            label="Company Aliases"
          >
            <Input placeholder="Enter company aliases" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('hq_country')}
            name="hq_country"
            label="HQ Country"
          >
            <Select
              showSearch
              placeholder="Select country"
              options={countryOptions}
              loading={loadingCountries}
              onSearch={debouncedCountrySearch}
              filterOption={false}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('hq_city')}
            name="hq_city"
            label="HQ City"
          >
            <Input placeholder="Enter city" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('hq_zipcode')}
            name="hq_zipcode"
            label="HQ Zip Code"
          >
            <Input placeholder="Enter zip code" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('reporting_currency')}
            name="reporting_currency"
            label="Reporting Currency (RC)"
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
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('additional_locations')}
            name="additional_locations"
            label="Additional # locations"
          >
            <Input placeholder="Enter number" type="number" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('year_of_inception')}
            name="year_of_inception"
            label="Company year of inception"
          >
            <Input placeholder="Select year" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('company_revenue')}
            name="company_revenue"
            label="Company Revenue (in RC)"
          >
            <Input placeholder="Enter revenue" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('company_abbreviation')}
            name="company_abbreviation"
            label="Company abbreviation"
          >
            <Input placeholder="Enter abbreviation" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('company_headcount')}
            name="company_headcount"
            label="Company Headcount"
          >
            <Input placeholder="Enter headcount" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            {...getFormItemProps('about_company')}
            name="about_company"
            label="About company"
          >
            <TextArea rows={4} placeholder="Enter company description" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default BasicInformationSection;
