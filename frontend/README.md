<<<<<<< HEAD
# Frontend Starter Guide
Personalized Wealth Management & Goal Tracker

This guide is written for beginners.
If you have never used React before, do not worry.
Follow step-by-step.

------------------------------------------------------------
1. What Is The Frontend?
------------------------------------------------------------

The frontend is the part of the application users see in the browser.

It is responsible for:
- Showing pages (Login, Dashboard, Goals, Portfolio)
- Taking user input (forms)
- Sending data to backend APIs
- Displaying responses from backend

Think of it as:

User clicks button
-> Frontend sends request to backend
-> Backend sends data
-> Frontend shows result

We are building this using:
- React.js
- Tailwind CSS
- Axios (for API calls)
- React Router (for page navigation)

------------------------------------------------------------
2. Install Required Software
------------------------------------------------------------

Before starting, install:

1. Node.js (IMPORTANT)
Download from:
https://nodejs.org

After installing, verify:

node -v
npm -v

If versions appear, installation is successful.

------------------------------------------------------------
3. Project Setup
------------------------------------------------------------

Go inside frontend folder:

cd frontend

If project already exists, install dependencies:

npm install

If project does NOT exist yet, create it:

npx create-react-app .
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

------------------------------------------------------------
4. Start The Frontend
------------------------------------------------------------

Run:

npm start

Open browser:

http://localhost:3000

If you see a React page, setup is correct.

------------------------------------------------------------
5. Clean Project Structure (Recommended)
------------------------------------------------------------

Inside src/ folder, organize like this:

src/
    components/
    pages/
    services/
    hooks/
    layouts/
    utils/
    App.js
    index.js

Explanation:

components/  -> Reusable UI pieces (Navbar, Card, Button)
pages/       -> Full pages (Login, Dashboard, Goals)
services/    -> API calls
hooks/       -> Custom React hooks
layouts/     -> Layout wrappers
utils/       -> Helper functions

------------------------------------------------------------
6. Install Tailwind CSS Properly
------------------------------------------------------------

If not configured yet:

1. Open tailwind.config.js
Make sure content includes:

content: [
  "./src/**/*.{js,jsx,ts,tsx}",
],

2. In src/index.css, replace everything with:

@tailwind base;
@tailwind components;
@tailwind utilities;

3. Restart server:

npm start

Now Tailwind classes should work.

Example test:

<div className="bg-blue-500 text-white p-4">
  Tailwind is working
</div>

------------------------------------------------------------
7. Connecting Frontend To Backend
------------------------------------------------------------

Create a file:

src/services/api.js

Add:

import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export default api;

Now you can call backend like this:

api.get("/users")
api.post("/login", data)

------------------------------------------------------------
8. Setting Up Routing
------------------------------------------------------------

Open App.js and configure:

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

------------------------------------------------------------
9. Creating Your First Page
------------------------------------------------------------

Create:

src/pages/Login.js

Example:

import React from "react";

function Login() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-6 bg-white shadow rounded">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;

------------------------------------------------------------
10. Handling Forms (Very Important)
------------------------------------------------------------

In React, use useState to store input values.

Example:

import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );
}

------------------------------------------------------------
11. Calling Backend API
------------------------------------------------------------

Example login function:

import api from "../services/api";

const handleLogin = async () => {
  try {
    const response = await api.post("/login", {
      email,
      password
    });

    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

------------------------------------------------------------
12. Storing JWT Token
------------------------------------------------------------

After login:

localStorage.setItem("token", response.data.access_token);

For future requests:

api.defaults.headers.common["Authorization"] =
  "Bearer " + localStorage.getItem("token");

------------------------------------------------------------
13. Protected Routes
------------------------------------------------------------

Create a ProtectedRoute component to check if user is logged in.

If no token:
Redirect to login page.

------------------------------------------------------------
14. Common Beginner Mistakes
------------------------------------------------------------

Problem: Module not found
Fix:
npm install

Problem: Tailwind not working
Fix:
Check index.css and restart server

Problem: CORS error
Fix:
Make sure backend allows frontend URL

Problem: Port already in use
Fix:
Change port:
PORT=3001 npm start

------------------------------------------------------------
15. Development Flow (How Interns Should Work)
------------------------------------------------------------

Step 1:
Make static UI first.

Step 2:
Connect to backend API.

Step 3:
Handle loading and error states.

Step 4:
Improve UI styling.

Do not mix everything at once.

------------------------------------------------------------
16. Pages To Be Built
------------------------------------------------------------

Login Page
Register Page
Dashboard Page
Goals Page
Portfolio Page
Simulations Page
Reports Page

Build one page at a time.

------------------------------------------------------------
17. How Frontend Communicates With Backend
------------------------------------------------------------

GET request:
Used to fetch data

POST request:
Used to create data

PUT request:
Used to update data

DELETE request:
Used to remove data

------------------------------------------------------------
18. Final Advice For Beginners
------------------------------------------------------------

Do not panic if errors appear.
Errors are normal.

Google error messages.
Read console logs carefully.
Use browser Developer Tools (F12).

Learn slowly:
Understand state
Understand props
Understand API calls
Understand routing

Everything else becomes easy.

------------------------------------------------------------
End of Frontend README
------------------------------------------------------------


=======
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
