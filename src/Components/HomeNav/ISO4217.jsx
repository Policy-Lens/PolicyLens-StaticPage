import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  X,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  UploadCloud,
  Download,
} from "lucide-react";
import { AuthContext } from "../../AuthContext";
import { apiRequest } from "../../utils/api";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const ISO4217 = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);

  // States for data handling
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "add", "edit", "upload"
  const [activeCurrency, setActiveCurrency] = useState(null);

  // Form state
  const [currencyForm, setCurrencyForm] = useState({
    entity: "",
    currency: "",
    alphabetic_code: "",
    numeric_code: "",
    minor_unit: "",
  });

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Delete confirmation states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Partial errors state for upload
  const [partialErrorsWhileUploading, setPartialErrorsWhileUploading] =
    useState([]);
  const [partialErrors, setPartialErrors] = useState(false);

  // Check if user is admin
  useEffect(() => {
    setIsAdmin(user?.role === "admin");
  }, [user]);
  // Fetch currencies
  const fetchCurrencies = async () => {
    setIsLoading(true);
    const search = document.getElementById("search").value;
    const params = search ? `?search=${search}` : "";
    try {
      const response = await apiRequest(
        "GET",
        `/api/policylens/iso4217/${params}`,
        null,
        true
      );
      if (response.status === 200) {
        setCurrencies(response.data);
        console.log("Fetched currencies:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch currencies:", error);
      message.error("Failed to fetch currencies");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch currencies on mount and search
  useEffect(() => {
    fetchCurrencies();
  }, [searchQuery]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrencyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Modal handlers
  const openAddModal = () => {
    setCurrencyForm({
      entity: "",
      currency: "",
      alphabetic_code: "",
      numeric_code: "",
      minor_unit: "",
    });
    setModalType("add");
    setShowModal(true);
  };

  const openEditModal = (currency) => {
    setActiveCurrency(currency);
    setCurrencyForm({
      entity: currency.entity,
      currency: currency.currency,
      alphabetic_code: currency.alphabetic_code,
      numeric_code: currency.numeric_code,
      minor_unit: currency.minor_unit,
    });
    setModalType("edit");
    setShowModal(true);
  };

  const closeModal = () => {
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
  };

  // Submit handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      message.error("You don't have permission to perform this action.");
      return;
    }

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
          `Currency ${
            modalType === "edit" ? "updated" : "created"
          } successfully`
        );
        fetchCurrencies();
        closeModal();
      }
    } catch (error) {
      console.error("Error submitting currency:", error);
      message.error(`Failed to ${modalType} currency: ${error.message}`);
    }
  };

  // File upload handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !isAdmin) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await apiRequest(
        "POST",
        "/api/policylens/iso4217/upload/",
        formData,
        true,
        true
      );

      if (response.status === 201 || response.status === 207) {
        message.success(
          `Successfully created ${response.data.currencies_created} currencies`
        );

        if (response.data.currencies?.length > 0) {
          fetchCurrencies();
        }

        if (response.data.errors?.length > 0) {
          setPartialErrorsWhileUploading(response.data.errors);
          setPartialErrors(true);
        }

        closeModal();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete handlers
  const confirmDelete = (currency) => {
    setCurrencyToDelete(currency);
    setShowDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    if (!currencyToDelete || !isAdmin) return;

    setIsDeleting(true);
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/policylens/iso4217/${currencyToDelete.id}/delete/`,
        null,
        true
      );

      if (response.status === 204) {
        message.success("Currency deleted successfully");
        fetchCurrencies();
        setShowDeleteConfirmation(false);
        setCurrencyToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting currency:", error);
      message.error("Failed to delete currency");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="h-full flex flex-col ">
      <div className="p-6 flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search currencies..."
            value={searchQuery}
            id="search"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 w-64"
          />
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
              Add Currency
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 mx-6 mb-6 bg-white rounded-lg shadow overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
          </div>
        ) : (
          <div className="relative">
            <table className="w-full border-collapse">
              <thead className="bg-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Numeric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                    Minor Unit
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y h-64 divide-slate-200 overflow-y-auto">
                {currencies &&
                  currencies.map((currency) => (
                    <tr key={currency.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {currency.entity}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {currency.currency}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                        {currency.alphabetic_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {currency.numeric_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {currency.minor_unit}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(currency)}
                              className="p-1 hover:bg-slate-100 rounded"
                            >
                              <Edit size={16} className="text-slate-600" />
                            </button>
                            <button
                              onClick={() => confirmDelete(currency)}
                              className="p-1 hover:bg-slate-100 rounded"
                            >
                              <Trash2 size={16} className="text-slate-600" />
                            </button>
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                {modalType === "add" ? "Add New Currency" : "Edit Currency"}
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Entity
                  </label>
                  <input
                    type="text"
                    name="entity"
                    value={currencyForm.entity}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
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
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
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
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
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
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
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
                  {modalType === "add" ? "Add Currency" : "Save Changes"}
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
                Upload Currencies
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Delete Currency
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Are you sure you want to delete this currency? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partial Errors Modal */}
      {partialErrors && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Upload Results
            </h3>
            <div className="max-h-96 overflow-y-auto">
              {partialErrorsWhileUploading.map((error, index) => (
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
                onClick={() => {
                  setPartialErrors(false);
                  setPartialErrorsWhileUploading([]);
                }}
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

export default ISO4217;
