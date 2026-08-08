📚 StudyPlanner

StudyPlanner is a study management application designed to help students organize their academic workload, maintain consistent study habits, and track their progress over time.

It combines task management, focused study sessions, streak tracking, analytics, and deadline reminders into a single platform.

✨ Features

* 📝 Task Management
    * Create and manage study tasks
    * Organize tasks by subject
    * Track pending and completed work
* ⏱️ Focus Timer
    * Built-in Pomodoro-style study timer
    * Dedicated sessions for focused studying
* 📊 Study Analytics
    * Track study time
    * Analyze study patterns
    * View subject-wise progress
* 🔥 Study Streaks
    * Maintain daily study streaks
    * Encourage consistent study habits
* 🔔 Deadline Reminders
    * Keep track of upcoming deadlines
    * Reduce the chances of missing important academic work
* 📱 Responsive Interface
    * Designed to work across desktop and mobile devices

🛠️ Tech Stack

Frontend

* HTML
* CSS
* JavaScript

Backend & Database

* Node.js
* Express.js
* PostgreSQL
* Neon Database

Deployment

* Frontend: Vercel
* Backend: Render
* Database: Neon

Other Technologies

* REST APIs
* Browser Storage APIs
* Charting/analytics libraries

🏗️ Architecture

┌──────────────────────┐
│      User / UI       │
│   Web / Mobile App   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Frontend        │
│   HTML / CSS / JS    │
└──────────┬───────────┘
           │ REST API
           ▼
┌──────────────────────┐
│       Backend        │
│   Node.js + Express  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    PostgreSQL DB     │
│    Neon Database     │
└──────────────────────┘

🚀 Getting Started

Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Git

1. Clone the repository

git clone <YOUR_REPOSITORY_URL>
cd StudyPlanner

2. Install dependencies

npm install

3. Configure environment variables

Create a .env file in the project root:

DATABASE_URL=your_database_url

Never commit .env, .env.local, .env.production, or other files containing secrets to GitHub.

You can provide a .env.example file containing only placeholder values.

4. Start the development server

npm start

The application should now be available locally.

📂 Project Structure

StudyPlanner/
│
├── public/              # Frontend assets
├── src/                 # Application source code
│   ├── routes/          # API routes
│   ├── controllers/     # Application logic
│   └── ...
│
├── .env.example         # Environment variable template
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

The structure may vary depending on the current version of the project.

📱 Android Version

StudyPlanner also has an Android version intended to provide access to the same study-management functionality on mobile devices.

The Android application is currently distributed separately and is not available through the Google Play Store.

🔐 Security

StudyPlanner uses environment variables for sensitive configuration such as database credentials and API keys.

Before pushing the project to GitHub, make sure sensitive files are excluded:

.env
.env.*
!.env.example

If a secret has accidentally been pushed to a repository, rotate/revoke the secret rather than simply deleting the file.

🔮 Future Improvements

Some potential improvements include:

* Improved mobile experience
* Push notifications
* More detailed study analytics
* Calendar integration
* Cloud synchronization
* Better offline support
* Google/Apple authentication
* Play Store release
* AI-assisted study planning

🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository
2. Create a feature branch

git checkout -b feature/your-feature

3. Commit your changes

git commit -m "Add your feature"

4. Push the branch

git push origin feature/your-feature

5. Open a Pull Request

📄 License

This project is currently intended for educational and personal use.

⸻

📚 StudyPlanner

Plan your studies. Focus your time. Track your progress.