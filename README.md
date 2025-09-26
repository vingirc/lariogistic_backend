Logistics Automation Backend
This is the backend for a logistics process automation system developed for a Hackathon. It digitizes manual processes like vacation requests or document approvals, providing a centralized dashboard and calendar for tracking. Built with Express, MySQL, and Cloudinary, it integrates with a React frontend and supports Microsoft 365/Teams for notifications and calendar updates.
Tech Stack

Backend: Node.js, Express
Database: MySQL
File Storage: Cloudinary
API Documentation: Swagger
Frontend: React (separate repository)
Integrations: Microsoft 365 (Outlook/Teams for notifications, calendar)

Setup

Clone the repository:git clone <repository-url>
cd logistics-backend


Install dependencies:npm install


Set up environment variables:Create a .env file in the root directory with:PORT=3000
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=logistics_db
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
OUTLOOK_USER=your_outlook_email
OUTLOOK_PASS=your_outlook_password


Set up the database:Run the SQL script to create tables:mysql -u your_user -p < script.sql


Start the server:npm start

Or for development with hot reload:npm run dev


Access API documentation:Visit http://localhost:3000/api-docs for Swagger UI.

Project Structure
├── api
│   └── index.js               # Main Express server
├── src
│   ├── config
│   │   ├── auth.js           # JWT authentication config
│   │   ├── db.js            # MySQL connection
│   │   └── swagger.js       # Swagger configuration
│   ├── controllers
│   │   ├── authController.js # Authentication endpoints
│   │   └── usuariosController.js # Request/approval endpoints
│   ├── middleware
│   │   ├── auth.js           # JWT middleware
│   │   ├── error.js         # Error handling
│   │   ├── logger.js        # Request logging
│   │   ├── rateLimit.js     # Rate limiting
│   │   └── validate.js      # Request validation
│   ├── routes
│   │   ├── authRoutes.js    # Auth routes
│   │   ├── index.js         # Route aggregator
│   │   └── usuariosRoutes.js # Request/approval routes
│   ├── services
│   │   ├── authService.js   # Auth logic
│   │   ├── cloudinaryService.js # Cloudinary file uploads
│   │   ├── refreshTokenService.js # Token refresh
│   │   └── usuarioService.js # Request/approval logic
│   └── utils
│       └── env.js           # Environment variable loader
├── script.sql                # Database schema
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
└── vercel.json              # Vercel deployment config

API Endpoints

POST /requests: Create a new request (e.g., vacation).
GET /requests: List all requests.
PUT /requests/:id/approve: Approve or reject a request.
API Docs: /api-docs (Swagger UI).

Features

Digitalized Processes: Automates vacation requests or document approvals.
Centralized Control: Dashboard and calendar for tracking.
Microsoft 365 Integration: Sends Outlook calendar invites and Teams notifications for approvals.
Scalability: Modular design for adding new processes.
Usability: Simple API for easy integration with React frontend.

Notes

Update script.sql for your specific process (e.g., vacation or document tables).
Configure Microsoft 365 credentials in .env for Outlook/Teams integration.
