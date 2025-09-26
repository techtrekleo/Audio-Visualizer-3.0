# Audio Visualizer Pro

This project is a real-time audio visualizer built with React, TypeScript, and Tailwind CSS. You can upload an audio file, choose from various visualization styles, customize the appearance, and record the output as a video file. This version uses the Gemini API for AI-powered subtitle generation.

## Features

-   **Multiple Visualization Styles**: Choose from styles like 'Monstercat', 'Luminous Wave', 'Fusion', and more.
-   **AI Subtitle Generation**: Automatically generate time-synced subtitles in [00:00.00] format from your audio using the Gemini API.
-   **Real-time Customization**: Adjust sensitivity, balance, smoothing, text, fonts, and colors on the fly.
-   **Video Recording**: Record the canvas animation combined with the audio into a downloadable MP4/WebM file.
-   **Background Slideshow**: Upload multiple background images with automatic rotation and TV static transitions.
-   **Simplified Subtitle Controls**: Streamlined subtitle background options (No Background, Transparent, Black Background).

## Setup and Running

Follow these steps to set up the project on your own computer for development, deployment, or use as a Chrome extension.

### Prerequisites

-   **[Node.js](https://nodejs.org/)**: LTS (Long-Term Support) version is recommended. `npm` is included.
-   **[Git](https://git-scm.com/)**: For cloning the repository.
-   **Gemini API Key**: You need an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Step-by-Step Guide

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/techtrekleo/audio-visualizer.git
    cd audio-visualizer-pro
    ```

2.  **Install dependencies:**
    This command downloads all necessary libraries.
    ```bash
    npm install
    ```

3.  **Create an Environment File:**
    Create a new file named `.env` in the root of the project folder. Add your Gemini API key to this file. **The name must be `VITE_API_KEY`**.
    ```
    VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key. This file is ignored by Git and keeps your key private.

4.  **Run for Local Development:**
    This will start a local server. Open the URL shown in your terminal (usually `http://localhost:5173`).
    ```bash
    npm run dev
    ```

## How to Load as a Chrome Extension

1.  **Build the Project:**
    First, you must build the project. This command creates a production-ready `dist` folder with your API key securely embedded.
    ```bash
    npm run build
    ```

2.  **Open Chrome Extensions Page:**
    Navigate to `chrome://extensions` in your Chrome browser.

3.  **Enable Developer Mode:**
    In the top-right corner, toggle the "Developer mode" switch on
    
    .

4.  **Load the Extension:**
    Click the **"Load unpacked"** button.

5.  **Select the `dist` Folder:**
    A file selection dialog will open. Navigate to your project folder and select the **`dist`** folder that was created in step 1. **Do not select the whole project folder.**

6.  **Done!**
    The extension will now appear in your list. Click its icon in the Chrome toolbar to use it.

---

**Last Updated**: September 9, 2025 - Simplified subtitle controls and enhanced background slideshow features