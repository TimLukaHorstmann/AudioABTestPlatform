'use server';

import axios from 'axios';
import path from 'path';

// Google Drive folder IDs
const FEMALE_VOICES_FOLDER_ID = '1AWocbgIzGOjA8nBo18WJyTPvDZueN1hH';
const MAIN_FOLDER_ID = '1AWocbgIzGOjA8nBo18WJyTPvDZueN1hH'; // Parent folder containing MALE_VOICES and FEMALE_VOICES

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

interface DriveFolder {
  id: string;
  name: string;
  files: DriveFile[];
}

/**
 * Get direct download URL for a Google Drive file
 */
function getGoogleDriveDirectLink(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Fetch files from a Google Drive folder
 */
async function fetchFilesFromFolder(folderId: string): Promise<DriveFolder | null> {
  try {
    // Use the Google Drive API to list files in the folder
    // Note: This would typically require authentication with an API key in production
    // This is a simplified example that assumes public folder access
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType)`
    );

    const files = response.data.files;
    return {
      id: folderId,
      name: folderId, // Using ID as name since we can't get folder name directly
      files: files
    };
  } catch (error) {
    console.error('Error fetching files from Google Drive:', error);
    return null;
  }
}

/**
 * Fetch all voice folders and audio files from Google Drive
 */
export async function fetchDriveAudioFiles(): Promise<[string, string, string, boolean][] | null> {
  const audioPairs: [string, string, string, boolean][] = [];

  try {
    // Fetch main folder to get MALE_VOICES and FEMALE_VOICES folders
    const mainFolder = await fetchFilesFromFolder(MAIN_FOLDER_ID);
    
    if (!mainFolder) {
      console.error('Could not fetch main folder from Google Drive');
      return null;
    }

    // Find MALE_VOICES and FEMALE_VOICES folders
    const maleFolderObj = mainFolder.files.find(file => 
      file.mimeType === 'application/vnd.google-apps.folder' && file.name === 'MALE_VOICES'
    );
    
    const femaleFolderObj = mainFolder.files.find(file => 
      file.mimeType === 'application/vnd.google-apps.folder' && file.name === 'FEMALE_VOICES'
    );

    // Process both folders
    const foldersToProcess = [];
    if (maleFolderObj) foldersToProcess.push(maleFolderObj);
    if (femaleFolderObj) foldersToProcess.push(femaleFolderObj);

    // If we couldn't find specific folders, try to process all folders in the main directory
    if (foldersToProcess.length === 0) {
      foldersToProcess.push(...mainFolder.files.filter(file => 
        file.mimeType === 'application/vnd.google-apps.folder'
      ));
    }

    // Process each voice folder
    for (const folderObj of foldersToProcess) {
      const folderContents = await fetchFilesFromFolder(folderObj.id);
      
      if (!folderContents) continue;
      
      // Look for voice folders inside MALE_VOICES and FEMALE_VOICES
      const voiceFolders = folderContents.files.filter(file => 
        file.mimeType === 'application/vnd.google-apps.folder'
      );
      
      // If no voice subfolders, check if the current folder itself contains audio files
      if (voiceFolders.length === 0) {
        await processVoiceFolder(folderObj, folderContents.files, audioPairs);
      } else {
        // Process each voice subfolder
        for (const voiceFolder of voiceFolders) {
          const voiceFiles = await fetchFilesFromFolder(voiceFolder.id);
          if (!voiceFiles) continue;
          
          await processVoiceFolder(voiceFolder, voiceFiles.files, audioPairs);
        }
      }
    }

    return audioPairs.length > 0 ? audioPairs : null;
  } catch (error) {
    console.error('Error fetching audio files from Google Drive:', error);
    return null;
  }
}

// Helper function to process a voice folder
async function processVoiceFolder(
  folder: DriveFile, 
  files: DriveFile[], 
  audioPairs: [string, string, string, boolean][]
) {
  // Look for improved.wav and raw.wav in the folder
  const improvedFile = files.find(file => file.name === 'improved.wav');
  const rawFile = files.find(file => file.name === 'raw.wav');
  
  if (improvedFile && rawFile) {
    // Extract voice name from folder name
    const voiceName = folder.name;
    
    // Randomly determine order presentation (but track original files)
    const shouldSwap = Math.random() > 0.5;
    
    // Get direct download URLs
    const improvedUrl = getGoogleDriveDirectLink(improvedFile.id);
    const rawUrl = getGoogleDriveDirectLink(rawFile.id);
    
    // If we swap, raw becomes shown first (A), but we track this with boolean
    if (shouldSwap) {
      audioPairs.push([rawUrl, improvedUrl, voiceName, true]); // swapped = true
    } else {
      audioPairs.push([improvedUrl, rawUrl, voiceName, false]); // swapped = false
    }
  }
} 