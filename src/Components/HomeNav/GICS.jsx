import React, { useState, useContext, useEffect, useRef } from "react";
import { Search, Plus, Edit, Trash2, X, UploadCloud, Filter } from "lucide-react";
import { AuthContext } from "../../AuthContext";
import { apiRequest } from "../../utils/api";
import {
  message,
  Spin,
  Table,
  Modal,
  Form,
  Input,
  Button,
  Popconfirm,
  Row,
  Col,
  Alert,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const SectorFilters = [
  "Energy",
  "Materials",
  "Industrials",
  "Consumer Discretionary",
  "Consumer Staples",
  "Health Care",
  "Financials",
  "Information Technology",
  "Communication Services",
  "Utilities",
  "Real Estate",
];

const IndustryGroupFilters = [
  "Energy",
  "Materials",
  "Capital Goods",
  "Commercial  & Professional Services",
  "Transportation",
  "Automobiles & Components",
  "Consumer Durables & Apparel",
  "Consumer Services",
  "Consumer Discretionary Distribution & Retail (New Name)",
  "Consumer Staples Distribution & Retail (New Name)",
  "Food, Beverage & Tobacco",
  "Household & Personal Products",
  "Health Care Equipment & Services",
  "Pharmaceuticals, Biotechnology & Life Sciences",
  "Banks",
  "Financial Services (New Name)",
  "Insurance",
  "Software & Services",
  "Technology Hardware & Equipment",
  "Semiconductors & Semiconductor Equipment",
  "Telecommunication Services",
  "Media & Entertainment",
  "Utilities",
  "Equity Real Estate Investment Trusts (REITs) (New Name)",
  "Real Estate Management & Development (New)",
];

const GICS = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectors, setSectors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState("");

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [partialErrors, setPartialErrors] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "add", "edit", "upload"
  const [activeSector, setActiveSector] = useState(null);

  // Form state
  const [sectorForm, setSectorForm] = useState({
    sector_number: "",
    sector: "",
    industry_group_number: "",
    industry_group: "",
    industry_number: "",
    industry: "",
    sub_industry_number: "",
    sub_industry: "",
    sub_industry_description: "",
  });

  // Check if user is admin
  useEffect(() => {
    setIsAdmin(user?.role === "admin");
  }, [user]);

  // Fetch sectors
  const fetchSectors = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedSector) params.append("sector", selectedSector);
    if (selectedIndustryGroup)
      params.append("industry_group", selectedIndustryGroup);

    const queryString = params.toString() ? `?${params.toString()}` : "";

    try {
      const response = await apiRequest(
        "GET",
        `/api/policylens/gics/${queryString}`,
        null,
        true
      );
      if (response.status === 200) {
        setSectors(response.data);
      }
    } catch (error) {
      console.error("Error fetching sectors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, [searchQuery, selectedSector, selectedIndustryGroup]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSectorForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setSectorForm({
      sector_number: "",
      sector: "",
      industry_group_number: "",
      industry_group: "",
      industry_number: "",
      industry: "",
      sub_industry_number: "",
      sub_industry: "",
      sub_industry_description: "",
    });
    setModalType("add");
    setShowModal(true);
  };

  const openUploadModal = () => {
    setSelectedFile(null);
    setModalType("upload");
    setShowModal(true);
  };

  const openEditModal = (sector) => {
    setActiveSector(sector);
    setSectorForm({
      sector_number: sector.sector_number,
      sector: sector.sector,
      industry_group_number: sector.industry_group_number,
      industry_group: sector.industry_group,
      industry_number: sector.industry_number,
      industry: sector.industry,
      sub_industry_number: sector.sub_industry_number,
      sub_industry: sector.sub_industry,
      sub_industry_description: sector.sub_industry_description,
    });
    setModalType("edit");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setActiveSector(null);
    setSectorForm({
      sector_number: "",
      sector: "",
      industry_group_number: "",
      industry_group: "",
      industry_number: "",
      industry: "",
      sub_industry_number: "",
      sub_industry: "",
      sub_industry_description: "",
    });
    setSelectedFile(null);
    setPartialErrors([]);
  };

  // File upload handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await apiRequest(
        "POST",
        "/api/policylens/gics/upload/",
        formData,
        true,
        true
      );

      if (response.status === 200) {
        if (response.data.errors && response.data.errors.length > 0) {
          setPartialErrors(response.data.errors);
        } else {
          message.success(
            `Successfully created ${response.data.gics_created} GICS entries`
          );
          closeModal();
          fetchSectors();
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("Error uploading GICS data");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (modalType === "add") {
        response = await apiRequest(
          "POST",
          "/api/policylens/gics/create/",
          sectorForm,
          true
        );
        if (response.status === 201) {
          message.success("GICS entry created successfully");
        }
      } else if (modalType === "edit") {
        response = await apiRequest(
          "PUT",
          `/api/policylens/gics/${activeSector.id}/update/`,
          sectorForm,
          true
        );
        if (response.status === 200) {
          message.success("GICS entry updated successfully");
        }
      }
      closeModal();
      fetchSectors();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Error saving GICS entry");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/policylens/gics/${id}/delete/`,
        null,
        true
      );
      if (response.status === 204) {
        message.success("GICS entry deleted successfully");
        fetchSectors();
      }
    } catch (error) {
      console.error("Error deleting sector:", error);
      message.error("Error deleting GICS entry");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Search and Filters */}
      <div className="p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search GICS entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 w-64"
            />
          </div>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-32 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-slate-600"
          >
            <option value="">All Sectors</option>
            {SectorFilters.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>

          <select
            value={selectedIndustryGroup}
            onChange={(e) => setSelectedIndustryGroup(e.target.value)}
            className="w-48 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-slate-600"
          >
            <option value="">All Industry Groups</option>
            {IndustryGroupFilters.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          {(searchQuery || selectedIndustryGroup || selectedSector) && (
            <button
              onClick={() => {
                setSelectedSector("");
                setSelectedIndustryGroup("");
                setSearchQuery("");
              }}
              className="text-blue-600 hover:underline transition-colors flex items-center gap-2"
            >
              Clear Filters
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setModalType("upload");
                setShowModal(true);
              }}
              className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <UploadCloud size={16} />
              Upload Excel
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add GICS Entry
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 mx-3 mb-3 bg-white rounded-lg shadow overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
            />
          </div>
        ) : (
          <div className="relative">
            <table className="w-full border-collapse">
              <thead className="bg-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Sector Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Industry Group Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Industry Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Industry Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Sub-Industry Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Sub-Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Sub-Industry Description
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 overflow-y-auto">
                {sectors.map((sector) => (
                  <tr key={sector.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sector.sector_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sector.sector}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sector.industry_group_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sector.industry_group}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sector.industry_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sector.industry}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sector.sub_industry_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sector.sub_industry}
                    </td>
                    <td className="px-6 py-4 text-sm min-w-[600px] max-w-[600px] text-slate-600">
                      {sector.sub_industry_description}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(sector)}
                            className="p-1 hover:bg-slate-100 rounded"
                          >
                            <Edit size={16} className="text-slate-600" />
                          </button>
                          <Popconfirm
                            title="Delete this entry?"
                            onConfirm={() => handleDelete(sector.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <button className="p-1 hover:bg-slate-100 rounded">
                              <Trash2 size={16} className="text-slate-600" />
                            </button>
                          </Popconfirm>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (modalType === "add" || modalType === "edit") && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ height: "80vh", width: "50vw" }}
            className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4"
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                {modalType === "add" ? "Add New GICS Entry" : "Edit GICS Entry"}
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form
              style={{ height: "90%" }}
              onSubmit={handleSubmit}
              className="p-6 overflow-y-scroll"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Sector Number
                  </label>
                  <input
                    type="text"
                    name="sector_number"
                    value={sectorForm.sector_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Sector
                  </label>
                  <input
                    type="text"
                    name="sector"
                    value={sectorForm.sector}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Industry Group Number
                  </label>
                  <input
                    type="text"
                    name="industry_group_number"
                    value={sectorForm.industry_group_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Industry Group
                  </label>
                  <input
                    type="text"
                    name="industry_group"
                    value={sectorForm.industry_group}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Industry Number
                  </label>
                  <input
                    type="text"
                    name="industry_number"
                    value={sectorForm.industry_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={sectorForm.industry}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Sub-Industry Number
                  </label>
                  <input
                    type="text"
                    name="sub_industry_number"
                    value={sectorForm.sub_industry_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Sub-Industry
                  </label>
                  <input
                    type="text"
                    name="sub_industry"
                    value={sectorForm.sub_industry}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Sub-Industry Description
                  </label>
                  <textarea
                    name="sub_industry_description"
                    value={sectorForm.sub_industry_description}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  {modalType === "add" ? "Add Entry" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && modalType === "upload" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                Upload GICS Data
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud
                    size={24}
                    className="mx-auto text-slate-400 mb-2"
                  />
                  <p className="text-sm text-slate-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Excel files only (.xlsx)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx"
                    className="hidden"
                  />
                </div>
                {selectedFile && (
                  <div className="mt-2 text-sm text-slate-600">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partial Errors Modal */}
      {partialErrors.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Upload Results
            </h3>
            <div className="max-h-96 overflow-y-auto">
              {partialErrors.map((error, index) => (
                <div
                  key={index}
                  className="mb-2 p-3 bg-red-50 border border-red-200 rounded"
                >
                  <p className="text-sm text-red-700">
                    Row {error.row}: {JSON.stringify(error.errors)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setPartialErrors([])}
                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GICS;
