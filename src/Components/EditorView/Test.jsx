import React, { useState, useEffect } from 'react';
import { getWorkspaces } from '../../utils/aiWorkshopApi';

const TestUI = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await getWorkspaces();
        setWorkspaces(response.data.results || []);
      } catch (err) {
        setError('Failed to fetch workspaces. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  if (isLoading) {
    return <div>Loading workspaces...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Available Workspaces</h2>
      {workspaces.length > 0 ? (
        <ul className="list-disc list-inside bg-white p-4 rounded-lg shadow">
          {workspaces.map((workspace) => (
            <li key={workspace.id} className="mb-2">{workspace.name}</li>
          ))}
        </ul>
      ) : (
        <p>No workspaces found.</p>
      )}
    </div>
  );
};

export default TestUI;
