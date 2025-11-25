import { useState, useEffect, useContext } from "react";
import "./ContractPreview.css";
import { ScopingContext } from "../../../../../Context/ScopingContext";

const ContractPreview = ({
  clauses,
  totalPrice,
  tranches,
  companyDetails,
  consultantDetails,
  estimatedDays,
  signatures,
}) => {
  const totalAmount = totalPrice || 0;
  const [signatureImages, setSignatureImages] = useState({
    company_admin: null,
    lead_advisor: null,
  });
  const [logoImages, setLogoImages] = useState({
    company: null,
    consultant: null,
  });

  const { scopingData } = useContext(ScopingContext);

  // Convert image URLs to base64 for PDF export
  useEffect(() => {
    const loadImages = async () => {
      const sigImages = {};
      const logos = {};

      // Load signatures
      if (signatures?.company_admin?.signature) {
        try {
          const base64 = await convertImageToBase64(
            signatures.company_admin.signature
          );
          sigImages.company_admin = base64;
        } catch (error) {
          console.error("Error loading company admin signature:", error);
        }
      }

      if (signatures?.lead_advisor?.signature) {
        try {
          const base64 = await convertImageToBase64(
            signatures.lead_advisor.signature
          );
          sigImages.lead_advisor = base64;
        } catch (error) {
          console.error("Error loading lead advisor signature:", error);
        }
      }

      // Load logos
      if (companyDetails?.logo) {
        try {
          const base64 = await convertImageToBase64(companyDetails.logo);
          logos.company = base64;
        } catch (error) {
          console.error("Error loading company logo:", error);
        }
      }

      if (consultantDetails?.logo) {
        try {
          const base64 = await convertImageToBase64(consultantDetails.logo);
          logos.consultant = base64;
        } catch (error) {
          console.error("Error loading consultant logo:", error);
        }
      }

      setSignatureImages(sigImages);
      setLogoImages(logos);
    };

    loadImages();
  }, [signatures, companyDetails, consultantDetails]);

  const convertImageToBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image:", error);
      return null;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "dd/mm/yyyy";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div
      style={{
        padding: 10,
        border: "1px solid #ccc",
        borderRadius: 8,
        lineHeight: 1.8,
        width: "794px",
        margin: "auto",
      }}
    >
      <div
        id="contract-preview"
        style={{
          padding: 40,
          background: "#fff",

          fontFamily: "arial, sans",
          fontSize: 14,
        }}
      >
        {/* Logo Section */}
        <div
          className="contract-section"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 30,
            gap: 40,
          }}
        >
          {/* Company Logo */}
          <div
            style={{
              flex: 1,
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                height: 60,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              {logoImages.company || companyDetails?.logo ? (
                <img
                  src={logoImages.company || companyDetails.logo}
                  alt="Company Logo"
                  style={{
                    maxWidth: "150px",
                    maxHeight: "60px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {companyDetails?.name || "<Company Logo>"}
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#666",
              }}
            >
              {companyDetails?.name || "<Company Legal Name>"}
            </div>
          </div>

          {/* Advisor Logo */}
          <div
            style={{
              flex: 1,
              textAlign: "right",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                height: 60,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {logoImages.consultant || consultantDetails?.logo ? (
                <img
                  src={logoImages.consultant || consultantDetails.logo}
                  alt="Advisor Logo"
                  style={{
                    maxWidth: "150px",
                    maxHeight: "60px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {consultantDetails?.name || "<Advisor Logo>"}
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#666",
              }}
            >
              {consultantDetails?.name || "<Advisor Legal Name>"}
            </div>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div
            style={{
              color: "red",
              fontSize: 12,
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            Confidential
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            MASTER SERVICES - CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT
          </h2>
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            (MSA-NDA)
          </h2>
          <h2 style={{ margin: "30px 0 0 0", fontSize: 20 }}>
            Agreement Between
          </h2>
        </div>

        {/* Company and Advisor Details */}
        <div
          className="contract-section"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 30,
            gap: 20,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                border: "1px solid #ddd",
                padding: 10,
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h4 style={{ margin: "auto", fontSize: 14 }}>
                <strong>Company</strong>
              </h4>
              <p style={{ margin: 2, fontSize: 12 }}>
                <strong>Legal Name:</strong> {companyDetails.name}
              </p>
              <p style={{ margin: 2, fontSize: 12 }}>
                <strong>PAN:</strong> {companyDetails.pan}
              </p>
              <p style={{ margin: 2, fontSize: 12 }}>
                <strong>GST:</strong> {companyDetails.gst}
              </p>
              {companyDetails?.abbreviation && (
                <p style={{ margin: 2, fontSize: 12 }}>
                  <strong>Abbreviation:</strong> {companyDetails.abbreviation}
                </p>
              )}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                border: "1px solid #ddd",
                padding: 10,
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h4 style={{ margin: "auto", fontSize: 14 }}>
                <strong>Advisor</strong>
              </h4>
              <p style={{ margin: 2, fontSize: 12 }}>
                <strong>Advisor Legal Name:</strong> {consultantDetails.name}
              </p>
              <p style={{ margin: 2, fontSize: 12 }}>
                <strong>PAN:</strong> {consultantDetails.pan}
              </p>
              <p style={{ margin: 2, fontSize: 12 }}>
                <strong>GST:</strong> {consultantDetails.gst}
              </p>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 14 }}>
          In consideration of the mutual promises set for the herein, Client and
          Service provider agree as follows:{" "}
        </p>

        {/* Agreement Clauses Section
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ 
            fontSize: 14, 
            fontWeight: "bold",
            marginBottom: 15,
            borderBottom: "2px solid #333",
            paddingBottom: 5
          }}>
            Agreement Clauses
          </h3>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 20px",
            fontSize: 12
          }}>
            <div>1. Services</div>
            <div>2. Payment Terms</div>
            <div>3. Duration of Agreement</div>
            <div>4. Invoices and Payments</div>
            <div>5. Indemnification</div>
            <div>6. Proprietary Information</div>
            <div>7. Confidentiality</div>
            <div>8. Non-Disclosure</div>
            <div>9. Return of Documents</div>
            <div>10. Communications</div>
            <div>11. Use of Work Product</div>
            <div>12. Limitation of Liability</div>
            <div>13. Limit on Obligations</div>
            <div>14. Termination</div>
            <div>15. Waiver</div>
            <div>16. Entire Agreement</div>
            <div>17. Assignment</div>
            <div>18. Severability</div>
            <div>19. Notices</div>
            <div>20. Dispute Resolution</div>
            <div style={{ gridColumn: "1 / -1" }}>21. Governing Law</div>
          </div>
        </div> */}

        {/* Contract Clauses Content */}
        <div style={{ marginTop: 5 }}>
          {clauses.c1_services && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 1. SERVICES
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c1_services }}
              />
            </div>
          )}

          {clauses.c2_payment_terms && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 2. PAYMENT TERMS
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c2_payment_terms }}
              />
            </div>
          )}

          {clauses.c3_agreement_duration && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 3. DURATION OF AGREEMENT
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{
                  __html: clauses.c3_agreement_duration,
                }}
              />
            </div>
          )}

          {clauses.c4_invoices && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}>
                Clause 4. INVOICES AND PAYMENTS
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c4_invoices }}
              />
            </div>
          )}
          <div style={{ marginBottom: 25 }}>
            <p>{companyDetails.name}</p>
            <p>{companyDetails.billing_address || "<Billing address>"}</p>
            <p>
              {companyDetails.billing_department || "<Billing to department>"}
            </p>
            <p>{companyDetails.billing_to || "<Bill to person name>"}</p>
          </div>

          {clauses.c5_indemnification && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 5. INDEMNIFICATION
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c5_indemnification }}
              />
            </div>
          )}

          {clauses.c6_proprietary_information && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 6. PROPRIETARY INFORMATION
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{
                  __html: clauses.c6_proprietary_information,
                }}
              />
            </div>
          )}

          {clauses.c7_confidentiality && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 7. CONFIDENTIALITY
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c7_confidentiality }}
              />
            </div>
          )}

          {clauses.c8_non_disclosure && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 8. NON-DISCLOSURE OF PROPRIETARY INFORMATION
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c8_non_disclosure }}
              />
            </div>
          )}

          {clauses.c9_return_of_documents && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 9. RETURN OF DOCUMENTS
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{
                  __html: clauses.c9_return_of_documents,
                }}
              />
            </div>
          )}

          {clauses.c10_communication && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 10. COMMUNICATIONS
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c10_communication }}
              />
            </div>
          )}

          {clauses.c11_use_of_work_product && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 11. USE OF WORK PRODUCT AND RELIANCE
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{
                  __html: clauses.c11_use_of_work_product,
                }}
              />
            </div>
          )}

          {clauses.c12_limitation_of_liability && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 12. LIMITATION OF LIABILITY
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{
                  __html: clauses.c12_limitation_of_liability,
                }}
              />
            </div>
          )}

          {clauses.c13_limit_on_onligations && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 13. LIMIT ON OBLIGATIONS
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{
                  __html: clauses.c13_limit_on_onligations,
                }}
              />
            </div>
          )}

          {clauses.c14_termination && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 14. TERMINATION OF AGREEMENT
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c14_termination }}
              />
            </div>
          )}

          {clauses.c15_waiver && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 15. WAIVER
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c15_waiver }}
              />
            </div>
          )}

          {clauses.c16_entire_agreement && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 16. ENTIRE AGREEMENT
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{
                  __html: clauses.c16_entire_agreement,
                }}
              />
            </div>
          )}

          {clauses.c17_assignment && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 17. ASSIGNMENT
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c17_assignment }}
              />
            </div>
          )}

          {clauses.c18_severability && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 18. SEVERABILITY
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c18_severability }}
              />
            </div>
          )}

          {clauses.c19_notices && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 19. NOTICES
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c19_notices }}
              />
            </div>
          )}

          {clauses.c20_dispute_resolution && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 20. DISPUTE RESOLUTION
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{
                  __html: clauses.c20_dispute_resolution,
                }}
              />
            </div>
          )}

          {clauses.c21_governing_law && (
            <div
              className="contract-clause-section"
              style={{ marginBottom: 25 }}
            >
              <h4
                className="contract-header"
                style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
              >
                Clause 21. GOVERNING LAW
              </h4>
              <div
                className="contract-clause-content"
                dangerouslySetInnerHTML={{ __html: clauses.c21_governing_law }}
              />
            </div>
          )}
        </div>

        {/* Exhibit A: Scope of Service */}
        <div className="contract-section" style={{ marginBottom: 30 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: "bold",
              marginBottom: 15,
              borderBottom: "2px solid #333",
              paddingBottom: 5,
            }}
          >
            Exhibit A: SCOPE OF SERVICE FOR PROJECT BEARING ID -{" "}
            {scopingData.project_name}
          </h3>

          {/* <div className="no-page-break" style={{ marginBottom: 20 }}>
            <h4
              className="contract-header"
              style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
            >
              Scope of Work
            </h4>
            <p style={{ fontSize: 12, color: "#666" }}>
              Auto-populated from Scope of Work step
            </p>
          </div> */}

          <div className="no-page-break" style={{ marginBottom: 20 }}>
            <h4
              className="contract-header"
              style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
            >
              Effort Estimate (Man Days)
            </h4>
            <table
              className="contract-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      textAlign: "left",
                    }}
                  >
                    Role
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      textAlign: "right",
                    }}
                  >
                    Total Days
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    Lead Advisor
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      textAlign: "right",
                    }}
                  >
                    {estimatedDays?.lead_advisor_days || 0}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    Advisor
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      textAlign: "right",
                    }}
                  >
                    {estimatedDays?.advisor_days || 0}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    Associate Advisor
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      textAlign: "right",
                    }}
                  >
                    {estimatedDays?.associate_advisor_days || 0}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    Technical Advisor
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      textAlign: "right",
                    }}
                  >
                    {estimatedDays?.technical_advisor_days || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="no-page-break" style={{ marginBottom: 20 }}>
            <h4
              className="contract-header"
              style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}
            >
              Price Estimate
            </h4>
            <div
              style={{
                background: "#f5f5f5",
                padding: 15,
                borderRadius: 4,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Total Amount: ${totalAmount.toLocaleString()}
            </div>
          </div>

          <div className="no-page-break" style={{ marginBottom: 20 }}>
            <h4
              className="contract-header"
              style={{ fontSize: 13, fontWeight: "bold", marginBottom: 10 }}
            >
              Payment Tranches
            </h4>
            <table
              className="contract-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      textAlign: "left",
                    }}
                  >
                    Particulars
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      textAlign: "left",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      textAlign: "right",
                    }}
                  >
                    Percentage
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      textAlign: "right",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {tranches.map((tranche, index) => (
                  <tr key={tranche.id || index}>
                    <td style={{ border: "1px solid #ddd", padding: 8 }}>
                      {tranche.particular}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: 8 }}>
                      {tranche.description}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: 8,
                        textAlign: "right",
                      }}
                    >
                      {tranche.percentage_of_total}%
                    </td>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: 8,
                        textAlign: "right",
                      }}
                    >
                      ${tranche.payable_amount?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              fontSize: 11,
              fontStyle: "italic",
              color: "#666",
              marginTop: 15,
              padding: 10,
              background: "#f9f9f9",
              borderLeft: "3px solid #999",
            }}
          >
            <strong>Disclaimer:</strong> The roles and resources identified and
            planned above are based on tasks. However, any resource, adequately
            competent and experienced, may be handling multiple responsibilities
            depending on the project plan and resource availability.
          </div>
        </div>

        {/* Signature Section */}
        <div
          className="contract-section"
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "space-around",
            gap: 60,
          }}
        >
          {/* Company Signature */}
          <div
            style={{
              flex: 1,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h4 style={{ fontSize: 13, marginBottom: 20, fontWeight: "bold" }}>
              For Company
            </h4>
            {signatureImages.company_admin ||
            signatures?.company_admin?.signature ? (
              <>
                <div
                  style={{
                    height: 80,
                    marginBottom: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={
                      signatureImages.company_admin ||
                      signatures.company_admin.signature
                    }
                    alt="Company Signature"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "80px",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    marginBottom: 5,
                    fontWeight: 500,
                  }}
                >
                  {signatures?.company_admin?.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    marginBottom: 5,
                  }}
                >
                  {signatures?.company_admin?.role}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                  }}
                >
                  {formatDate(signatures?.company_admin?.signature_date)}
                </div>
              </>
            ) : (
              <div
                style={{
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ccc",
                  fontSize: 12,
                  fontStyle: "italic",
                }}
              >
                [Signature Placeholder]
              </div>
            )}
          </div>

          {/* Advisor Signature */}
          <div
            style={{
              flex: 1,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h4 style={{ fontSize: 13, marginBottom: 20, fontWeight: "bold" }}>
              For Advisor
            </h4>
            {signatureImages.lead_advisor ||
            signatures?.lead_advisor?.signature ? (
              <>
                <div
                  style={{
                    height: 80,
                    marginBottom: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={
                      signatureImages.lead_advisor ||
                      signatures.lead_advisor.signature
                    }
                    alt="Advisor Signature"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "80px",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    marginBottom: 5,
                    fontWeight: 500,
                  }}
                >
                  {signatures?.lead_advisor?.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    marginBottom: 5,
                  }}
                >
                  {signatures?.lead_advisor?.role}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                  }}
                >
                  {formatDate(signatures?.lead_advisor?.signature_date)}
                </div>
              </>
            ) : (
              <div
                style={{
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ccc",
                  fontSize: 12,
                  fontStyle: "italic",
                }}
              >
                [Signature Placeholder]
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
