/**
 * Branding utility functions for PDF generation
 */

/**
 * Default branding values when company branding is not available
 */
export const DEFAULT_BRANDING = {
  logo: null,
  primaryColor: "#2563eb",      // Blue for headings
  secondaryColor: "#64748b",     // Gray for borders
  accentColor: "#e0f2fe",       // Light blue for backgrounds
  fontFamily: "Arial, sans-serif",
  headingFont: "Arial, sans-serif",
  companyName: "Company Name",
  companyAbbreviation: ""
};

/**
 * Get default branding configuration
 * @returns {Object} Default branding object
 */
export const getDefaultBranding = () => {
  return { ...DEFAULT_BRANDING };
};

/**
 * Apply branding styles to HTML content
 * @param {string} html - HTML content to style
 * @param {Object} branding - Branding configuration object
 * @returns {string} Styled HTML string
 */
export const applyBrandingToHTML = (html, branding) => {
  if (!branding) {
    branding = getDefaultBranding();
  }

  // Create a temporary div to manipulate the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Apply font family to all elements
  tempDiv.style.fontFamily = branding.fontFamily || DEFAULT_BRANDING.fontFamily;

  // Style headings (h1, h2, h3, h4, h5, h6)
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    heading.style.color = branding.primaryColor || DEFAULT_BRANDING.primaryColor;
    heading.style.fontWeight = 'bold';
    heading.style.marginTop = '1rem';
    heading.style.marginBottom = '0.5rem';
    
    if (branding.headingFont) {
      heading.style.fontFamily = branding.headingFont;
    }
    
    // Set specific sizes for each heading level
    if (heading.tagName === 'H1') {
      heading.style.fontSize = '2rem';
      heading.style.marginTop = '1.5rem';
    } else if (heading.tagName === 'H2') {
      heading.style.fontSize = '1.5rem';
      heading.style.marginTop = '1.25rem';
    } else if (heading.tagName === 'H3') {
      heading.style.fontSize = '1.25rem';
      heading.style.marginTop = '1rem';
    } else if (heading.tagName === 'H4') {
      heading.style.fontSize = '1.1rem';
    } else if (heading.tagName === 'H5') {
      heading.style.fontSize = '1rem';
    } else if (heading.tagName === 'H6') {
      heading.style.fontSize = '0.9rem';
    }
  });

  // Style paragraphs
  const paragraphs = tempDiv.querySelectorAll('p');
  paragraphs.forEach(p => {
    p.style.marginBottom = '10px';
    p.style.marginTop = '0';
  });

  // Style lists (ul, ol)
  const lists = tempDiv.querySelectorAll('ul, ol');
  lists.forEach(list => {
    list.style.marginTop = '0.5rem';
    list.style.marginBottom = '0.5rem';
    list.style.paddingLeft = '1.5rem';
  });

  // Style list items
  const listItems = tempDiv.querySelectorAll('li');
  listItems.forEach(li => {
    li.style.marginBottom = '0.25rem';
    li.style.display = 'list-item';
  });

  // Style unordered lists (bullet points)
  const ulLists = tempDiv.querySelectorAll('ul');
  ulLists.forEach(ul => {
    ul.style.listStyleType = 'disc';
  });

  // Style ordered lists (numbered)
  const olLists = tempDiv.querySelectorAll('ol');
  olLists.forEach(ol => {
    ol.style.listStyleType = 'decimal';
  });

  // Style tables comprehensively
  const tables = tempDiv.querySelectorAll('table');
  tables.forEach(table => {
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.marginTop = '1rem';
    table.style.marginBottom = '1rem';
    table.style.border = `1px solid ${branding.secondaryColor || DEFAULT_BRANDING.secondaryColor}`;
  });

  // Style table cells (td, th)
  const tableCells = tempDiv.querySelectorAll('td, th');
  tableCells.forEach(cell => {
    cell.style.border = `1px solid ${branding.secondaryColor || DEFAULT_BRANDING.secondaryColor}`;
    cell.style.padding = '8px';
    cell.style.textAlign = 'left';
    cell.style.verticalAlign = 'top';
  });

  // Style table headers
  const tableHeaders = tempDiv.querySelectorAll('th');
  tableHeaders.forEach(th => {
    th.style.backgroundColor = branding.accentColor || DEFAULT_BRANDING.accentColor;
    th.style.fontWeight = 'bold';
  });

  // Style table rows
  const tableRows = tempDiv.querySelectorAll('tr');
  tableRows.forEach(tr => {
    tr.style.border = `1px solid ${branding.secondaryColor || DEFAULT_BRANDING.secondaryColor}`;
  });

  // Preserve text alignment from inline styles
  const alignedElements = tempDiv.querySelectorAll('[style*="text-align"]');
  alignedElements.forEach(el => {
    const style = el.getAttribute('style') || '';
    if (style.includes('text-align')) {
      // Keep existing alignment
      const match = style.match(/text-align:\s*([^;]+)/);
      if (match) {
        el.style.textAlign = match[1].trim();
      }
    }
  });

  // Style links
  const links = tempDiv.querySelectorAll('a');
  links.forEach(link => {
    link.style.color = branding.primaryColor || DEFAULT_BRANDING.primaryColor;
    link.style.textDecoration = 'underline';
  });

  // Style bold, italic, underline
  const boldElements = tempDiv.querySelectorAll('strong, b');
  boldElements.forEach(el => {
    el.style.fontWeight = 'bold';
  });

  const italicElements = tempDiv.querySelectorAll('em, i');
  italicElements.forEach(el => {
    el.style.fontStyle = 'italic';
  });

  const underlineElements = tempDiv.querySelectorAll('u');
  underlineElements.forEach(el => {
    el.style.textDecoration = 'underline';
  });

  return tempDiv.innerHTML;
};

