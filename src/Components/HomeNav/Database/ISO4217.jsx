import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { message, Popconfirm, Spin } from "antd";
import { Search, Plus, Upload, X, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "../../../utils/api";
import { AuthContext } from "../../../AuthContext";
import { LoadingOutlined } from '@ant-design/icons';

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

const ISO4217 = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlphabeticCode, setSelectedAlphabeticCode] = useState("");
  const [selectedNumericCode, setSelectedNumericCode] = useState("");
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
  const [activeCurrency, setActiveCurrency] = useState(null);
  const [currencyForm, setCurrencyForm] = useState({
    entity: "",
    currency: "",
    alphabetic_code: "",
    numeric_code: "",
    minor_unit: "",
  });

  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdmin(true);
    }
  }, [user]);

  const fetchCurrencies = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = "/api/policylens/iso4217/";
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (selectedAlphabeticCode) {
        params.append("alphabetic_code", selectedAlphabeticCode);
      }
      if (selectedNumericCode) {
        params.append("numeric_code", selectedNumericCode);
      }
      if (pagination.pageSize !== "all") {
        params.append("page", pagination.currentPage);
        params.append("page_size", pagination.pageSize);
      } else {
        params.append("page_size", "all");
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiRequest("GET", url, null, true);

      let results = [];
      let totalCount = 0;
      let totalPages = 1;

      if (Array.isArray(response.data)) {
        results = response.data;
        totalCount = results.length;
        totalPages = 1;
      } else if (response.data?.results) {
        results = response.data.results;
        totalCount = response.data.count || results.length;
        totalPages = Math.ceil(totalCount / (pagination.pageSize !== "all" ? pagination.pageSize : totalCount)) || 1;
      } else if (Array.isArray(response.data?.data)) {
        results = response.data.data;
        totalCount = results.length;
        totalPages = 1;
      } else {
        console.warn("Unexpected response structure:", response.data);
        message.warning("Unexpected response format from server");
      }

      setCurrencies(results);
      setPagination((prev) => ({
        ...prev,
        totalCount,
        totalPages,
      }));
    } catch (error) {
      console.error("Error fetching currencies:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url,
      });
      const errorMessage = error.response?.data?.error || error.message || "Failed to fetch currencies";
      message.error(`Failed to fetch currencies: ${errorMessage}`);
      setCurrencies([]);
      setPagination((prev) => ({
        ...prev,
        totalCount: 0,
        totalPages: 1,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedAlphabeticCode, selectedNumericCode, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

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
      totalPages: Math.ceil(pagination.totalCount / (newPageSize !== "all" ? parseInt(newPageSize, 10) : pagination.totalCount)) || 1,
    });
  }, [pagination.totalCount]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    if (filterType === "alphabetic_code") setSelectedAlphabeticCode(value);
    if (filterType === "numeric_code") setSelectedNumericCode(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedAlphabeticCode("");
    setSelectedNumericCode("");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrencyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const openAddModal = useCallback(() => {
    setModalType("add");
    setShowModal(true);
    setCurrencyForm({
      entity: "",
      currency: "",
      alphabetic_code: "",
      numeric_code: "",
      minor_unit: "",
    });
  }, []);

  const openEditModal = useCallback((currency) => {
    setModalType("edit");
    setActiveCurrency(currency);
    setCurrencyForm({
      entity: currency.entity,
      currency: currency.currency,
      alphabetic_code: currency.alphabetic_code,
      numeric_code: currency.numeric_code,
      minor_unit: currency.minor_unit,
    });
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalType("");
    setActiveCurrency(null);
    setCurrencyForm({
      entity: "",
      currency: "",
      alphabetic_code: "",
      numeric_code: "",
      minor_unit: "",
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

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      let response;
      if (modalType === "edit" && activeCurrency) {
        response = await apiRequest(
          "PUT",
          `/api/policylens/iso4217/${activeCurrency.id}/update/`,
          currencyForm,
          true
        );
      } else {
        response = await apiRequest(
          "POST",
          `/api/policylens/iso4217/create/`,
          currencyForm,
          true
        );
      }

      if (response.status === 200 || response.status === 201) {
        message.success(
          `Currency ${modalType === "edit" ? "updated" : "created"} successfully`
        );
        fetchCurrencies();
        closeModal();
      }
    } catch (error) {
      console.error("Error submitting currency:", error);
      const errorMessage = error.response?.data?.error || "Failed to save currency";
      message.error(`Failed to ${modalType} currency: ${errorMessage}`);
    }
  }, [modalType, activeCurrency, currencyForm, fetchCurrencies, closeModal]);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await apiRequest(
        "POST",
        "/api/policylens/iso4217/upload/",
        formData,
        true,
        true
      );

      if (response.status === 201 || response.status === 207) {
        message.success(
          `Successfully created ${response.data.currencies_created || 0} currencies`
        );
        if (response.data.errors?.length > 0) {
          setPartialErrors(response.data.errors);
        }
        fetchCurrencies();
        closeModal();
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error.response?.data?.error || "Failed to upload file";
      message.error(errorMessage);
      if (error.response?.data?.errors) {
        setPartialErrors(error.response.data.errors);
      }
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, fetchCurrencies, closeModal]);

  const handleDelete = useCallback(async (id) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/policylens/iso4217/${id}/delete/`,
        null,
        true
      );
      if (response.status === 204) {
        message.success("Currency deleted successfully");
        fetchCurrencies();
      }
    } catch (error) {
      console.error("Error deleting currency:", error);
      const errorMessage = error.response?.data?.error || "Failed to delete currency";
      message.error(errorMessage);
    }
  }, [fetchCurrencies]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-6 shadow-sm flex-none">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search currencies..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
          </div>
          <select
            value={selectedAlphabeticCode}
            onChange={(e) => handleFilterChange("alphabetic_code", e.target.value)}
            className="block w-48 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Alphabetic Codes</option>
            {[...new Set(currencies.map((c) => c.alphabetic_code))].sort().map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <select
            value={selectedNumericCode}
            onChange={(e) => handleFilterChange("numeric_code", e.target.value)}
            className="block w-48 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Numeric Codes</option>
            {[...new Set(currencies.map((c) => c.numeric_code))].sort().map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          {(selectedAlphabeticCode || selectedNumericCode || searchQuery) && (
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
                Add Currency
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 mx-3 mb-3 bg-white rounded-lg shadow overflow-y-auto">
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
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Alphabetic Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Numeric Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Minor Unit
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currencies.map((currency) => (
                    <tr key={currency.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 align-top text-sm text-slate-600 min-w-[200px]">
                        {currency.entity}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-600 min-w-[200px]">
                        {currency.currency}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-blue-600">
                        {currency.alphabetic_code}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm text-slate-600">
                        {currency.numeric_code}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm text-slate-600">
                        {currency.minor_unit}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(currency)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              aria-label="Edit currency"
                              title="Edit Currency"
                            >
                              <Edit size={18} />
                            </button>
                            <Popconfirm
                              title="Delete this currency?"
                              description="This action cannot be undone."
                              onConfirm={() => handleDelete(currency.id)}
                              okText="Yes"
                              cancelText="No"
                              okButtonProps={{ className: 'bg-red-500' }}
                            >
                              <button
                                className="text-red-600 hover:text-red-800 transition-colors"
                                aria-label="Delete currency"
                                title="Delete Currency"
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
            <div className="border-t border-slate-200">
              <PaginationControls
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </>
        )}
      </div>
      {showModal && modalType !== "excel" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                {modalType === "add" ? "Add New Currency" : "Edit Currency"}
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Entity
                  </label>
                  <input
                    type="text"
                    name="entity"
                    value={currencyForm.entity}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Currency
                  </label>
                  <input
                    type="text"
                    name="currency"
                    value={currencyForm.currency}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Alphabetic Code
                  </label>
                  <input
                    type="text"
                    name="alphabetic_code"
                    value={currencyForm.alphabetic_code}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Numeric Code
                  </label>
                  <input
                    type="text"
                    name="numeric_code"
                    value={currencyForm.numeric_code}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Minor Unit
                  </label>
                  <input
                    type="text"
                    name="minor_unit"
                    value={currencyForm.minor_unit}
                    onChange={handleInputChange}
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
                  {modalType === "add" ? "Add Currency" : "Save Changes"}
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
                Upload Currencies Excel File
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
                          Row {error.row}: {Object.entries(error.errors || {}).map(([field, msg]) => `${field}: ${msg}`).join(", ") || error}
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

export default ISO4217;
