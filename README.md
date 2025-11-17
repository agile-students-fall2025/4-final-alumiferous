# InstaSkill

## Product Vision Statement
InstaSkill is a collaborative skill exchange platform where users can teach what they know and learn what they want, without the use of money.  The idea behind InstaSkill is to create a trusted community where knowledge, time, and experience act as the true currency.  

## Project Description
The platform connects individuals based on the skills they offer and the ones they wish to gain. By providing features such as matching, scheduling, and feedback, InstaSkill encourages meaningful, peer-to-peer learning interactions. Our team designed and planned the system using Agile principles, focusing on addressing the real-world challenge of making learning affordable and accessible.

## Team Members
- Alisha Atif (aa10699@nyu.edu)  
- Godbless Osei (gmo6996@nyu.edu)  
- Bernard Gharbin (bg2696@nyu.edu)  
- Bismark Buernortey Buer (bb3621@nyu.edu)  
- Ajok Thon (at4933@nyu.edu)  

## Project Background and Target Users
InstaSkill was inspired by the growing need for affordable, community-based learning solutions. Students and freelancers often have valuable skills but limited resources or opportunities to access others’ expertise. InstaSkill bridges that gap by enabling people to directly exchange their skills in a structured and trustworthy environment. This creates a continuous cycle of teaching, learning, and improving.

InstaSkill is designed for anyone interested in learning or teaching through collaboration. It is especially useful for students seeking help in academic or creative areas, freelancers wanting to exchange professional skills, or hobbyists looking to explore new activities and share their passions.  

## Core Features
### User Profiles
- Secure account creation and login  
- Personal bio and list of offered and wanted skills  
- Editable profile with progress tracking

### Skill Matching
- Search or filter by category (languages, art, music, coding, sports, etc.)  
- Matching system that recommends suitable partners based on skills and interests

### Session Scheduling
- Request and accept skill-swap sessions  
- Calendar view for managing upcoming and completed sessions  
- Notifications and reminders for confirmed swaps

### Messaging and Reviews
- Direct communication between users  
- Option to leave reviews and ratings after each session  

### Dashboard
- Overview of user activity, completed sessions, and ratings  
- Track ongoing learning or teaching progress  


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

## How to Contribute
Refer to the CONTRIBUTING.md file for details on how to follow branching and commit conventions, submit pull requests and review and test code.
