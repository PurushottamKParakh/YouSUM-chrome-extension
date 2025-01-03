# YouSUM Chrome Extension

## YouSUM chrome extension set-up
Extension can be loaded in Chrome by:

- git clone https://github.com/PurushottamKParakh/YouSUM-chrome-extension.git
- open chrome browser
- Opening chrome://extensions/
- Enabling "Developer mode"
- Clicking "Load unpacked" and selecting the dist directory

The plugin would be installed, please pin the extension for quick access.

if you want to build from source code:

```bash
npm install
npm run build
```

## High-Level Overview
The frontend is implemented as a Chrome extension to summarize YouTube videos directly on the video page. It uses modern web technologies for performance, scalability, and maintainability.

### Core Features
1. **React with TypeScript**:
   - Provides a clean, type-safe, and maintainable structure.
   - Ensures scalability with reusable components.

2. **Chrome APIs**:
   - Accesses the active tab's URL to detect YouTube videos.
   - Utilizes `chrome.storage` for persisting user settings.

3. **Backend Integration**:
   - Interacts with the backend via RESTful APIs for summarization and transcript retrieval.

4. **Webpack Build System**:
   - Optimizes the code for production.
   - Bundles and outputs JavaScript files for Chrome extension requirements.

---

## Component Breakdown

### 1. **Popup Component** (`Popup.tsx`)
- **Responsibilities**:
  - Displays the current video URL.
  - Shows buttons to fetch summaries or transcripts.
  - Allows users to view results directly in the extension.
  - Provides a settings interface for configuring summary preferences.

- **States and Props**:
  - `videoUrl`: Stores the current YouTube video URL.
  - `summary` and `transcript`: Stores the retrieved data.
  - `settings`: Configures user preferences like summary length, focus areas, and language.

- **User Workflow**:
  - Extracts the YouTube URL on extension load.
  - Polls the backend for task completion.
  - Displays content dynamically based on user actions.

---

### 2. **App Component** (`App.tsx`)
- **Responsibilities**:
  - Handles API interactions to fetch summaries and transcripts.
  - Manages the loading state during API calls.

- **Key Features**:
  - Detects the current YouTube video URL using Chrome APIs.
  - Uses asynchronous fetch requests to interact with the backend.

---

### 3. **Styles** (`Popup.css`)
- **Overview**:
  - Custom styles for the popup interface.
  - Includes responsive design elements for an intuitive user experience.

- **Key Styles**:
  - `.popup`: Overall layout for the extension popup.
  - `.content-section`: Manages the display of summary or transcript data.
  - `.settings-modal`: Provides a modal for user preferences.

---

### 4. **Build System**
#### **Webpack Configuration** (`webpack.config.js`)
- **Entry Points**:
  - `popup`: Main entry point for the popup React component.
  - `content`: Handles content scripts for direct video page interactions (if needed).

- **Plugins**:
  - `HtmlWebpackPlugin`: Generates the popup HTML.
  - `CopyPlugin`: Copies `manifest.json` and assets (e.g., icons) to the build output.

#### **TypeScript Configuration** (`tsconfig.json`)
- **Compiler Options**:
  - `target: ES6`: Ensures modern JavaScript support.
  - `jsx: react`: Enables JSX syntax for React components.
  - `outDir: ./dist`: Specifies the build output directory.

---

## System Workflow

### 1. **User Interaction Workflow**
- **Initial Load**:
  - The extension detects if the user is on a YouTube video page.
  - Extracts the video URL from the active tab.

- **Fetching Summaries**:
  - Sends the video URL and user settings to the backend API.
  - Polls the backend for task completion.
  - Displays the summary in the popup once available.

- **Fetching Transcripts**:
  - Sends the video URL to the backend API for transcript retrieval.
  - Displays the transcript dynamically.

---

### 2. **Development Workflow**
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm start
   ```
   - Starts a local Webpack development server for real-time updates.

3. **Build for Production**:
   ```bash
   npm run build
   ```
   - Outputs optimized files in the `dist/` directory.

---

## Scalability Considerations
1. **Frontend Performance**:
   - Use memoization to optimize React component rendering.
   - Minimize API calls with caching mechanisms.

2. **Multi-Platform Support**:
   - Extend the extension to support other browsers (e.g., Firefox, Edge).

3. **Future Features**:
   - Add multilingual support for non-English summaries.
   - Include download options for summaries and transcripts.

---

## Error Handling and User Experience
1. **Error States**:
   - Inform users of failures during API interactions (e.g., backend unavailable).

2. **Fallbacks**:
   - Provide clear instructions if the extension is loaded on non-YouTube pages.

---

## Monitoring and Debugging
1. **Check Extension Logs**:
   ```bash
   chrome://extensions
   ```
   - Enable developer mode and view console logs.

2. **Monitor API Interactions**:
   - Use browser dev tools to inspect network requests.

3. **Debug Popup**:
   - Open the popup in a new tab for easier debugging:
     ```
     chrome-extension://<extension-id>/popup.html
     

