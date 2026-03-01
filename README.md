# Document Signature App

A secure, full-stack web application that enables users to upload documents, place digital signatures, share signing links, and generate legally traceable signed PDFs — similar to DocuSign and Adobe Sign.

## Features
- **JWT-based Authentication**: Secure user login and registration.
- **Secure PDF Upload**: Store and manage PDF documents using Multer.
- **Drag-and-Drop Signature Placement**: Visual PDF editor relying on `react-pdf` and HTML5 Drag & Drop to position signature coordinates.
- **Server-side PDF Modification**: Finalize signed PDFs natively in Node.js using `pdf-lib`.
- **Public Signature Links**: Tokenized public URLs for external signers to seamlessly provide their signature.
- **Audit Trails**: Logs signer IP, timestamp, and action history via customized MongoDB schemas.
- **Status Lifecycle**: Track if signatures are Pending, Signed, or Rejected.

## Tech Stack
**Frontend**: React (Vite+TypeScript), Tailwind CSS, React-PDF, Axios, React Router.
**Backend**: Node.js, Express, MongoDB (Mongoose), PDF-Lib, JSON Web Token (JWT), Bcrypt, Multer.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB connection string.

### Setup

1. **Clone the repository.**
2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```
3. **Configure Environment Variables**:
   In `backend/.env`, set:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/digital-signature
   JWT_SECRET=your_jwt_secret
   ```
4. **Run Backend**:
   ```bash
   npm run dev
   ```

5. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```
6. **Run Frontend**:
   ```bash
   npm run dev
   ```

The application will be running at `http://localhost:5173` (Frontend) and `http://localhost:5000` (Backend).

## Deployment Instructions
- The **Frontend** can be deployed statically to Vercel or Netlify. Make sure to set the build command to `npm run build` and publish directory to `dist`.
- The **Backend** can be deployed to Render or Railway. Make sure to define `MONGO_URI` securely in the production environment. Set the build command to `npm run build` and start command to `npm start`.

## Project Structure
- **/frontend**: Contains React single-page application and visual UI.
- **/backend**: Contains Express.js server, MongoDB models, file upload infrastructure, and PDF generation algorithms.

---
Built as a demonstration of production-ready SaaS digital signature systems.
