## Requirements

- Nginx / Apache or other web server
- Node.js 6+
- mongodb

## Setup

- Setup the updated backend which can be found in the tco-megahack-backend folder included in the submission. The `README.md` file in this folder contains the necessary setup instructions.
- Setup the frontend files to be accessible from a web server. We will assume tco-megahack to be the host name as an example. So the root path to access the application will be http://tco-megahack

## Configuration

You can set some configuration values to suit your environment by editing api/controllers.js

- `apiBase` represents the base URL where the backend is set up.
- `defaultDateFormat` represents the date format that will be used to displayed dates in the frontend
- `pageLimit` represents the number of results to return for search results

To setup the annotation store url, edit the file js/script.js

- `baseUrl` represents the base URL where the store backend is located

## Verification

- Start the backend using `npm start`.
- Make sure your web server is up and running
- You should be able to search EPA rules after accessing frontend at http://tco-megahack
