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

# ABTest

A modern web application for conducting A/B tests on audio files. This tool allows users to compare pairs of audio samples (raw vs. improved versions) and provide ratings that are stored locally for analysis.

## Features

- Password-protected access to keep your audio files secure
- Random ordering of A/B samples to prevent bias
- Persistent storage of user ratings in a local JSON database
- Admin interface for exporting results as CSV
- Responsive design for desktop and mobile use

## Installation

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ABTest.git
   cd ABTest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables by creating a `.env.local` file in the project root:
   ```
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

The application will be available at http://localhost:9002

## Adding Audio Files

### Audio File Structure

1. Create a folder structure inside `public/audio/`:
   ```
   public/audio/
   ├── FEMALE_VOICES-alice_segment1/
   │   ├── improved.wav
   │   └── raw.wav
   ├── MALE_VOICES-bob_segment1/
   │   ├── improved.wav
   │   └── raw.wav
   ├── FEMALE_VOICES-sarah_segment2/
   │   ├── improved.wav
   │   └── raw.wav
   ```

2. **Folder Naming Convention**: `[TYPE]-[voicename]_segment[number]`
   - Examples: `FEMALE_VOICES-alice_segment1`, `MALE_VOICES-john_segment2`

3. **Required Files**: Each folder must contain exactly two files:
   - `improved.wav` - Enhanced/processed audio version
   - `raw.wav` - Original/unprocessed audio version

4. **File Format**: Audio files must be in WAV format

5. **For Hugging Face Spaces**: Make sure to commit these audio files to your repository so they're available when deployed to Hugging Face Spaces.

### Testing Locally

Once you've added audio files to `public/audio/`, restart your development server and the app should automatically detect and load them for the AB test.

