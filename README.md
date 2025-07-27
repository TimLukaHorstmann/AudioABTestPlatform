---
title: AudioABTestPlatform
emoji: 🏢
colorFrom: gray
colorTo: red
sdk: docker
app_port: 3000
pinned: false
license: cc-by-nc-4.0
short_description: Convenient way of conducting AB test between audio files.
---

<div align="center">
  <img src="public/banner.png" alt="Banner" width=20% />
  <h1 align="center">Audio A/B Test Platform</h1>
  <p align="center">
    A modern, simple web application for conducting A/B tests on audio files.
    <br />
    <a href="https://huggingface.co/spaces/Luka512/AudioABTestPlatform">View Demo</a>
    ·
    <a href="https://github.com/TimLukaHorstmann/AudioABTestPlatform/issues">Report Bug</a>
    ·
    <a href="https://github.com/TimLukaHorstmann/AudioABTestPlatform/issues">Request Feature</a>
  </p>
</div>

---

## About The Project

This tool allows users to compare pairs of audio samples (raw vs. improved versions) and provide ratings that are stored locally for analysis. It's designed for researchers, audio engineers, and developers who need a straightforward way to gather subjective feedback on audio quality.

### Features

- **Password-Protected Access**: Secure your audio files and testing environment.
- **Randomized A/B Testing**: Prevents order bias by randomizing which audio (A or B) is the `raw` or `improved` version.
- **Persistent Local Storage**: Ratings are saved in a local JSON file for easy access and analysis.
- **Admin Interface**: View and export test results as a CSV file.
- **Responsive Design**: Fully functional on both desktop and mobile devices.
- **Easy Deployment**: Deploy to Hugging Face Spaces with a single click.

## Installation

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

### Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/TimLukaHorstmann/AudioABTestPlatform.git
    cd AudioABTestPlatform
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure environment variables**:
    Create a `.env.local` file in the project root and add the following:
    ```env
    # User credentials
    USER_PASSWORD=your_user_password
    ADMIN_PASSWORD=your_admin_password
    ADMIN_NAME=your_admin_name
    ADMIN_EMAIL=your_admin_email

    # Optional: SendGrid for email exports
    SENDGRID_API_KEY=your_sendgrid_api_key

    # Next.js settings
    NEXT_PUBLIC_HOSTING_SERVICE=local
    ```

## Running Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

## Adding Audio Files

### Audio File Structure

1.  Place your audio files in the `public/audio/` directory. Create a subfolder for each pair of audio files.

    ```
    public/audio/
    ├── VOICE_NAME_1/
    │   ├── improved.wav
    │   └── raw.wav
    ├── VOICE_NAME_2/
    │   ├── improved.wav
    │   └── raw.wav
    ```

2.  **Required Files**: Each subfolder must contain exactly two files:
    -   `improved.wav`: The enhanced or processed audio version.
    -   `raw.wav`: The original or unprocessed audio version.

3.  **File Format**: Audio files must be in `.wav` format.

4.  **For Hugging Face Spaces**: Make sure to commit these audio files to your repository so they are available when deployed.

### Testing Locally

Once you've added audio files, restart the development server. The app will automatically detect and load them for the A/B test.

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**. See the `LICENSE` file for more details.

## Contact

Project Link: [https://github.com/TimLukaHorstmann/AudioABTestPlatform](https://github.com/TimLukaHorstmann/AudioABTestPlatform)

Once you've added audio files to `public/audio/`, restart your development server and the app should automatically detect and load them for the AB test.

