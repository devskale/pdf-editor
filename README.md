# React PDF Annotator

A simple and interactive PDF editor built with React and TypeScript, allowing users to add, edit, and manage text annotations on PDF documents.

## Description

This application provides a user-friendly interface for loading PDF files and adding text-based annotations directly onto the document pages. Users can customize the text properties such as font family, size, color, and alignment. Annotations can be moved, resized, copied, and deleted. The editor also includes basic undo/redo functionality and the ability to save the annotated PDF.

## Features

*   **Load PDF Documents:** Easily upload PDF files from your local machine.
*   **Add Text Annotations:** Click anywhere on a PDF page to add a new text box.
*   **Edit Text Properties:** Customize the text content, font family, font size, text color, and background color of selected annotations using the Property Panel.
*   **Horizontal and Vertical Alignment:** Control the alignment of text within the annotation box.
*   **Move and Resize Annotations:** Drag and resize text annotations directly on the PDF viewer.
*   **Delete Annotations:** Remove unwanted annotations.
*   **Copy Annotations:** Duplicate existing annotations with all their properties.
*   **Undo and Redo Actions:** Revert or reapply recent changes to annotations.
*   **Navigate Pages:** Move between different pages of the PDF document.
*   **Zoom In/Out:** Adjust the zoom level of the PDF viewer.
*   **Save Annotated PDF:** Download the PDF with the added annotations embedded.

## Technologies Used

*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A superset of JavaScript that adds static typing.
*   **PDF.js:** A portable Document Format (PDF) renderer written in JavaScript, used for rendering PDF pages.
*   **pdf-lib:** A JavaScript library for creating and modifying PDF documents, used for adding annotations and saving the modified PDF.
*   **Tailwind CSS:** A utility-first CSS framework for rapid styling.
*   **Lucide React:** A simply beautiful open-source icon library, used for various icons in the UI.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

Make sure you have the following installed:

*   Node.js (v14 or higher recommended)
*   npm or yarn

### Cloning the Repository
```
bash
git clone <repository_url>
cd react-pdf-editor
```
### Installation

Install the project dependencies:
```
bash
npm install
# or
yarn install
```
### Running the Development Server

Start the development server:
```
bash
npm start
# or
yarn start
```
The application should now be running at `http://localhost:5173` (or another port if 5173 is in use).

## Usage

### File Upload

Upon opening the application, you will be presented with a file upload area. Drag and drop your PDF file onto this area or click to browse for a file.

### Toolbar

Located at the top of the page, the toolbar provides access to various actions:

*   **PDF Editor Title:** Displays the application title.
*   **Undo/Redo:** Buttons to undo or redo the last annotation action.
*   **Add Text:** Click this button to enter "add text" mode.
*   **Copy Selected Textbox:** (Appears when a text annotation is selected) Click to create a duplicate of the selected annotation.
*   **Page Navigation:** Buttons and a display for navigating between PDF pages.
*   **Zoom:** Buttons and a display for adjusting the zoom level.
*   **Save PDF:** Click to download the annotated PDF.

### PDF Viewer

The central area displays the pages of the loaded PDF document. This is where you will see and interact with the annotations.

*   **Click to Add Text:** When in "add text" mode (after clicking "Add Text" in the toolbar), click anywhere on the page to place a new text box.
*   **Select Annotation:** Click on an existing text annotation to select it and make the Property Panel active.
*   **Move Annotation:** Click and drag a selected annotation to move it on the page.
*   **Resize Annotation:** Drag the resize handles (small blue circles) on the corners of a selected annotation to change its size.

### Property Panel

Located on the right side, the Property Panel becomes active when a text annotation is selected. It allows you to modify the properties of the selected annotation:

*   **Font Family:** Select a different font from the dropdown.
*   **Font Size:** Choose a different font size from the dropdown.
*   **Text Color:** Select the text color using the color picker or by entering a hex value.
*   **Background Color:** Select the background color of the annotation box using the color picker or by entering a hex value.
*   **Horizontal Alignment:** Buttons to align the text to the left, center, or right within the text box.
*   **Vertical Alignment:** Buttons to align the text to the top, middle, or bottom within the text box.
*   **Position & Size:** Numerically adjust the X and Y coordinates, width, and height of the annotation.

### Actions

*   **Add Text:** Click the "Add Text" button in the toolbar, then click on the PDF page where you want the text box to appear.
*   **Edit Text:** Double-click on an existing text annotation to enter editing mode. Type directly into the text box. Click outside the text box or press Enter (without Shift) to exit editing mode.
*   **Move:** Click and drag a selected text annotation.
*   **Resize:** Drag the blue circular handles on the corners of a selected text annotation.
*   **Delete:** Select a text annotation and click the "X" button that appears at the top right of the selected box. Confirm the deletion in the dialog.
*   **Copy:** Select a text annotation, then click the "Copy Selected Textbox" button in the toolbar. A new annotation with the same properties will be created.
*   **Save:** Click the "Save PDF" button in the toolbar to download the PDF with your added annotations.
*   **Undo/Redo:** Use the curved arrow icons in the toolbar to undo or redo annotation changes.

## Project Structure
```
.
├── public/
├── src/
│   ├── components/          # React components (Toolbar, PDFViewer, PropertyPanel, etc.)
│   ├── hooks/               # Custom React hooks (usePDFEditor)
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   ├── index.css            # Global styles (Tailwind CSS)
│   ├── main.tsx             # Entry point
│   └── vite-env.d.ts        # Vite environment types
├── .gitignore
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML entry file
├── package-lock.json        # npm dependencies lock file
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration (for Tailwind)
├── README.md                # Project README
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.app.json        # TypeScript configuration for the app
├── tsconfig.json            # Base TypeScript configuration
├── tsconfig.node.json       # TypeScript configuration for Node environment
└── vite.config.ts           # Vite build configuration
```
## License

This project is licensed under the MIT License - see the LICENSE file for details (Note: A LICENSE file should be created separately with the MIT license text).