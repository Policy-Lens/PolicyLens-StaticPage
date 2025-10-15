import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { Save, Upload, Building2, User, Mail, Phone, Globe, Linkedin, MapPin, Calendar, Users, DollarSign, FileText, CheckCircle } from 'lucide-react';

const ServiceRequirementsForm = ({ stepId, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Company Information
    legalName: '',
    contactName: '',
    contactNumber: '',
    contactEmail: '',
    website: '',
    linkedin: '',
    
    // Location Information
    hqCity: '',
    hqCountry: '',
    hqZipCode: '',
    
    // Company Details
    aboutCompany: '',
    companyRevenue: '',
    companyHeadcount: '',
    companyYearOfInception: '',
    companyLinesOfBusiness: '',
    companyBrands: '',
    productsAndServices: '',
    companyLocations: '',
    companyExistingCompliances: '',
    
    // Business Information
    companyIndustry: '',
    companySubsector: '',
    requirementForService: '',
    descriptionOfEnquiry: '',
    compliancesInScope: '',
    expectedCompletionTimeline: '',
    goNoGo: ''
  });

  const [loading, setLoading] = useState(false);
  const [autoFetching, setAutoFetching] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const autoFetchFromWebsite = async () => {
    if (!formData.website) {
      message.warning('Please enter a website URL first');
      return;
    }

    setAutoFetching(true);
    try {
      // Simulate API call to fetch company data from website
      // In real implementation, this would call a backend service
      message.info('Auto-fetching company data from website...');
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data - in real implementation, this would come from the API
      const mockData = {
        hqCity: 'Mumbai',
        hqCountry: 'India',
        aboutCompany: 'Leading technology company specializing in software solutions',
        companyRevenue: '50',
        companyHeadcount: '500',
        companyYearOfInception: '2010',
        companyLinesOfBusiness: 'Software Development, Consulting',
        companyBrands: 'TechCorp, InnovateLab',
        productsAndServices: 'Enterprise Software, Cloud Solutions, AI Services',
        companyLocations: 'Mumbai, Bangalore, Delhi',
        companyExistingCompliances: 'ISO 9001, SOC 2'
      };

      setFormData(prev => ({ ...prev, ...mockData }));
      message.success('Company data fetched successfully!');
    } catch (error) {
      message.error('Failed to fetch company data');
    } finally {
      setAutoFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate required fields
      const requiredFields = ['legalName', 'contactName', 'contactEmail', 'requirementForService', 'descriptionOfEnquiry'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        message.error(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Save data
      await onSave(formData);
      message.success('Service requirements saved successfully!');
    } catch (error) {
      message.error('Failed to save service requirements');
    } finally {
      setLoading(false);
    }
  };

  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 
    'Education', 'Government', 'Non-Profit', 'Energy', 'Telecommunications'
  ];

  const serviceOptions = [
    'ISO 27001 Implementation',
    'ISO 27001 Certification',
    'SOC 2 Compliance',
    'GDPR Compliance',
    'Risk Assessment',
    'Security Audit',
    'Policy Development',
    'Training & Awareness'
  ];

  const complianceOptions = [
    'ISO 27001', 'SOC 2', 'GDPR', 'HIPAA', 'PCI DSS', 
    'NIST CSF', 'COBIT', 'ISO 20000', 'ISO 22301'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Building2 className="mr-2 text-blue-600" />
          Service Requirements
        </h2>
        <p className="text-gray-600">Fill in the company and service requirement details</p>
      </div>

      <div className="space-y-8">
        {/* Company Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Building2 className="mr-2 text-blue-600" />
            Company Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Legal Name of the Company *
              </label>
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => handleInputChange('legalName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company legal name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter contact number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter contact email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="flex">
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://company.com"
                />
                <button
                  type="button"
                  onClick={autoFetchFromWebsite}
                  disabled={autoFetching || !formData.website}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {autoFetching ? 'Fetching...' : 'Auto-fetch'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/company/company"
              />
            </div>
          </div>
        </div>

        {/* Location Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="mr-2 text-green-600" />
            Location Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HQ City
              </label>
              <input
                type="text"
                value={formData.hqCity}
                onChange={(e) => handleInputChange('hqCity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter headquarters city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HQ Country
              </label>
              <input
                type="text"
                value={formData.hqCountry}
                onChange={(e) => handleInputChange('hqCountry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter headquarters country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HQ Zip Code
              </label>
              <input
                type="text"
                value={formData.hqZipCode}
                onChange={(e) => handleInputChange('hqZipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter zip code"
              />
            </div>
          </div>
        </div>

        {/* Company Details Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="mr-2 text-purple-600" />
            Company Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Company
              </label>
              <textarea
                value={formData.aboutCompany}
                onChange={(e) => handleInputChange('aboutCompany', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the company and its business"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Revenue (mUSD)
                </label>
                <input
                  type="number"
                  value={formData.companyRevenue}
                  onChange={(e) => handleInputChange('companyRevenue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter revenue in millions USD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Headcount
                </label>
                <input
                  type="number"
                  value={formData.companyHeadcount}
                  onChange={(e) => handleInputChange('companyHeadcount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of employees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Year of Inception
                </label>
                <input
                  type="number"
                  value={formData.companyYearOfInception}
                  onChange={(e) => handleInputChange('companyYearOfInception', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter year of establishment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Industry
                </label>
                <select
                  value={formData.companyIndustry}
                  onChange={(e) => handleInputChange('companyIndustry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Industry</option>
                  {industryOptions.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Lines of Business
              </label>
              <input
                type="text"
                value={formData.companyLinesOfBusiness}
                onChange={(e) => handleInputChange('companyLinesOfBusiness', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lines of business"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Products and Services
              </label>
              <textarea
                value={formData.productsAndServices}
                onChange={(e) => handleInputChange('productsAndServices', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe products and services offered"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Locations
              </label>
              <input
                type="text"
                value={formData.companyLocations}
                onChange={(e) => handleInputChange('companyLocations', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter all company locations"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Existing Compliances
              </label>
              <input
                type="text"
                value={formData.companyExistingCompliances}
                onChange={(e) => handleInputChange('companyExistingCompliances', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter existing compliance certifications"
              />
            </div>
          </div>
        </div>

        {/* Service Requirements Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="mr-2 text-orange-600" />
            Service Requirements
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirement for Service *
              </label>
              <select
                value={formData.requirementForService}
                onChange={(e) => handleInputChange('requirementForService', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Service Requirement</option>
                {serviceOptions.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description of Enquiry *
              </label>
              <textarea
                value={formData.descriptionOfEnquiry}
                onChange={(e) => handleInputChange('descriptionOfEnquiry', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the service enquiry in detail"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compliances in Scope
              </label>
              <select
                value={formData.compliancesInScope}
                onChange={(e) => handleInputChange('compliancesInScope', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Compliance</option>
                {complianceOptions.map(compliance => (
                  <option key={compliance} value={compliance}>{compliance}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Completion Timeline
              </label>
              <input
                type="text"
                value={formData.expectedCompletionTimeline}
                onChange={(e) => handleInputChange('expectedCompletionTimeline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3 months, 6 months, 1 year"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Go / No-go Decision
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="goNoGo"
                    value="go"
                    checked={formData.goNoGo === 'go'}
                    onChange={(e) => handleInputChange('goNoGo', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-green-600 font-medium">Go</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="goNoGo"
                    value="no-go"
                    checked={formData.goNoGo === 'no-go'}
                    onChange={(e) => handleInputChange('goNoGo', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">No-go</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save className="mr-2" />
            {loading ? 'Saving...' : 'Save Service Requirements'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequirementsForm;
