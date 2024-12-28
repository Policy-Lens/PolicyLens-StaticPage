import React, { useState } from "react";

const CertificationPage = () => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const handleIssueCertificate = () => {
    alert("Certificate issued successfully!");
  };

  const handleCloseContract = () => {
    alert("Contract closed successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Certification</h1>

      {/* Page Description */}
      <p className="text-gray-600 mb-6">
        Manage the certification process and finalize contracts effectively.
      </p>

      {/* Buttons Section */}
      <div className="space-y-6">
        {/* Issue Certificate */}
        <div>
          <button
            onClick={handleIssueCertificate}
            className="px-3 py-1.5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Issue Certificate
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Generate and issue the certificate.
          </p>
        </div>

        {/* Close Contract */}
        <div>
          <button
            onClick={handleCloseContract}
            className="px-3 py-1.5 text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            Close Contract
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Finalize and close the contract.
          </p>
        </div>

        {/* Collapsible Description Box */}
        {isDescriptionOpen && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows="4"
              placeholder="Add your description here..."
            ></textarea>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationPage;
