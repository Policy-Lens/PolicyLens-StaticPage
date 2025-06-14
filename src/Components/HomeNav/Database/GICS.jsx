import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { message, Popconfirm, Spin } from "antd";
import { Search, Plus, Upload, X, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "../../../utils/api";
import { LoadingOutlined } from '@ant-design/icons';
import { AuthContext } from "../../../AuthContext";

const PaginationControls = ({ pagination, onPageChange, onPageSizeChange }) => {
  const { currentPage, totalPages, totalCount, pageSize } = pagination;

  if (!totalCount || totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-white border-t border-slate-200">
      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-slate-600">
          Rows per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(e.target.value)}
          className="border border-slate-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value="all">All</option>
        </select>
      </div>
      <div className="text-sm text-slate-600">
        Page {currentPage} of {totalPages} ({totalCount} items)
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const GICS = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gicsEntries, setGicsEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedSubIndustry, setSelectedSubIndustry] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [partialErrors, setPartialErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [activeEntry, setActiveEntry] = useState(null);
  const [entryForm, setEntryForm] = useState({
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
  const [expandedCells, setExpandedCells] = useState({});

  const sectorOptions = [
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

  const industryGroupOptions = [
    "Energy",
    "Materials",
    "Capital Goods",
    "Commercial & Professional Services",
    "Transportation",
    "Automobiles & Components",
    "Consumer Durables & Apparel",
    "Consumer Services",
    "Consumer Discretionary Distribution & Retail",
    "Consumer Staples Distribution & Retail",
    "Food, Beverage & Tobacco",
    "Household & Personal Products",
    "Health Care Equipment & Services",
    "Pharmaceuticals, Biotechnology & Life Sciences",
    "Banks",
    "Financial Services",
    "Insurance",
    "Software & Services",
    "Technology Hardware & Equipment",
    "Semiconductors & Semiconductor Equipment",
    "Telecommunication Services",
    "Media & Entertainment",
    "Utilities",
    "Equity Real Estate Investment Trusts (REITs)",
    "Real Estate Management & Development",
  ];

  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdmin(true);
    }
  }, [user]);

  const fetchGicsEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = "/api/policylens/gics/";
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      if (selectedSector) params.append("sector", selectedSector);
      if (selectedIndustryGroup) params.append("industry_group", selectedIndustryGroup);
      if (selectedIndustry) params.append("industry", selectedIndustry);
      if (selectedSubIndustry) params.append("sub_industry", selectedSubIndustry);

      params.append("page_size", pagination.pageSize === "all" ? "all" : pagination.pageSize);
      if (pagination.pageSize !== "all") {
        params.append("page", pagination.currentPage);
      }
      params.append("ordering", "sector_number");

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiRequest("GET", url, null, true);
      const results = response.data?.results || [];
      const totalCount = response.data?.count || 0;

      setGicsEntries(results);
      setPagination((prev) => ({
        ...prev,
        totalCount,
        totalPages:
          pagination.pageSize === "all"
            ? 1
            : Math.ceil(totalCount / (typeof pagination.pageSize === "string" ? parseInt(pagination.pageSize, 10) : pagination.pageSize)),
      }));
    } catch (error) {
      console.error("Error fetching GICS entries:", error);
      message.error("Failed to fetch GICS entries");
      setGicsEntries([]);
      setPagination((prev) => ({
        ...prev,
        totalCount: 0,
        totalPages: 1,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedSector, selectedIndustryGroup, selectedIndustry, selectedSubIndustry, pagination.pageSize, pagination.currentPage]);

  useEffect(() => {
    fetchGicsEntries();
  }, [fetchGicsEntries]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  }, [pagination.totalPages]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPagination({
      currentPage: 1,
      pageSize: newPageSize === "all" ? "all" : parseInt(newPageSize, 10),
      totalCount: pagination.totalCount,
      totalPages: 1,
    });
  }, [pagination.totalCount]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    if (filterType === "sector") setSelectedSector(value);
    if (filterType === "industry_group") setSelectedIndustryGroup(value);
    if (filterType === "industry") setSelectedIndustry(value);
    if (filterType === "sub_industry") setSelectedSubIndustry(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedSector("");
    setSelectedIndustryGroup("");
    setSelectedIndustry("");
    setSelectedSubIndustry("");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setEntryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const openAddModal = useCallback(() => {
    setModalType("add");
    setShowModal(true);
    setEntryForm({
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
  }, []);

  const openEditModal = useCallback((entry) => {
    setModalType("edit");
    setActiveEntry(entry);
    setEntryForm({
      sector_number: entry.sector_number,
      sector: entry.sector,
      industry_group_number: entry.industry_group_number,
      industry_group: entry.industry_group,
      industry_number: entry.industry_number,
      industry: entry.industry,
      sub_industry_number: entry.sub_industry_number,
      sub_industry: entry.sub_industry,
      sub_industry_description: entry.sub_industry_description,
    });
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalType("");
    setActiveEntry(null);
    setEntryForm({
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
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await apiRequest(
        "POST",
        "/api/policylens/gics/upload/",
        formData,
        true,
        true
      );

      if (response.status === 201 || response.status === 207) {
        message.success(`Uploaded ${response.data.gics_created} GICS entries`);
        setPartialErrors(response.data.errors || []);
        fetchGicsEntries();
        closeModal();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.response?.data?.errors) {
        setPartialErrors(error.response.data.errors);
      } else {
        message.error(error.response?.data?.error || "Failed to upload file");
      }
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, fetchGicsEntries]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        const response = await apiRequest(
          "POST",
          "/api/policylens/gics/create/",
          entryForm,
          true
        );
        if (response.status === 201) {
          message.success("GICS entry created successfully");
          fetchGicsEntries();
          closeModal();
        }
      } else if (modalType === "edit" && activeEntry) {
        const response = await apiRequest(
          "PATCH",
          `/api/policylens/gics/${activeEntry.id}/update/`,
          entryForm,
          true
        );
        if (response.status === 200) {
          message.success("GICS entry updated successfully");
          fetchGicsEntries();
          closeModal();
        }
      }
    } catch (error) {
      console.error("Error submitting GICS entry:", error);
      message.error(error.response?.data?.error || "Failed to save GICS entry");
    }
  }, [modalType, activeEntry, entryForm, fetchGicsEntries, closeModal]);

  const handleDelete = useCallback(async (id) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/policylens/gics/${id}/delete/`,
        null,
        true
      );
      if (response.status === 204) {
        message.success("GICS entry deleted successfully");
        fetchGicsEntries();
      }
    } catch (error) {
      console.error("Error deleting GICS entry:", error);
      message.error("Failed to delete GICS entry");
    }
  }, [fetchGicsEntries]);

  const toggleCellExpansion = useCallback((entryId, field) => {
    setExpandedCells((prev) => ({
      ...prev,
      [`${entryId}-${field}`]: !prev[`${entryId}-${field}`],
    }));
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-6 shadow-sm flex-none">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search GICS entries..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
          </div>
          <select
            value={selectedSector}
            onChange={(e) => handleFilterChange("sector", e.target.value)}
            className="block w-40 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sectors</option>
            {sectorOptions.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
          <select
            value={selectedIndustryGroup}
            onChange={(e) => handleFilterChange("industry_group", e.target.value)}
            className="block w-48 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Industry Groups</option>
            {industryGroupOptions.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <select
            value={selectedIndustry}
            onChange={(e) => handleFilterChange("industry", e.target.value)}
            className="block w-48 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Industries</option>
            {[...new Set(gicsEntries.map((entry) => entry.industry))].sort().map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          <select
            value={selectedSubIndustry}
            onChange={(e) => handleFilterChange("sub_industry", e.target.value)}
            className="block w-48 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sub-Industries</option>
            {[...new Set(gicsEntries.map((entry) => entry.sub_industry))].sort().map((subIndustry) => (
              <option key={subIndustry} value={subIndustry}>
                {subIndustry}
              </option>
            ))}
          </select>
          {(selectedSector || selectedIndustryGroup || selectedIndustry || selectedSubIndustry || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="text-blue-600 hover:underline transition-colors flex items-center gap-2"
            >
              Clear Filters
            </button>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setModalType("excel");
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                <Upload size={18} />
                Upload Excel
              </button>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={18} />
                Add GICS Entry
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 mx-3 mb-3 bg-white rounded-lg shadow overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
              <PaginationControls
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
            <div className="relative">
              <table className="w-full border-collapse">
                <thead className="bg-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Sector Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Sector
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Industry Group Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Industry Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Industry Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Sub-Industry Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Sub-Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Sub-Industry Description
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {gicsEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {entry.sector_number}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {entry.sector}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {entry.industry_group_number}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {entry.industry_group}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {entry.industry_number}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {entry.industry}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {entry.sub_industry_number}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {entry.sub_industry}
                      </td>
                      <td
                        className="px-6 py-4 align-top text-sm text-slate-600 min-w-[300px] max-w-[400px] whitespace-pre-wrap cursor-pointer"
                        onClick={() => toggleCellExpansion(entry.id, 'sub_industry_description')}
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedCells[`${entry.id}-sub_industry_description`] || false}
                        aria-label="Toggle sub-industry description"
                        onKeyDown={(e) => e.key === 'Enter' && toggleCellExpansion(entry.id, 'sub_industry_description')}
                      >
                        <div className={`${expandedCells[`${entry.id}-sub_industry_description`] ? '' : 'line-clamp-3'}`}>
                          {entry.sub_industry_description}
                        </div>
                        <span className="text-blue-600 hover:text-blue-800">
                          {expandedCells[`${entry.id}-sub_industry_description`] ? 'Show Less' : '...'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(entry)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              aria-label="Edit GICS entry"
                              title="Edit GICS Entry"
                            >
                              <Edit size={18} />
                            </button>
                            <Popconfirm
                              title="Delete this GICS entry?"
                              description="This action cannot be undone."
                              onConfirm={() => handleDelete(entry.id)}
                              okText="Yes"
                              cancelText="No"
                              okButtonProps={{ className: 'bg-red-500' }}
                            >
                              <button
                                className="text-red-600 hover:text-red-800 transition-colors"
                                aria-label="Delete GICS entry"
                                title="Delete GICS Entry"
                              >
                                <Trash2 size={18} />
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
            <PaginationControls
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>
      {showModal && modalType !== "excel" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                {modalType === "add" ? "Add New GICS Entry" : "Edit GICS Entry"}
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Sector Number
                  </label>
                  <input
                    type="text"
                    name="sector_number"
                    value={entryForm.sector_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    value={entryForm.sector}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    value={entryForm.industry_group_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Industry Group
                  </label>
                  <input
                    type="text"
                    name="industry_group"
                    value={entryForm.industry_group}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Industry Number
                  </label>
                  <input
                    type="text"
                    name="industry_number"
                    value={entryForm.industry_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={entryForm.industry}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Sub-Industry Number
                  </label>
                  <input
                    type="text"
                    name="sub_industry_number"
                    value={entryForm.sub_industry_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Sub-Industry
                  </label>
                  <input
                    type="text"
                    name="sub_industry"
                    value={entryForm.sub_industry}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Sub-Industry Description
                  </label>
                  <textarea
                    name="sub_industry_description"
                    value={entryForm.sub_industry_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {modalType === "add" ? "Add GICS Entry" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showModal && modalType === "excel" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                Upload GICS Excel File
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.xls"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-slate-600">
                      Selected file: {selectedFile.name}
                    </p>
                  )}
                </div>
                {partialErrors.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      The following errors occurred:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {partialErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600">
                          Row {error.row}: {Object.entries(error.errors).map(([field, msg]) => `${field}: ${msg}`).join(", ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className={`px-4 py-2 rounded-md text-white ${!selectedFile || isUploading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    "Upload File"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GICS;