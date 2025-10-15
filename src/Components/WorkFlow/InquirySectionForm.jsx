import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { Save, MapPin, FileText, CheckCircle, Plus, Trash2 } from 'lucide-react';

const InquirySectionForm = ({ stepId, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState({
    scope: '',
    companyDocuments: [],
    scopeOfServices: [],
    locations: []
  });

  const [loading, setLoading] = useState(false);
  const [newLocation, setNewLocation] = useState({
    country: '',
    city: '',
    address: '',
    contactPerson: '',
    contactNumber: '',
    contactEmail: ''
  });

  const [newDocument, setNewDocument] = useState({
    name: '',
    type: '',
    description: '',
    required: false
  });

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

  const addLocation = () => {
    if (!newLocation.country || !newLocation.city) {
      message.warning('Please fill in country and city');
      return;
    }

    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, { ...newLocation, id: Date.now() }]
    }));

    setNewLocation({
      country: '',
      city: '',
      address: '',
      contactPerson: '',
      contactNumber: '',
      contactEmail: ''
    });
    message.success('Location added successfully!');
  };

  const removeLocation = (id) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== id)
    }));
    message.success('Location removed successfully!');
  };

  const addDocument = () => {
    if (!newDocument.name || !newDocument.type) {
      message.warning('Please fill in document name and type');
      return;
    }

    setFormData(prev => ({
      ...prev,
      companyDocuments: [...prev.companyDocuments, { ...newDocument, id: Date.now() }]
    }));

    setNewDocument({
      name: '',
      type: '',
      description: '',
      required: false
    });
    message.success('Document added successfully!');
  };

  const removeDocument = (id) => {
    setFormData(prev => ({
      ...prev,
      companyDocuments: prev.companyDocuments.filter(doc => doc.id !== id)
    }));
    message.success('Document removed successfully!');
  };

  const toggleService = (service) => {
    setFormData(prev => ({
      ...prev,
      scopeOfServices: prev.scopeOfServices.includes(service)
        ? prev.scopeOfServices.filter(s => s !== service)
        : [...prev.scopeOfServices, service]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.scope) {
        message.error('Please provide the scope of work');
        return;
      }

      if (formData.locations.length === 0) {
        message.error('Please add at least one location');
        return;
      }

      if (formData.scopeOfServices.length === 0) {
        message.error('Please select at least one service');
        return;
      }

      // Save data
      await onSave(formData);
      message.success('Inquiry section saved successfully!');
    } catch (error) {
      message.error('Failed to save inquiry section');
    } finally {
      setLoading(false);
    }
  };

  const serviceOptions = [
    'Implementation',
    'Independent Assessment',
    'Independent Testing',
    'Internal Audit',
    'Subject Matter Consulting',
    'End-to-End ISO certification',
    'Continuous compliance support',
    'Acting CISO / DPO'
  ];

  const documentTypes = [
    'Policy Document',
    'Procedure Document',
    'Technical Specification',
    'Organizational Chart',
    'Risk Assessment',
    'Audit Report',
    'Compliance Certificate',
    'Other'
  ];

  const countries = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'Singapore', 'United Arab Emirates'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <FileText className="mr-2 text-green-600" />
          Inquiry Section
        </h2>
        <p className="text-gray-600">Define the scope, locations, and services for the project</p>
      </div>

      <div className="space-y-8">
        {/* Scope Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="mr-2 text-blue-600" />
            Project Scope
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scope of Work *
            </label>
            <textarea
              value={formData.scope}
              onChange={(e) => handleInputChange('scope', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the detailed scope of work for this project..."
            />
          </div>
        </div>

        {/* Locations Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="mr-2 text-purple-600" />
            Project Locations
          </h3>
          
          {/* Add New Location Form */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">Add New Location</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  value={newLocation.country}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={newLocation.city}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={newLocation.contactPerson}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, contactPerson: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={newLocation.contactNumber}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, contactNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={newLocation.contactEmail}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact email"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={addLocation}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="mr-2" />
                Add Location
              </button>
            </div>
          </div>

          {/* Existing Locations */}
          {formData.locations.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Added Locations</h4>
              <div className="space-y-3">
                {formData.locations.map((location) => (
                  <div key={location.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{location.city}, {location.country}</h5>
                        {location.address && <p className="text-sm text-gray-600">{location.address}</p>}
                        {location.contactPerson && (
                          <p className="text-sm text-gray-600">
                            Contact: {location.contactPerson} | {location.contactNumber} | {location.contactEmail}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeLocation(location.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Company Documents Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="mr-2 text-orange-600" />
            Company Documents
          </h3>
          
          {/* Add New Document Form */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">Add Required Document</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type *
                </label>
                <select
                  value={newDocument.type}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Document Type</option>
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the document requirements"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newDocument.required}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, required: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Required Document</span>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={addDocument}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="mr-2" />
                Add Document
              </button>
            </div>
          </div>

          {/* Existing Documents */}
          {formData.companyDocuments.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Required Documents</h4>
              <div className="space-y-3">
                {formData.companyDocuments.map((document) => (
                  <div key={document.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-800">{document.name}</h5>
                          {document.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Type: {document.type}</p>
                        {document.description && (
                          <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeDocument(document.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scope of Services Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="mr-2 text-indigo-600" />
            Scope of Services
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Services to be Provided *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {serviceOptions.map((service) => (
                <label key={service} className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.scopeOfServices.includes(service)}
                    onChange={() => toggleService(service)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{service}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save className="mr-2" />
            {loading ? 'Saving...' : 'Save Inquiry Section'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InquirySectionForm;
