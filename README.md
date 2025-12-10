# InstaSkill

# Deployment

Find InstaSkill here: [Link](http://146.190.147.159)

## Product Vision Statement

InstaSkill is a collaborative skill‑exchange platform where people can share what they know and learn the skills they want, all without using money. It is designed to foster a trusted community in which knowledge, time, and experience function as the true currency, allowing members to grow together through teaching and learning.

## Project Description

The platform connects individuals based on the skills they can offer and those they wish to acquire. By providing features such as skill creation, direct messaging, and skill requests, InstaSkill facilitates meaningful, peer‑to‑peer learning interactions. The system was designed and planned by our team using Agile principles, with a focus on addressing the real‑world challenge of making learning both affordable and accessible.

## Team Members

- Alisha Atif - [Github](https://github.com/aa10699Alisha)
- Godbless Osei - [Github](https://github.com/GodblessOsei)
- Bernard Gharbin - [Github](https://github.com/GharbinBern)
- Bismark Buernortey Buer - [Github](https://github.com/Buernortey67)
- Ajok Thon - [Github](https://github.com/ajokt123)

## Project Background and Target Users

InstaSkill was inspired by the growing need for affordable, community-based learning solutions. Students and freelancers often have valuable skills but limited resources or opportunities to access others’ expertise. InstaSkill bridges that gap by enabling people to directly exchange their skills in a structured and trustworthy environment. This creates a continuous cycle of teaching, learning, and improving.

InstaSkill is designed for anyone interested in learning or teaching through collaboration. It is especially useful for students seeking help in academic or creative areas, freelancers wanting to exchange professional skills, or hobbyists looking to explore new activities and share their passions.

## Core Features

### User Profiles

- Secure account creation and login
- Personal bio and list of offered skills
- Editable profile

### Skill Matching

- Search or filter by category (languages, art, music, coding, sports, etc.)
- Filter by most popular skills

### Skill Request Sessions

- Send requests for skills to other users
- Accept or decline incoming skill requests

### Messaging and Notifications

- Direct, real‑time communication between users for coordinating skill exchanges
- Get notified when someone requests a skill from you

## Technology Stack

- **Front-End**

  - React
  - React Router DOM

- **Back-End**

  - Node.js
  - **Express.js** (all back-end routes are implemented using Express)

- **Database**

  - MongoDB (planned, not required for this sprint; mock data is used for now)

- **Testing**
  - Front-end: Jest + React Testing Library (for UI components)
  - Back-end: **Mocha + Chai** for unit tests
  - Coverage: **c8** for back-end code coverage

## Development Progress

### Sprint 0: Prototyping

- Product Owner: Ajok Thon
- Scrum Master: Bismark Buernortey Buer

Created a clickable mobile prototype of the InstaSkill app in Figma using the existing wireframes, linking all key screens and navigation flows so that core use cases can be tested end‑to‑end before development.

### Sprint 1: Frontend

- Product Owner: Godbless Osei
- Scrum Master: Bernard Gharbin

The front-end application has been developed using React. The following components and features have been implemented:

- User authentication interface (Login, ResetPassword)
- User profile management (Profile, EditProfile, DeleteAccount)
- Onboarding flow for new users
- Skill management (UploadSkill, Skill, SkillDescription, SkillSelector, SavedSkills)
- Messaging system (Messages, Chat)
- Request management (Requests, DraftRequest)
- Settings and account management
- Theme support via ThemeContext
- Global skills state management via SkillsContext
- API integration setup in the api folder

### Sprint 2: Backend

- Product Owner: Bismark Buernortey Buer
- Scrum Master: Ajok Thon

Backend API integration, testing, and enhanced features have been implemented:

**Backend API Development:**

- `/api/auth` - User authentication (login, signup, logout)
- `/api/skills` - Get all skills, create new skills with video upload support
- `/api/requests` - Create and manage skill exchange requests, view incoming requests
- `/api/profile` - User profile management and photo upload
- `/api/chats` - Chat creation and management
- `/api/messages` - Real-time messaging between users
- `/api/onboarding` - User onboarding flow
- `/api/reports` - Report problems and reset password functionality
- CORS middleware configured for cross-origin requests
- Environment variables properly configured for secure API access

**Frontend-Backend Integration:**

- Login/Signup flow connected to authentication API with error handling
- SkillDescription page displays skill details from backend
- DraftRequest form submits skill exchange requests to backend
- UploadSkill page posts new skills with video upload capability
- Profile page with photo upload and edit functionality
- Skills data fetched from backend API and managed via SkillsContext
- Chat and messaging system integrated with backend
- Incoming requests feature displays skill exchange requests
- Error handling and loading states implemented across all components

**Testing & Quality Assurance:**

- Backend API tests using Mocha + Chai + Supertest
- Test coverage for all major endpoints: skills, requests, chats, messages, auth, onboarding
- Automated tests validate API functionality and error handling
- Code coverage tracking with c8

**Additional Features:**

- Video upload capability for skill demonstrations
- Profile photo upload and management
- Improved UI with hamburger menus and navigation
- Enhanced error messages and user feedback

## Sprint 3: Database Integration

- Product Owner: Bernard Gharbin
- Scrum Master: Alisha Atif

Integrated a hosted MongoDB Atlas database into the Express.js backend using Mongoose, added server‑side validation for incoming data, and secured all connection credentials with environment variables and JWT‑based authentication for protected routes.

## Sprint 4: Deployment

- Product Owner: Alisha Atif
- Scrum Master: Godbless Osei

Deployed the full‑stack InstaSkill application to a DigitalOcean Droplet, configuring the Node/Express backend and React frontend for a production environment with continuous deployment via GitHub Actions.

## How to Run the Application

### Prerequisites

- Node.js (version 14 or higher recommended)
- npm package manager

### Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/agile-students-fall2025/4-final-alumiferous.git
   cd 4-final-alumiferous
   ```
2. In Terminal 1, navigate to the front-end directory, install dependencies, and start the React app

   ```
   cd front-end
   npm install
   npm start
   ```

   The front-end will be available at: http://localhost:3000

3. In a new Terminal (Terminal 2), navigate to the back-end directory, install dependencies, and start the Express server:
   ```
   cd back-end
   npm install
   npm start
   ```
   The back-end API will be available at: http://localhost:4000
4. (Optional) To run back-end tests from Terminal 2:

   ```
   cd back-end
   npm test

   ```

### Other Available Commands

In the front-end directory, you can run:

- `npm test` - Launches the test runner in interactive watch mode
- `npm run build` - Builds the app for production to the build folder
- `npm run eject` - Ejects from Create React App (this is irreversible)

---

## Project Structure

```
4-final-alumiferous/
├── front-end/                     # React.js front-end application
│   ├── public/                    # Public assets
│   ├── src/                       # Front-end source code
│   ├── .env.example               # Example front-end environment variables
│   ├── package.json               # Front-end dependencies and scripts
│   └── README.md                  # Front-end setup instructions
├── back-end/                      # Express.js back-end application
│   ├── models/                    # Database models
│   ├── routes/                    # API routes
│   ├── test/                      # Back-end tests
│   ├── .env.example               # Example back-end environment variables
│   ├── app.js                     # Express application and routes
│   ├── server.js                  # Back-end server entry point
│   ├── package.json               # Back-end dependencies and scripts
│   └── README.MD                  # Back-end setup instructions
├── ux-design/                     # Wireframes and design prototypes
└── README.md                      # Project overview and deployment link

```

---

## How to Contribute

Refer to the CONTRIBUTING.md file for details on how to follow branching and commit conventions, submit pull requests and review and test code.
