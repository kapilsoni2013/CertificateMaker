# Certificate Maker

A React application for creating custom certificates by uploading templates and adding candidate information.

## Features

1. **Candidate Management**
   - Add, edit, and delete candidate records
   - Store candidate details including name, roll number, class, and subject marks

2. **Certificate Template Management**
   - Upload certificate template images
   - Define regions on the template where candidate information should appear
   - Map regions to specific candidate data fields

3. **Certificate Generation**
   - Select a template and candidate record
   - Generate certificates with candidate information placed in the defined regions
   - Download generated certificates as PNG images

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/certificatemaker.git
   cd certificatemaker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Adding Candidates

1. Navigate to the Candidates page
2. Click "Add New Candidate"
3. Fill in the candidate details including name, roll number, class, and subject marks
4. Click "Add Candidate" to save

### Creating Certificate Templates

1. Navigate to the Templates page
2. Click "Add New Template"
3. Upload a certificate template image
4. Define regions on the template by clicking and dragging on the image
5. Name each region to match candidate data fields (e.g., "name", "rollNumber", "class", "subjects.math")
6. Click "Save Template" when finished

### Generating Certificates

1. Navigate to the Generate Certificate page
2. Select a certificate template from the dropdown
3. Select a candidate from the dropdown
4. Click "Generate Certificate"
5. Preview the generated certificate
6. Click "Download Certificate" to save as a PNG image

## Technologies Used

- React.js
- React Router
- HTML5 Canvas API
- Local Storage for data persistence

## License

This project is licensed under the MIT License - see the LICENSE file for details.