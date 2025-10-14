import React, { useState, useEffect, useContext } from 'react';
import { FileText, Search, Edit, Trash2, Share } from 'lucide-react';
import { AuthContext } from '../../../AuthContext';
import { ProjectContext } from '../../../Context/ProjectContext';
import { apiRequest } from '../../../utils/api';
import { useParams } from 'react-router-dom';

const FileCard = ({ file, onFileSelect, onEdit }) => (
  <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow mb-3 border border-gray-200">
    <div className="flex items-start justify-between gap-2">
      <div 
        className="flex items-start space-x-2 flex-1 min-w-0 cursor-pointer"
        onClick={() => onFileSelect(file)}
      >
        <FileText className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {/* Regulation Info - Moved to top */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-blue-100 text-xs rounded-md font-medium text-blue-700">
              {file.regulation_standard || 'No Standard'}
            </span>
            <span className="px-2 py-0.5 bg-indigo-100 text-xs rounded-md font-medium text-indigo-700">
              {file.regulation_control_no || 'No Control'}
            </span>
          </div>

          {/* File Name */}
          <h4 className="text-sm font-medium text-gray-900 break-words line-clamp-2 mb-1.5">
            {file.file_name}
          </h4>
          
          {/* Category Tags - Moved to bottom with muted styling */}
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 bg-gray-50 text-xs rounded-full text-gray-500">
              {file.category || 'No Category'}
            </span>
            <span className="px-2 py-0.5 bg-gray-50 text-xs rounded-full text-gray-500">
              {file.sub_category || 'No Sub-category'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 space-x-1">
        <button 
          className="p-1 hover:bg-gray-100 rounded" 
          title="Edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(file);
          }}
        >
          <Edit size={14} className="text-gray-600" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded" title="Share">
          <Share size={14} className="text-gray-600" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded" title="Delete">
          <Trash2 size={14} className="text-gray-600" />
        </button>
      </div>
    </div>
  </div>
);

const FileExplorer = ({ onFileSelect, onFileEdit }) => {
  const [activeTab, setActiveTab] = useState('myFiles');
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { projectid } = useParams();
  const { user } = useContext(AuthContext);
  const { projectRole } = useContext(ProjectContext);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      let endpoint = activeTab === 'templates' 
        ? '/api/controlfiles/all-control-files/'
        : `/api/controlfiles/projects/${projectid}/control-files/`;

      if (activeTab === 'myFiles' && projectRole === 'consultant') {
        endpoint += '?assigned_to_me=true';
      } else if (activeTab === 'myFiles' && projectRole === 'consultant admin') {
        endpoint += '?assigned_by_me=true';
      }

      const response = await apiRequest('GET', endpoint, null, true);
      // Handle both paginated and non-paginated responses
      if (response.data && Array.isArray(response.data.results)) {
        setFiles(response.data.results);
      } else {
        setFiles(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeTab, projectid]);

  const filteredFiles = files.filter(file => 
    file.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.sub_category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleFileEdit = (file) => {
    if (onFileEdit) {
      onFileEdit(file);
    }
  };

  return (
    <div className="w-96 h-full bg-gray-50 flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-base font-semibold mb-3">Policy Library</h2>
        
        {/* Tabs */}
        <div className="flex space-x-2 mb-3">
          <button
            className={`px-2.5 py-1 text-sm rounded-md ${
              activeTab === 'myFiles'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('myFiles')}
          >
            My Files
          </button>
          <button
            className={`px-2.5 py-1 text-sm rounded-md ${
              activeTab === 'templates'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search files..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* File Cards */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <FileCard 
              key={file.id} 
              file={file}
              onFileSelect={handleFileSelect}
              onEdit={handleFileEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FileExplorer;