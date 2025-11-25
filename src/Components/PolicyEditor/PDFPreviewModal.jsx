import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, message } from "antd";
import { Download, Printer, X } from "lucide-react";
import html2pdf from "html2pdf.js";
import { createBrandedPDFHTML, getDefaultBranding } from "../../utils/branding";

const PDFPreviewModal = ({ 
  visible, 
  onClose, 
  policyData, 
  companyBranding,
  onDownload 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef(null);
  const pdfContainerRef = useRef(null);

  useEffect(() => {
    if (visible && policyData) {
      // Use setTimeout to ensure the ref is ready and modal is fully rendered
      const timer = setTimeout(() => {
        generatePreview();
      }, 200);
      
      return () => clearTimeout(timer);
    } else if (!visible) {
      // Clear content when modal closes
      if (previewRef.current) {
        previewRef.current.innerHTML = "";
      }
      pdfContainerRef.current = null;
    }
  }, [visible, policyData, companyBranding]);

  const generatePreview = () => {
    if (!policyData) {
      console.error("No policy data available");
      return;
    }

    if (!previewRef.current) {
      console.error("Preview ref not ready");
      return;
    }

    setIsGenerating(true);

    try {
      // Clear previous content
      previewRef.current.innerHTML = "";

      // Create branded PDF HTML
      const metadata = policyData.policy_data?.metadata || {};
      const mainContent = policyData.policy_data?.content?.main_content || {};
      
      console.log("Generating preview with:", {
        policyData: !!policyData,
        companyBranding: companyBranding || "using default",
        metadata: Object.keys(metadata).length,
        mainContent: !!mainContent.html
      });

      const pdfContainer = createBrandedPDFHTML(
        policyData,
        companyBranding || getDefaultBranding(),
        mainContent,
        metadata
      );

      if (!pdfContainer || !(pdfContainer instanceof HTMLElement)) {
        throw new Error("Failed to create PDF container - invalid element returned");
      }

      // Append to preview container
      previewRef.current.appendChild(pdfContainer);
      pdfContainerRef.current = pdfContainer;
      
      // Force a reflow to ensure content is visible
      previewRef.current.offsetHeight;

      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating preview:", error);
      console.error("Error stack:", error.stack);
      message.error(`Failed to generate preview: ${error.message}`);
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfContainerRef.current) {
      message.warning("Preview not ready");
      return;
    }

    try {
      message.loading({ content: "Generating PDF...", key: "pdf-download" });

      // Clone the container for PDF generation
      const containerClone = pdfContainerRef.current.cloneNode(true);
      document.body.appendChild(containerClone);

      // Generate PDF
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `${policyData.template_details?.template_name || "Policy"}_${policyData.policy_id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          scrollY: 0,
          scrollX: 0,
          windowHeight: containerClone.scrollHeight,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      };

      await html2pdf().set(opt).from(containerClone).save();

      // Clean up
      document.body.removeChild(containerClone);

      message.success({ content: "PDF downloaded successfully!", key: "pdf-download" });
      
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error("PDF download error:", error);
      message.error({ content: "Failed to download PDF", key: "pdf-download" });
    }
  };

  const handlePrint = () => {
    if (!pdfContainerRef.current) {
      message.warning("Preview not ready");
      return;
    }

    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      const printContent = pdfContainerRef.current.cloneNode(true);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Policy Document - Print</title>
            <style>
              body { margin: 0; padding: 20px; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent.outerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (error) {
      console.error("Print error:", error);
      message.error("Failed to print");
    }
  };

  const handleClose = () => {
    // Clean up preview content
    if (previewRef.current) {
      previewRef.current.innerHTML = "";
    }
    pdfContainerRef.current = null;
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      width="90%"
      style={{ top: 20 }}
      footer={[
        <Button key="close" icon={<X />} onClick={handleClose}>
          Close
        </Button>,
        <Button 
          key="print" 
          icon={<Printer />} 
          onClick={handlePrint}
          disabled={isGenerating || !pdfContainerRef.current}
        >
          Print
        </Button>,
        <Button
          key="download"
          type="primary"
          icon={<Download />}
          onClick={handleDownload}
          disabled={isGenerating || !pdfContainerRef.current}
          loading={isGenerating}
        >
          Download PDF
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>PDF Preview</h2>
        <p style={{ color: "#666", margin: "8px 0 0 0" }}>
          Review your policy document before downloading
        </p>
      </div>
      
      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: "4px",
          padding: "20px",
          backgroundColor: "#fff",
          minHeight: "600px",
          maxHeight: "calc(100vh - 250px)",
          overflow: "auto",
        }}
      >
        {isGenerating ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Generating preview...</p>
          </div>
        ) : (
          <div 
            ref={previewRef}
            style={{ minHeight: "400px" }}
          />
        )}
      </div>
    </Modal>
  );
};

export default PDFPreviewModal;