/**
 * Create branded PDF HTML structure
 * @param {Object} policyData - Policy data object
 * @param {Object} branding - Branding configuration
 * @param {Object} mainContent - Main content object with html and plain_text
 * @param {Object} metadata - Metadata object
 * @returns {HTMLElement} Branded HTML container element
 */
export const createBrandedPDFHTML = (policyData, branding, mainContent, metadata) => {
  // Ensure we have valid inputs
  if (!policyData) {
    console.error("createBrandedPDFHTML: policyData is required");
    const errorDiv = document.createElement("div");
    errorDiv.textContent = "Error: Policy data is missing";
    errorDiv.style.padding = "20px";
    errorDiv.style.color = "red";
    return errorDiv;
  }

  if (!branding) {
    branding = getDefaultBranding();
  }

  // Normalize branding keys (backend uses snake_case, frontend uses camelCase)
  const normalizedBranding = {
    logo: branding.logo || null,
    primaryColor: branding.primary_color || branding.primaryColor || DEFAULT_BRANDING.primaryColor,
    secondaryColor: branding.secondary_color || branding.secondaryColor || DEFAULT_BRANDING.secondaryColor,
    accentColor: branding.accent_color || branding.accentColor || DEFAULT_BRANDING.accentColor,
    fontFamily: branding.font_family || branding.fontFamily || DEFAULT_BRANDING.fontFamily,
    headingFont: branding.heading_font || branding.headingFont || DEFAULT_BRANDING.headingFont,
    companyName: branding.company_name || branding.companyName || DEFAULT_BRANDING.companyName,
    companyAbbreviation: branding.company_abbreviation || branding.companyAbbreviation || DEFAULT_BRANDING.companyAbbreviation,
  };

  // Create main container
  const pdfContainer = document.createElement("div");
  pdfContainer.style.padding = "40px";
  pdfContainer.style.fontFamily = normalizedBranding.fontFamily;
  pdfContainer.style.fontSize = "12pt";
  pdfContainer.style.lineHeight = "1.6";
  pdfContainer.style.color = "#000";
  pdfContainer.style.width = "100%";
  pdfContainer.style.minHeight = "400px";
  pdfContainer.style.backgroundColor = "#ffffff";

  // Add a style element for consistent PDF rendering
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    /* Heading styles */
    h1 { font-size: 2rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; color: ${normalizedBranding.primaryColor}; }
    h2 { font-size: 1.5rem; font-weight: bold; margin-top: 1.25rem; margin-bottom: 0.5rem; color: ${normalizedBranding.primaryColor}; }
    h3 { font-size: 1.25rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; color: ${normalizedBranding.primaryColor}; }
    h4 { font-size: 1.1rem; font-weight: bold; margin-top: 0.75rem; margin-bottom: 0.5rem; color: ${normalizedBranding.primaryColor}; }
    h5 { font-size: 1rem; font-weight: bold; margin-top: 0.5rem; margin-bottom: 0.5rem; color: ${normalizedBranding.primaryColor}; }
    h6 { font-size: 0.9rem; font-weight: bold; margin-top: 0.5rem; margin-bottom: 0.5rem; color: ${normalizedBranding.primaryColor}; }
    
    /* Paragraph styles */
    p { margin-bottom: 10px; margin-top: 0; }
    
    /* List styles */
    ul, ol { margin-top: 0.5rem; margin-bottom: 0.5rem; padding-left: 1.5rem; }
    ul { list-style-type: disc; }
    ol { list-style-type: decimal; }
    li { margin-bottom: 0.25rem; display: list-item; }
    
    /* Table styles */
    table { border-collapse: collapse; width: 100%; margin-top: 1rem; margin-bottom: 1rem; border: 1px solid ${normalizedBranding.secondaryColor}; }
    td, th { border: 1px solid ${normalizedBranding.secondaryColor}; padding: 8px; text-align: left; vertical-align: top; }
    th { background-color: ${normalizedBranding.accentColor}; font-weight: bold; }
    tr { border: 1px solid ${normalizedBranding.secondaryColor}; }
    
    /* Text formatting */
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
    u { text-decoration: underline; }
    
    /* Link styles */
    a { color: ${normalizedBranding.primaryColor}; text-decoration: underline; }
    
    /* Text alignment */
    [style*="text-align: left"] { text-align: left !important; }
    [style*="text-align: center"] { text-align: center !important; }
    [style*="text-align: right"] { text-align: right !important; }
    [style*="text-align: justify"] { text-align: justify !important; }
  `;
  pdfContainer.appendChild(styleElement);

  // Create header section
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "flex-start";
  header.style.marginBottom = "30px";
  header.style.paddingBottom = "20px";
  header.style.borderBottom = `2px solid ${normalizedBranding.secondaryColor}`;

  // Left side: Logo and company info
  const headerLeft = document.createElement("div");
  headerLeft.style.flex = "1";

  if (normalizedBranding.logo) {
    const logoImg = document.createElement("img");
    logoImg.src = normalizedBranding.logo;
    logoImg.alt = "Company Logo";
    logoImg.style.maxWidth = "150px";
    logoImg.style.maxHeight = "80px";
    logoImg.style.marginBottom = "10px";
    headerLeft.appendChild(logoImg);
  } else {
    // Placeholder for logo
    const logoPlaceholder = document.createElement("div");
    logoPlaceholder.style.width = "150px";
    logoPlaceholder.style.height = "80px";
    logoPlaceholder.style.border = `1px solid ${normalizedBranding.secondaryColor}`;
    logoPlaceholder.style.display = "flex";
    logoPlaceholder.style.alignItems = "center";
    logoPlaceholder.style.justifyContent = "center";
    logoPlaceholder.style.color = "#999";
    logoPlaceholder.style.fontSize = "12px";
    logoPlaceholder.textContent = "<Company Logo>";
    logoPlaceholder.style.marginBottom = "10px";
    headerLeft.appendChild(logoPlaceholder);
  }

  // Company name
  const companyName = document.createElement("div");
  companyName.textContent = normalizedBranding.companyName;
  companyName.style.fontSize = "20pt";
  companyName.style.fontWeight = "bold";
  companyName.style.marginBottom = "5px";
  companyName.style.color = normalizedBranding.primaryColor;
  headerLeft.appendChild(companyName);

  // Company abbreviation
  if (normalizedBranding.companyAbbreviation) {
    const companyAbbr = document.createElement("div");
    companyAbbr.textContent = normalizedBranding.companyAbbreviation;
    companyAbbr.style.fontSize = "14pt";
    companyAbbr.style.color = normalizedBranding.secondaryColor;
    headerLeft.appendChild(companyAbbr);
  }

  header.appendChild(headerLeft);

  // Right side: Document title
  const headerRight = document.createElement("div");
  headerRight.style.textAlign = "right";
  const docTitle = document.createElement("h1");
  docTitle.textContent = policyData.template_details?.template_name || "Policy Document";
  docTitle.style.fontSize = "24pt";
  docTitle.style.fontWeight = "bold";
  docTitle.style.margin = "0";
  docTitle.style.color = normalizedBranding.primaryColor;
  if (normalizedBranding.headingFont) {
    docTitle.style.fontFamily = normalizedBranding.headingFont;
  }
  headerRight.appendChild(docTitle);
  header.appendChild(headerRight);

  pdfContainer.appendChild(header);

  // Metadata section
  if (metadata && Object.keys(metadata).length > 0) {
    const metadataSection = document.createElement("div");
    metadataSection.style.marginBottom = "30px";
    metadataSection.style.padding = "15px";
    metadataSection.style.backgroundColor = normalizedBranding.accentColor;
    metadataSection.style.borderRadius = "5px";
    metadataSection.style.border = `1px solid ${normalizedBranding.secondaryColor}`;

    const metadataTitle = document.createElement("h2");
    metadataTitle.textContent = "Metadata";
    metadataTitle.style.fontSize = "18pt";
    metadataTitle.style.fontWeight = "bold";
    metadataTitle.style.marginBottom = "15px";
    metadataTitle.style.color = normalizedBranding.primaryColor;
    if (normalizedBranding.headingFont) {
      metadataTitle.style.fontFamily = normalizedBranding.headingFont;
    }
    metadataSection.appendChild(metadataTitle);

    Object.keys(metadata).forEach((key) => {
      const field = metadata[key];
      if (field.value) {
        const metadataItem = document.createElement("div");
        metadataItem.style.marginBottom = "10px";
        const label = document.createElement("strong");
        label.textContent = `${key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}: `;
        label.style.color = normalizedBranding.primaryColor;
        const value = document.createTextNode(field.value);
        metadataItem.appendChild(label);
        metadataItem.appendChild(value);
        metadataSection.appendChild(metadataItem);
      }
    });

    pdfContainer.appendChild(metadataSection);
  }

  // Content section
  const contentSection = document.createElement("div");
  contentSection.style.marginTop = "20px";
  contentSection.className = "policy-content"; // Add class for styling

  if (mainContent && mainContent.html) {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.className = "rich-text-content"; // Add class for styling
    
    // Apply branding to content
    const styledHTML = applyBrandingToHTML(mainContent.html, normalizedBranding);
    tempDiv.innerHTML = styledHTML;

    // Ensure all formatting is preserved
    tempDiv.style.width = "100%";
    tempDiv.style.fontFamily = normalizedBranding.fontFamily;

    contentSection.appendChild(tempDiv);
  } else {
    const noContent = document.createElement("p");
    noContent.textContent = "No content available.";
    noContent.style.fontStyle = "italic";
    noContent.style.color = normalizedBranding.secondaryColor;
    contentSection.appendChild(noContent);
  }

  pdfContainer.appendChild(contentSection);

  // Footer
  const footer = document.createElement("div");
  footer.style.marginTop = "40px";
  footer.style.paddingTop = "20px";
  footer.style.borderTop = `1px solid ${normalizedBranding.secondaryColor}`;
  footer.style.fontSize = "10pt";
  footer.style.color = normalizedBranding.secondaryColor;
  footer.textContent = `Policy ID: ${policyData.policy_id} | Generated on ${new Date().toLocaleString()}`;
  pdfContainer.appendChild(footer);

  return pdfContainer;
};

