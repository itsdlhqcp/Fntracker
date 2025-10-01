# InSight Client

## Google OAuth Setu
To enable Google Sign-In functionality, you need to configure the Google Client ID in the environment variables.
## Running the Application
The application is configure to run on port 3000. To start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Setup Instructions

1. Create a Google OAuth 2.0 Client ID:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback` (for local development)
   - Copy the generated Client ID

2. Configure the environment variable:
   - Open the `.env` file in the project root
   - Replace `your-google-client-id-here` with your actual Google Client ID:
     ```
     VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
     ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The application will be available at http://localhost:3000

### Troubleshooting

If the Google Sign-In is not working:
1. Check that the Client ID is correctly set in the `.env` file
2. Verify that the redirect URI in Google Cloud Console matches your application's callback URL
3. Check the browser console for any error messages
4. Ensure that the Google+ API is enabled in the Google Cloud Console

### How It Works

1. When a user clicks "Sign in with Google", the application redirects to Google's OAuth endpoint
2. After successful authentication, Google redirects back to the application with an authorization code
3. The application exchanges the authorization code for tokens (idToken, refreshToken) via the backend API at `http://api.finshots.news/v1/portfolio-mgr/api/auth/token`
4. The API requires the following headers:
   - `api-interaction-id`: A unique ID for each API interaction
   - `x-session-id`: A session identifier
   - `lang`: Language code (e.g., 'en')
   - `Authorization`: Bearer token (automatically added for subsequent requests)
5. The API responds with a specific format:
   ```json
   {
     "data": {
       "idToken": "string",
       "refreshToken": "string",
       "expirySec": 0
     },
     "status": "100 CONTINUE",
     "pagination": {
       "pageNumber": 0,
       "pageSize": 0,
       "totalElements": 0,
       "totalPages": 0
     }
   }
   ```
6. The idToken is stored in localStorage and automatically added to the Authorization header for all API requests
7. User information is fetched using the idToken
8. The user is logged in and redirected to the dashboard

### Important Notes

- The headers (`api-interaction-id`, `x-session-id`) are currently hardcoded for demonstration purposes. In a production environment, these should be properly generated.
- The API base URL is configured in the `.env` file as `VITE_API_URL=http://api.finshots.news/v1/portfolio-mgr`
- The `withCredentials: true` setting has been removed from the axios configuration to avoid CORS issues with the API. If your API requires cookies/sessions, you may need to configure the server to properly handle CORS with credentials.
