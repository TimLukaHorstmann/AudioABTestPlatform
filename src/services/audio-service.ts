'use server';

import fs from 'fs/promises';
import path from 'path';

export async function fetchAudioFiles(): Promise<[string, string, string, boolean][] | null> {
  const audioPairs: [string, string, string, boolean][] = [];
  // Look directly in the audio folder for segment directories
  const audioBaseDir = path.join(process.cwd(), 'public', 'audio');

  try {
    // Check if directory exists
    try {
      await fs.access(audioBaseDir);
    } catch (error) {
      console.error(`Audio directory inaccessible: ${audioBaseDir}`, error);
      return null;
    }

    // Get all folders in the audio directory
    const folders = await fs.readdir(audioBaseDir, { withFileTypes: true });
    const audioDirs = folders
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Process each folder
    for (const folderName of audioDirs) {
      const folderPath = path.join(audioBaseDir, folderName);
      const files = await fs.readdir(folderPath);
      
      // Check if both required files exist
      if (files.includes('improved.wav') && files.includes('raw.wav')) {
        // Extract voice name from folder name (after hyphen, before first segment)
        const voiceName = folderName.split('-')[1]?.split('_segment')[0] || folderName;
        
        // Randomly determine order presentation (but track original files)
        const shouldSwap = Math.random() > 0.5;
        
        // Construct URLs relative to public directory with forward slashes for cross-platform compatibility
        const improvedUrl = `./audio/${folderName}/improved.wav`.replace(/\\/g, '/');
        const rawUrl = `./audio/${folderName}/raw.wav`.replace(/\\/g, '/');
        
        // If we swap, raw becomes shown first (A), but we track this with boolean
        if (shouldSwap) {
          audioPairs.push([rawUrl, improvedUrl, voiceName, true]); // swapped = true
        } else {
          audioPairs.push([improvedUrl, rawUrl, voiceName, false]); // swapped = false
        }
      }
    }

    return audioPairs.length > 0 ? audioPairs : null;
  } catch (error) {
    console.error('Error reading audio files:', error);
    return null;
  }
}