# 🧠 AiBrain: AI-Powered Document Reminder

AiBrain is a high-performance **MERN Stack** application designed to automate life's paperwork. By leveraging **Gemini 2.5 Flash**, the app extracts critical dates (due dates, expiration dates) from images of bills and invoices, then automatically syncs them to your **Google Calendar**.



## 🚀 Key Features

- **Multimodal AI Analysis**: Uses Google Gemini 2.5 Flash to "read" and understand document context.
- **Automated Scheduling**: Direct integration with Google Calendar API to set reminders instantly.
- **Professional Dashboard**: A "Midnight Slate" themed UI built with React for a premium user experience.
- **Secure Data Handling**: MongoDB Atlas stores extraction history with specific user isolation.
- **Advanced OCR**: Integrated OCR pipeline that converts image data into clean, searchable text.

## 🛠️ Tech Stack

- **Frontend**: React.js, Axios, Plus Jakarta Sans & JetBrains Mono Typography
- **Backend**: Node.js, Express.js, Multer (File Handling)
- **AI/LLM**: Google Gemini 2.5 Flash (Generative AI SDK)
- **Database**: MongoDB Atlas (NoSQL)
- **APIs**: Google Calendar API, Google Auth

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Google Cloud Project (with Calendar API enabled)
- Gemini API Key from Google AI Studio

### Step-by-Step Guide

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/AiBrain.git](https://github.com/yourusername/AiBrain.git)
   cd AiBrain
Install Dependencies

Bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install
cd ..
Environment Configuration Create a .env file in the root directory:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
Run the Application

Bash
# Start the backend and frontend simultaneously
npm run dev
📐 Architecture Overview
AiBrain follows a 3-tier architecture:

Client Tier: React handles image selection and displays the "Bento Box" analysis results.

Logic Tier: Express routes the image to the OCR service and then passes raw text to Gemini 2.5.

Data Tier: MongoDB stores the finalized reminder, and the Google Calendar API creates the external event.

🛡️ License

Developed by Dhiraj Kumar
