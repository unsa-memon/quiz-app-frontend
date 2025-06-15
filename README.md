# Quiz App Frontend

A user-friendly quiz application built with React where users can take quizzes and track their progress. Includes a powerful admin panel for managing quizzes and users.

## What This App Does

### For Users
- **Create Account & Login**: Simple registration and login system
- **Take Quizzes**: Interactive quizzes with different question types (multiple choice, true/false)
- **Timer Feature**: Each quiz has a time limit to make it challenging
- **See Results**: Get detailed results after completing quizzes
- **Track Progress**: View your quiz history and performance
- **User Profile**: Manage your account information

### For Admins
- **Full Control Panel**: Manage everything from one dashboard
- **Create & Edit Quizzes**: Add new quizzes or modify existing ones
- **User Management**: View all users and delete accounts if needed
- **Delete Quizzes**: Remove quizzes that are no longer needed
- **Analytics**: See how users are performing with charts and statistics

## Built With

- **React 18** - Modern JavaScript framework
- **Vite** - Fast build tool
- **TailwindCSS** - For beautiful, responsive styling
- **Material-UI** - Professional UI components
- **React Router** - For navigation between pages
- **Redux Toolkit** - For managing app state
- **Chart.js** - For creating charts and graphs
- **Axios** - For talking to the backend server

## Getting Started

### What You Need
- Node.js installed on your computer
- A backend server running (this app expects it on port 5000)

### Installation Steps

1. **Download the code**
   ```bash
   git clone https://github.com/unsa-memon/quiz-app-frontend.git
   cd quiz-app-frontend
   ```

2. **Install required packages**
   ```bash
   npm install
   ```

3. **Start the app**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Go to `http://localhost:3000`

## Admin Panel Access

To access the admin features, use these login credentials:

**Email:** `unsa@gmail.com`  
**Password:** `unsaunsa`

**What admins can do:**
- Delete user accounts
- Remove quizzes from the system
- Edit existing quizzes (change questions, answers, time limits)
- View detailed analytics about user performance
- Create new quizzes with custom questions

## How the Code is Organized

```
src/
├── components/          # Reusable parts of the app
│   ├── Navbar.jsx      # Top navigation bar
│   ├── QuizCard.jsx    # Shows quiz information
│   ├── QuizForm.jsx    # Form for creating quizzes
│   └── ...
├── pages/              # Main screens of the app
│   ├── Dashboard.jsx   # Home page for users
│   ├── Login.jsx       # Login screen
│   ├── AdminDashboard.jsx  # Admin control panel
│   ├── QuizPage.jsx    # Where users take quizzes
│   └── ...
├── utils/              # Helper functions
│   ├── api.js          # Functions to talk to backend
│   └── adminApi.js     # Admin-specific backend calls
└── assets/             # Images and other files
```

## Available Commands

- `npm run dev` - Start the app for development
- `npm run build` - Create a production version
- `npm run preview` - Preview the production build
- `npm run lint` - Check code quality

## Key Features Explained

### User Authentication
- Users can create accounts and login securely
- Passwords are protected with JWT tokens
- Different access levels for regular users and admins

### Quiz System
- Support for multiple question types
- Automatic timer that submits quiz when time runs out
- Immediate feedback with correct answers
- Score calculation and performance tracking

### Admin Dashboard
- Clean interface for managing the entire system
- Easy-to-use forms for creating and editing quizzes
- User management with ability to view all registered users
- Analytics with visual charts showing user performance

### Responsive Design
- Works perfectly on desktop, tablet, and mobile
- Modern, clean interface that's easy to navigate
- Consistent styling throughout the app

## Configuration

If your backend server runs on a different port, update the `vite.config.js` file:

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000', // Change this to your backend URL
      changeOrigin: true,
    },
  },
}
```

## Need Help?

If you run into any issues:
1. Make sure your backend server is running
2. Check that all dependencies are installed (`npm install`)
3. Verify you're using the correct Node.js version
4. Look at the browser console for any error messages

## License

This project is open source and available under the MIT License.
