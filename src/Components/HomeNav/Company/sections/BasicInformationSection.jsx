import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Select, Row, Col, Typography, Divider } from "antd";
import {
  getCountryOptions,
  getCurrencyOptions,
} from "../../../../utils/getMasterData";
import { apiRequest } from "../../../../utils/api";
import { debounce } from "lodash";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const BasicInformationSection = ({ getFormItemProps, form }) => {
  const [countryOptions, setCountryOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [sectorOptions, setSectorOptions] = useState([]);
  const [industryGroupOptions, setIndustryGroupOptions] = useState([]);
  const [industryOptions, setIndustryOptions] = useState([]);
  const [subIndustryOptions, setSubIndustryOptions] = useState([]);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingIndustryGroups, setLoadingIndustryGroups] = useState(false);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [loadingSubIndustries, setLoadingSubIndustries] = useState(false);

  // Load initial options
  useEffect(() => {
    loadCountries("");
    loadCurrencies("");
    loadSectors();
  }, []);

  // Watch for field changes to load dependent options
  useEffect(() => {
    const sector = form?.getFieldValue("sector");
    const industryGroup = form?.getFieldValue("industry_group");
    const industry = form?.getFieldValue("industry");

    if (sector) {
      loadIndustryGroups(sector);
    }
    if (industryGroup) {
      loadIndustries(industryGroup);
    }
    if (industry) {
      loadSubIndustries(industry);
    }
  }, []);

  const loadCountries = async (searchText) => {
    setLoadingCountries(true);
    try {
      const options = await getCountryOptions(searchText);
      setCountryOptions(options);
    } catch (error) {
      console.error("Error loading countries:", error);
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
      console.error("Error loading currencies:", error);
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

  // Load sectors from GICS
  const loadSectors = async () => {
    setLoadingSectors(true);
    try {
      const response = await apiRequest(
        "GET",
        "/api/policylens/gics/?page_size=1000",
        null,
        true
      );
      const gicsData = response.data?.results || [];
      const uniqueSectors = [...new Set(gicsData.map((item) => item.sector))]
        .filter(Boolean)
        .sort();
      setSectorOptions(
        uniqueSectors.map((sector) => ({ label: sector, value: sector }))
      );
    } catch (error) {
      console.error("Error loading sectors:", error);
    } finally {
      setLoadingSectors(false);
    }
  };

  // Load industry groups based on sector
  const loadIndustryGroups = async (sector) => {
    if (!sector) {
      setIndustryGroupOptions([]);
      return;
    }
    setLoadingIndustryGroups(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/policylens/gics/?sector=${encodeURIComponent(
          sector
        )}&page_size=1000`,
        null,
        true
      );
      const gicsData = response.data?.results || [];
      const uniqueGroups = [
        ...new Set(gicsData.map((item) => item.industry_group)),
      ]
        .filter(Boolean)
        .sort();
      setIndustryGroupOptions(
        uniqueGroups.map((group) => ({ label: group, value: group }))
      );
    } catch (error) {
      console.error("Error loading industry groups:", error);
    } finally {
      setLoadingIndustryGroups(false);
    }
  };

  // Load industries based on industry group
  const loadIndustries = async (industryGroup) => {
    if (!industryGroup) {
      setIndustryOptions([]);
      return;
    }
    setLoadingIndustries(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/policylens/gics/?industry_group=${encodeURIComponent(
          industryGroup
        )}&page_size=1000`,
        null,
        true
      );
      const gicsData = response.data?.results || [];
      const uniqueIndustries = [
        ...new Set(gicsData.map((item) => item.industry)),
      ]
        .filter(Boolean)
        .sort();
      setIndustryOptions(
        uniqueIndustries.map((industry) => ({
          label: industry,
          value: industry,
        }))
      );
    } catch (error) {
      console.error("Error loading industries:", error);
    } finally {
      setLoadingIndustries(false);
    }
  };

  // Load sub-industries based on industry
  const loadSubIndustries = async (industry) => {
    if (!industry) {
      setSubIndustryOptions([]);
      return;
    }
    setLoadingSubIndustries(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/policylens/gics/?industry=${encodeURIComponent(
          industry
        )}&page_size=1000`,
        null,
        true
      );
      const gicsData = response.data?.results || [];
      const uniqueSubIndustries = [
        ...new Set(gicsData.map((item) => item.sub_industry)),
      ]
        .filter(Boolean)
        .sort();
      setSubIndustryOptions(
        uniqueSubIndustries.map((subIndustry) => ({
          label: subIndustry,
          value: subIndustry,
        }))
      );
    } catch (error) {
      console.error("Error loading sub-industries:", error);
    } finally {
      setLoadingSubIndustries(false);
    }
  };

  // Handle sector change
  const handleSectorChange = (value) => {
    form?.setFieldsValue({
      industry_group: undefined,
      industry: undefined,
      sub_industry: undefined,
    });
    setIndustryGroupOptions([]);
    setIndustryOptions([]);
    setSubIndustryOptions([]);
    if (value) loadIndustryGroups(value);
  };

  // Handle industry group change
  const handleIndustryGroupChange = (value) => {
    form?.setFieldsValue({
      industry: undefined,
      sub_industry: undefined,
    });
    setIndustryOptions([]);
    setSubIndustryOptions([]);
    if (value) loadIndustries(value);
  };

  // Handle industry change
  const handleIndustryChange = (value) => {
    form?.setFieldsValue({ sub_industry: undefined });
    setSubIndustryOptions([]);
    if (value) loadSubIndustries(value);
  };

  // Handle dropdown open events
  const handleIndustryGroupDropdownOpen = (open) => {
    if (open) {
      const sector = form?.getFieldValue("sector");
      if (sector && industryGroupOptions.length === 0) {
        loadIndustryGroups(sector);
      }
    }
  };

  const handleIndustryDropdownOpen = (open) => {
    if (open) {
      const industryGroup = form?.getFieldValue("industry_group");
      if (industryGroup && industryOptions.length === 0) {
        loadIndustries(industryGroup);
      }
    }
  };

  const handleSubIndustryDropdownOpen = (open) => {
    if (open) {
      const industry = form?.getFieldValue("industry");
      if (industry && subIndustryOptions.length === 0) {
        loadSubIndustries(industry);
      }
    }
  };

  return (
    <>
      <Title
        level={4}
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: 600,
          marginBottom: "16px",
        }}
      >
        Basic Information
        <span
          style={{
            flex: 1,
            height: "1px",
            background: "#d9d9d9",
            marginLeft: "12px",
          }}
        ></span>
      </Title>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("company_name")}
            name="company_name"
            label="Legal Name of the Company"
          >
            <Input placeholder="Enter legal name" disabled />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("company_website")}
            name="company_website"
            label="Website"
          >
            <Input placeholder="Enter website" disabled />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("company_linkedin")}
            name="company_linkedin"
            label="LinkedIn"
          >
            <Input placeholder="Enter LinkedIn URL" disabled />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("company_brands")}
            name="company_brands"
            label="Company Brands"
          >
            <Input placeholder="Enter company brands" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("company_aliases")}
            name="company_aliases"
            label="Company Aliases"
          >
            <Input placeholder="Enter company aliases" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("hq_country")}
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
            {...getFormItemProps("hq_city")}
            name="hq_city"
            label="HQ City"
          >
            <Input placeholder="Enter city" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("hq_zipcode")}
            name="hq_zipcode"
            label="HQ Zip Code"
          >
            <Input placeholder="Enter zip code" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("reporting_currency")}
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
            {...getFormItemProps("additional_locations")}
            name="additional_locations"
            label="Additional # locations"
          >
            <Input placeholder="Enter number" type="number" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("year_of_inception")}
            name="year_of_inception"
            label="Company year of inception"
          >
            <Input placeholder="Select year" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("company_revenue")}
            name="company_revenue"
            label="Company Revenue (in RC)"
          >
            <Input placeholder="Enter revenue" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("company_abbreviation")}
            name="company_abbreviation"
            label="Company abbreviation"
          >
            <Input placeholder="Enter abbreviation" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("company_headcount")}
            name="company_headcount"
            label="Company Headcount"
          >
            <Input placeholder="Enter headcount" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("sector")}
            name="sector"
            label="Sector"
          >
            <Select
              showSearch
              placeholder="Select sector"
              options={sectorOptions}
              loading={loadingSectors}
              onChange={handleSectorChange}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("industry_group")}
            name="industry_group"
            label="Industry Group"
          >
            <Select
              showSearch
              placeholder="Select industry group"
              options={industryGroupOptions}
              loading={loadingIndustryGroups}
              onChange={handleIndustryGroupChange}
              onDropdownVisibleChange={handleIndustryGroupDropdownOpen}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("industry")}
            name="industry"
            label="Industry"
          >
            <Select
              showSearch
              placeholder="Select industry"
              options={industryOptions}
              loading={loadingIndustries}
              onChange={handleIndustryChange}
              onDropdownVisibleChange={handleIndustryDropdownOpen}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps("sub_industry")}
            name="sub_industry"
            label="Sub-Industry"
          >
            <Select
              showSearch
              placeholder="Select sub-industry"
              options={subIndustryOptions}
              loading={loadingSubIndustries}
              onDropdownVisibleChange={handleSubIndustryDropdownOpen}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            {...getFormItemProps("about_company")}
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
