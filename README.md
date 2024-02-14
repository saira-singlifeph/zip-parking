## Installation

```markdown
# Installation Guide


Before setup the frontend, please make sure backend setup is done and running. 

To install the parking system , follow the steps below.

## 1. Install npm

Make sure you have npm installed, which is the package manager for JavaScript. If you don't have npm installed, you can download and install it from [here](https://www.npmjs.com/).

## 2. Node.js Version

Ensure that your Node.js version is >18 and higher.

## 3. Install Dependencies

Run the following command in your terminal to install the required dependencies:

```bash
npm install
```
## 4. Setup the Backend URL

setup the backend url at the src/services/api.service.tsx, change base on the running port on your local machine
const baseURL = "http://localhost:5000/api/v1/car-parking"


## 5. Run the application

```bash
npm run dev
```


