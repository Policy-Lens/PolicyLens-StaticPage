import React from 'react';

const LegendsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200 flex justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Legends</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Risk Acceptance */}
              <div>
                <table className="min-w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 bg-gray-300 p-3 font-semibold w-1/4">Risk Acceptance:</td>
                      <td className="border border-gray-300 bg-blue-100 p-3 w-1/4">
                        Risk Rating / Residual Risk Rating should be less than
                      </td>
                      <td className="border border-gray-300 bg-blue-50 p-3 w-1/4 text-center">27</td>
                      <td className="border border-gray-300 bg-blue-100 p-3 w-1/4">
                        Risk Rating = Consequences x Likelihood x Existing Control Rating
                        <br /><br />
                        Residual Risk Rating = Consequences x Likelihood x Revised Control Rating
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="border border-gray-300 p-3 bg-white">
                  Risk Levels Priority = Risk Rating &gt;= 27
                </div>
              </div>

              {/* Basic principles of information security */}
              <div>
                <table className="min-w-full border-collapse">
                  <tbody>
                    <tr>
                      <td rowSpan="3" className="border border-gray-300 bg-gray-300 p-3 font-semibold w-1/4">
                        Basic principles of information security
                      </td>
                      <td className="border border-gray-300 bg-blue-100 p-3 w-1/4">Confidentiality (C)</td>
                      <td className="border border-gray-300 p-3 w-1/4">Assurance of data privacy</td>
                      <td className="border border-gray-300 p-3 w-1/4">Allows authorised person to access the information</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 bg-blue-100 p-3">Integrity (I)</td>
                      <td className="border border-gray-300 p-3">Data to be modified by authorised person</td>
                      <td className="border border-gray-300 p-3">Protecting accuracy and completeness of information</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 bg-blue-100 p-3">Availability (A)</td>
                      <td className="border border-gray-300 p-3">Availability to authorised users</td>
                      <td className="border border-gray-300 p-3">Assurance of timely and reliable access to data & services for authorised users</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Impact Rating */}
              <div>
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-gray-300 p-3 text-left font-semibold">Impact Rating</th>
                      <th className="border border-gray-300 bg-gray-300 p-3 text-left font-semibold">Description</th>
                      <th className="border border-gray-300 bg-gray-300 p-3 text-left font-semibold">On customer</th>
                      <th className="border border-gray-300 bg-gray-300 p-3 text-left font-semibold">On service capability</th>
                      <th className="border border-gray-300 bg-gray-300 p-3 text-left font-semibold">Financial damage</th>
                      <th className="border border-gray-300 bg-gray-300 p-3 text-left font-semibold">Spread / Magnitude</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 bg-yellow-300 p-3 text-center">1</td>
                      <td className="border border-gray-300 bg-yellow-300 p-3 text-center text-blue-700">Insignificant</td>
                      <td className="border border-gray-300 bg-yellow-300 p-3">Nil – Negligible</td>
                      <td className="border border-gray-300 bg-yellow-300 p-3">Nil – Negligible</td>
                      <td className="border border-gray-300 bg-yellow-300 p-3">Nil – Negligible</td>
                      <td className="border border-gray-300 bg-yellow-300 p-3">Nil – Negligible</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 bg-orange-200 p-3 text-center">2</td>
                      <td className="border border-gray-300 bg-orange-200 p-3 text-center text-blue-700">Minor</td>
                      <td className="border border-gray-300 bg-orange-200 p-3">Escalation to analyst</td>
                      <td className="border border-gray-300 bg-orange-200 p-3">Delay in service delivery by 1 working day</td>
                      <td className="border border-gray-300 bg-orange-200 p-3">Under $500K</td>
                      <td className="border border-gray-300 bg-orange-200 p-3">Impact on 1 computer</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 bg-red-300 p-3 text-center">3</td>
                      <td className="border border-gray-300 bg-red-300 p-3 text-center text-blue-700">Moderate</td>
                      <td className="border border-gray-300 bg-red-300 p-3">Escalation to Manager</td>
                      <td className="border border-gray-300 bg-red-300 p-3">Delay in service delivery by 3 working days</td>
                      <td className="border border-gray-300 bg-red-300 p-3">Between $500K - $5m</td>
                      <td className="border border-gray-300 bg-red-300 p-3">Impact on group of 5 or more</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 bg-red-400 p-3 text-center">4</td>
                      <td className="border border-gray-300 bg-red-400 p-3 text-center text-blue-700">Major</td>
                      <td className="border border-gray-300 bg-red-400 p-3">Escalation to AVP</td>
                      <td className="border border-gray-300 bg-red-400 p-3">Delay in service delivery by 5 working days</td>
                      <td className="border border-gray-300 bg-red-400 p-3">Between $5m - $20m</td>
                      <td className="border border-gray-300 bg-red-400 p-3">Impact on whole domain/team/department</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 bg-red-600 p-3 text-center text-white">5</td>
                      <td className="border border-gray-300 bg-red-600 p-3 text-center text-white">Catastrophic</td>
                      <td className="border border-gray-300 bg-red-600 p-3 text-white">Escalation to COO/CEO/BU Head/Department Head</td>
                      <td className="border border-gray-300 bg-red-600 p-3 text-white">Delay in service delivery by more than 5 working days</td>
                      <td className="border border-gray-300 bg-red-600 p-3 text-white">Above $20m</td>
                      <td className="border border-gray-300 bg-red-600 p-3 text-white">Impact on whole organisation</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Definition of Consequences Value */}
              <div>
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th colSpan="2" className="border border-gray-300 bg-gray-300 p-3 text-center font-semibold">Definition of Consequences Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 bg-gray-100 p-3 w-1/2 text-center font-medium">Total Impact</td>
                      <td className="border border-gray-300 bg-gray-100 p-3 w-1/2 text-center font-medium">Consequence</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 text-center">1 to 4</td>
                      <td className="border border-gray-300 bg-yellow-300 p-3 text-center">1</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 text-center">5 to 8</td>
                      <td className="border border-gray-300 bg-orange-200 p-3 text-center">2</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 text-center">9 to 12</td>
                      <td className="border border-gray-300 bg-red-300 p-3 text-center">3</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 text-center">13 to 16</td>
                      <td className="border border-gray-300 bg-red-400 p-3 text-center">4</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 text-center">17-20</td>
                      <td className="border border-gray-300 bg-red-600 p-3 text-center text-white">5</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Definition of Incident likelihood Value */}
              <div>
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th colSpan="2" className="border border-gray-300 bg-gray-300 p-3 text-center font-semibold">Definition of Incident likelihood Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 bg-gray-100 p-3 w-1/2 text-center font-medium">Past Occurrence</td>
                      <td className="border border-gray-300 bg-gray-100 p-3 w-1/2 text-center font-medium">Likelihood</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">No incident in past 5 years</td>
                      <td className="border border-gray-300 bg-yellow-300 p-3 text-center">1</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Up to two incidents in past 5 years</td>
                      <td className="border border-gray-300 bg-orange-200 p-3 text-center">2</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">More than two incidents in past 5 years</td>
                      <td className="border border-gray-300 bg-red-300 p-3 text-center">3</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Up to two incidents in past 1 year</td>
                      <td className="border border-gray-300 bg-red-400 p-3 text-center">4</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">More than two incidents in past 1 year</td>
                      <td className="border border-gray-300 bg-red-600 p-3 text-center text-white">5</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Definition of Control Rating values */}
              <div>
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th colSpan="2" className="border border-gray-300 bg-gray-300 p-3 text-center font-semibold">Definition of Control Rating values</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 bg-gray-100 p-3 w-1/2 text-center font-medium">Effectiveness</td>
                      <td className="border border-gray-300 bg-gray-100 p-3 w-1/2 text-center font-medium">Individual Control Rating</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Control not exists, not documented, not practices</td>
                      <td className="border border-gray-300 bg-red-600 p-3 text-center text-white">5</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Control not documented, but it's been practice</td>
                      <td className="border border-gray-300 bg-red-400 p-3 text-center text-white">4</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Control is documented and partially implemented</td>
                      <td className="border border-gray-300 bg-red-300 p-3 text-center">3</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Control is documented and fully implemented</td>
                      <td className="border border-gray-300 bg-orange-200 p-3 text-center">2</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Control is documented, fully implemented and effectiveness is ensured</td>
                      <td className="border border-gray-300 bg-yellow-300 p-3 text-center">1</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Overall Control Rating */}
              <div>
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-gray-300 p-3 text-left font-semibold">Overall Control Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3">
                        a. If there are more than 1 existing control, the overall control rating will be average of individual control ratings, rounded to nearest integer
                        <br />
                        b. If there isn't any existing control, the Overall Control Rating is taken as 5
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegendsModal; 