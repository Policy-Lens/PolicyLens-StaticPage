import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { Save, FileText, Upload, Building2, User, Calendar, DollarSign, Shield, PenTool } from 'lucide-react';

const FinalizeContractForm = ({ stepId, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Document Information
    companyLogo: null,
    consultantLogo: null,
    documentClassification: 'Confidential',
    documentTitle: 'STATEMENT of WORK - CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT (SOW – NDA)',
    
    // Contract Details
    effectiveDate: '',
    consultantLegalName: '',
    consultantPAN: '',
    consultantGSTN: '',
    companyLegalName: '',
    companyPAN: '',
    companyGSTN: '',
    
    // Payment Terms
    serviceFee: '',
    serviceFeeInWords: '',
    taxBearing: 'Client',
    excludeCertifyingBody: true,
    reimburseExpenses: true,
    invoiceDate: 'Last business day of every month',
    creditPeriod: '10 calendar days',
    
    // Duration
    agreementDuration: '',
    
    // Billing Details
    billToAddress: '',
    billToContact: '',
    billToEmail: '',
    
    // Signatures
    companySignatory: '',
    companySignatoryTitle: '',
    consultantSignatory: '',
    consultantSignatoryTitle: '',
    
    // Scope of Service
    scopeOfService: ''
  });

  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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

  const handleFileUpload = (field, file) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
      message.success(`${field === 'companyLogo' ? 'Company' : 'Consultant'} logo uploaded successfully!`);
    }
  };

  const convertNumberToWords = (num) => {
    // Simple number to words conversion for Indian currency
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convertNumberToWords(num % 100) : '');
    if (num < 100000) return convertNumberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convertNumberToWords(num % 1000) : '');
    if (num < 10000000) return convertNumberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convertNumberToWords(num % 100000) : '');
    return convertNumberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convertNumberToWords(num % 10000000) : '');
  };

  const handleFeeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      serviceFee: value,
      serviceFeeInWords: value ? convertNumberToWords(parseInt(value)) + ' Rupees Only' : ''
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate required fields
      const requiredFields = [
        'effectiveDate', 'consultantLegalName', 'consultantPAN', 'consultantGSTN',
        'companyLegalName', 'companyPAN', 'companyGSTN', 'serviceFee', 'agreementDuration'
      ];
      
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        message.error(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Save data
      await onSave(formData);
      message.success('Contract finalized successfully!');
    } catch (error) {
      message.error('Failed to save contract');
    } finally {
      setLoading(false);
    }
  };

  const generateContractPreview = () => {
    return `
STATEMENT of WORK - CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT (SOW – NDA)

This Agreement for rendering Services ("Agreement") is made and executed on ${formData.effectiveDate || '[Date]'} between:

${formData.consultantLegalName || '[Consultant Legal Name]'}
(PAN: ${formData.consultantPAN || '[PAN]'} / GSTN: ${formData.consultantGSTN || '[GSTN]'})
(Hereafter "Service Provider")

and

${formData.companyLegalName || '[Company Legal Name]'}
(PAN: ${formData.companyPAN || '[PAN]'} / GSTN: ${formData.companyGSTN || '[GSTN]'})
(Hereafter "Client")

CLAUSE 1. SERVICES
A) Service provider shall perform the professional services ("Services") as described in Exhibit A - Scope of Service attached hereto.
B) Service provider shall at all times comply with all applicable laws, regulations, rules, relevant applicable to Service provider's provision of the Services.
C) Client shall ensure that Service provider has provided necessary resources for effectively discharge services.

CLAUSE 2. PAYMENT TERMS
Service provider will be paid Rs. ${formData.serviceFee || '[Amount]'}/- (${formData.serviceFeeInWords || '[Amount in Words]'}) + taxes per month for services rendered as per Exhibit A from effective date.

CLAUSE 3. DURATION OF AGREEMENT
This Agreement is valid for a period of ${formData.agreementDuration || '[Duration]'} days from the effective date.

[Additional clauses as per standard contract template...]
    `;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <FileText className="mr-2 text-blue-600" />
          Finalize Contract
        </h2>
        <p className="text-gray-600">Complete the contract details and generate the final agreement</p>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
        >
          <FileText className="mr-2" />
          {previewMode ? 'Edit Mode' : 'Preview Mode'}
        </button>
      </div>

      {previewMode ? (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contract Preview</h3>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {generateContractPreview()}
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Document Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2 text-blue-600" />
              Document Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('companyLogo', e.target.files[0])}
                    className="hidden"
                    id="company-logo"
                  />
                  <label htmlFor="company-logo" className="cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload company logo</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultant Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('consultantLogo', e.target.files[0])}
                    className="hidden"
                    id="consultant-logo"
                  />
                  <label htmlFor="consultant-logo" className="cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload consultant logo</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Classification
                </label>
                <select
                  value={formData.documentClassification}
                  onChange={(e) => handleInputChange('documentClassification', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Confidential">Confidential</option>
                  <option value="Internal">Internal</option>
                  <option value="Public">Public</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={formData.documentTitle}
                  onChange={(e) => handleInputChange('documentTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contract Parties Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building2 className="mr-2 text-green-600" />
              Contract Parties
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Consultant Details */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-md font-medium text-gray-700 mb-3">Service Provider (Consultant)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Legal Name *
                    </label>
                    <input
                      type="text"
                      value={formData.consultantLegalName}
                      onChange={(e) => handleInputChange('consultantLegalName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter consultant legal name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number *
                    </label>
                    <input
                      type="text"
                      value={formData.consultantPAN}
                      onChange={(e) => handleInputChange('consultantPAN', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter PAN number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GSTN *
                    </label>
                    <input
                      type="text"
                      value={formData.consultantGSTN}
                      onChange={(e) => handleInputChange('consultantGSTN', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter GSTN"
                    />
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-md font-medium text-gray-700 mb-3">Client (Company)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Legal Name *
                    </label>
                    <input
                      type="text"
                      value={formData.companyLegalName}
                      onChange={(e) => handleInputChange('companyLegalName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company legal name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number *
                    </label>
                    <input
                      type="text"
                      value={formData.companyPAN}
                      onChange={(e) => handleInputChange('companyPAN', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter PAN number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GSTN *
                    </label>
                    <input
                      type="text"
                      value={formData.companyGSTN}
                      onChange={(e) => handleInputChange('companyGSTN', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter GSTN"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date *
              </label>
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment Terms Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <DollarSign className="mr-2 text-yellow-600" />
              Payment Terms
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Fee (Rs.) *
                </label>
                <input
                  type="number"
                  value={formData.serviceFee}
                  onChange={(e) => handleFeeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service fee amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Fee in Words
                </label>
                <input
                  type="text"
                  value={formData.serviceFeeInWords}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  placeholder="Auto-generated from amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Bearing Party
                </label>
                <select
                  value={formData.taxBearing}
                  onChange={(e) => handleInputChange('taxBearing', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Client">Client</option>
                  <option value="Service Provider">Service Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agreement Duration (Days) *
                </label>
                <input
                  type="number"
                  value={formData.agreementDuration}
                  onChange={(e) => handleInputChange('agreementDuration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter duration in days"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.excludeCertifyingBody}
                  onChange={(e) => handleInputChange('excludeCertifyingBody', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Exclude certifying body costs</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.reimburseExpenses}
                  onChange={(e) => handleInputChange('reimburseExpenses', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Reimburse out-of-pocket expenses</span>
              </label>
            </div>
          </div>

          {/* Billing Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="mr-2 text-purple-600" />
              Billing Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill To Address
                </label>
                <textarea
                  value={formData.billToAddress}
                  onChange={(e) => handleInputChange('billToAddress', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter billing address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill To Contact
                  </label>
                  <input
                    type="text"
                    value={formData.billToContact}
                    onChange={(e) => handleInputChange('billToContact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter contact person"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill To Email
                  </label>
                  <input
                    type="email"
                    value={formData.billToEmail}
                    onChange={(e) => handleInputChange('billToEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter billing email"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Signatures Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <PenTool className="mr-2 text-indigo-600" />
              Signatures
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Company Signatory</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signatory Name
                    </label>
                    <input
                      type="text"
                      value={formData.companySignatory}
                      onChange={(e) => handleInputChange('companySignatory', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter signatory name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signatory Title
                    </label>
                    <input
                      type="text"
                      value={formData.companySignatoryTitle}
                      onChange={(e) => handleInputChange('companySignatoryTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter signatory title"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Consultant Signatory</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signatory Name
                    </label>
                    <input
                      type="text"
                      value={formData.consultantSignatory}
                      onChange={(e) => handleInputChange('consultantSignatory', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter signatory name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signatory Title
                    </label>
                    <input
                      type="text"
                      value={formData.consultantSignatoryTitle}
                      onChange={(e) => handleInputChange('consultantSignatoryTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter signatory title"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scope of Service Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="mr-2 text-red-600" />
              Scope of Service
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consulting Service Description
              </label>
              <textarea
                value={formData.scopeOfService}
                onChange={(e) => handleInputChange('scopeOfService', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the consulting services to be provided..."
              />
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
              {loading ? 'Saving...' : 'Finalize Contract'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalizeContractForm;
