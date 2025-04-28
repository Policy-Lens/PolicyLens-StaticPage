# PDFTron/Apryse SDK Integration

This document explains how PDFTron/Apryse SDK has been integrated into the PolicyLens application for document viewing.

## Implementation Details

The PDFTron/Apryse SDK has been implemented as a replacement for the previous multi-library approach to document viewing. This new implementation supports:

- PDF documents
- Word documents (docx, doc)
- Excel spreadsheets (xlsx, xls)

## Key Files

- `src/Components/FileViewer/PDFTronViewer.jsx` - The main component that integrates PDFTron WebViewer
- `src/Components/FileViewer/FileViewerModal.jsx` - Modal that displays the PDFTronViewer component
- `src/Components/FileViewer/pdftron-styles.css` - Custom styles for the PDFTron WebViewer UI
- `public/lib/` - Directory containing PDFTron WebViewer assets

## License

PDFTron is using the following license key:

```
demo:1745828072801:611d0a550300000000bd7a20b30087cff7b07798aba974b478971f4722
```

## Setup Process

The integration required the following steps:

1. Install the PDFTron WebViewer package:

   ```
   npm install @pdftron/webviewer --save
   ```

2. Copy PDFTron WebViewer assets to the public directory:

   ```
   cp -r node_modules/@pdftron/webviewer/public/* public/lib
   ```

3. Create the PDFTronViewer component with the license key

4. Update the FileViewerModal to use the new PDFTronViewer component

## Usage

The PDFTron WebViewer is used in the Policy Library section to view documents. When a user clicks on a document to view, the FileViewerModal is opened with the PDFTronViewer component.

## Benefits of PDFTron/Apryse SDK

- Single SDK for multiple file types (PDF, Word, Excel)
- Improved reliability and performance
- Better user experience with consistent UI
- Advanced viewing options (annotations, search, etc.)
- Reduced dependencies on multiple libraries

## Removed Dependencies

The following packages were replaced by PDFTron/Apryse SDK:

- mammoth (for Word documents)
- xlsx (for Excel spreadsheets)
- @react-pdf-viewer/core and related packages (for PDF viewing)

## Troubleshooting

If documents don't load correctly:

1. Ensure the PDFTron WebViewer assets are correctly copied to `public/lib/`
2. Check that the license key is correctly set in `PDFTronViewer.jsx`
3. Verify the file URL is accessible and the file format is supported
