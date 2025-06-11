# Certificate Maker

A React application for creating and generating certificates with custom templates and candidate data.

## Features

1. **Candidate Management**
   - Add, edit, and delete candidate records
   - Store candidate details including name, roll number, class, and subject marks

2. **Template Management**
   - Upload certificate template images
   - Define regions on the template where candidate data will be placed
   - Name regions to map to specific candidate data fields

3. **Certificate Generation**
   - Select a template and candidate
   - Generate certificates with candidate data placed in the defined regions
   - Download generated certificates

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Usage

1. **Adding Candidates**
   - Navigate to the Candidates page
   - Fill in the candidate details and subject marks
   - Click "Add Candidate"

2. **Creating Templates**
   - Navigate to the Templates page
   - Upload a certificate template image
   - Click and drag on the image to define regions
   - Name each region to match candidate data fields (e.g., "name", "rollNumber", "className", or a subject name)
   - Click "Save Template"

3. **Generating Certificates**
   - Navigate to the Generate Certificates page
   - Select a template and a candidate
   - Click "Generate Certificate"
   - Download the generated certificate

## Technologies Used

- React.js
- React Router
- React Bootstrap
- HTML5 Canvas for template region selection
- Local Storage for data persistence

## License

This project is licensed under the MIT License.