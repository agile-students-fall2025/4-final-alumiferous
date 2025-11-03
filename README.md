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
Frontend: React with React Router DOM  
Backend: Node.js and Express (in development)  
Database: MongoDB (planned)  
Authentication: JWT (JSON Web Token) (planned)  
Testing: Jest and React Testing Library  

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

The backend development is planned but not yet implemented. Database integration will follow backend setup.

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

2. Navigate to the front-end directory and install dependencies:
   ```
   cd front-end
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. The application will open in your browser at http://localhost:3000

### Other Available Commands

In the front-end directory, you can run:

- `npm test` - Launches the test runner in interactive watch mode
- `npm run build` - Builds the app for production to the build folder
- `npm run eject` - Ejects from Create React App (this is irreversible)

## How to Contribute
Refer to the CONTRIBUTING.md file for details on how to follow branching and commit conventions, submit pull requests and review and test code.
