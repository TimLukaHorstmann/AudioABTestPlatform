'use server';
/**
 * @fileOverview Service for saving and retrieving ratings.
 *
 * - saveUserInfo - Saves user information to the local database.
 * - saveRating - Saves audio rating to the local database.
 * - getAllRatings - Retrieves all ratings from the local database.
 * - exportToCsv - Exports all ratings to a CSV file.
 */

import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'audio_ratings_db.json');

interface Rating {
  userId: string;
  userInfo?: {
    name: string;
    email: string;
  };
  audioA: string;
  audioB: string;
  rating: {
    audioA: string;
    audioB: string;
    ratingA: number;
    ratingB: number;
  };
}

interface DB {
  users: Record<string, {
    name: string;
    email: string;
  }>;
  ratings: Rating[];
}

// Initialize database with proper structure
async function initializeDatabase(): Promise<DB> {
  try {
    // Check if file exists
    try {
      await fs.access(DB_FILE);
    } catch (error) {
      // File doesn't exist, create it with empty structure
      const emptyDB: DB = { users: {}, ratings: [] };
      await fs.writeFile(DB_FILE, JSON.stringify(emptyDB, null, 2));
      return emptyDB;
    }

    // File exists, try to read it
    const data = await fs.readFile(DB_FILE, 'utf-8');
    
    // Handle empty file case
    if (!data || data.trim() === '') {
      const emptyDB: DB = { users: {}, ratings: [] };
      await fs.writeFile(DB_FILE, JSON.stringify(emptyDB, null, 2));
      return emptyDB;
    }
    
    // Try to parse the JSON
    try {
      const db = JSON.parse(data) as DB;
      
      // Validate the structure
      if (!db.users) db.users = {};
      if (!db.ratings) db.ratings = [];
      
      return db;
    } catch (parseError) {
      // JSON is corrupted, create a new one
      console.error('Database file is corrupted, creating a new one');
      const emptyDB: DB = { users: {}, ratings: [] };
      await fs.writeFile(DB_FILE, JSON.stringify(emptyDB, null, 2));
      return emptyDB;
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error(`Failed to initialize database: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function saveUserInfo(userId: string, userInfo: { name: string, email: string }) {
  try {
    const db = await initializeDatabase();
    db.users[userId] = { name: userInfo.name, email: userInfo.email };
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving user info:', error);
    throw new Error(`Failed to save user info: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function saveRating(
  userId: string, 
  audioA: string, 
  audioB: string, 
  rating: { ratingA: number; ratingB: number }
) {
  try {
    const db = await initializeDatabase();
    
    // Get user info if available
    const userInfo = db.users[userId] || undefined;
    
    const ratingEntry: Rating = {
      userId,
      userInfo,
      audioA,
      audioB,
      rating: {
        audioA,
        audioB,
        ratingA: rating.ratingA,
        ratingB: rating.ratingB
      }
    };
    
    db.ratings.push(ratingEntry);
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving rating:', error);
    throw new Error(`Failed to save rating: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getAllRatings() {
  try {
    const db = await initializeDatabase();
    return db.ratings;
  } catch (error) {
    console.error('Error getting all ratings:', error);
    throw new Error(`Failed to get all ratings: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function exportToCsv() {
  try {
    const db = await initializeDatabase();
    
    if (db.ratings.length === 0) {
      return null;
    }
    
    const headers = [
      'User ID', 
      'User Name', 
      'User Email', 
      'Audio A', 
      'Audio B', 
      'Rating A', 
      'Rating B'
    ].join(',');
    
    const rows = db.ratings.map(rating => {
      const userName = rating.userInfo?.name || '';
      const userEmail = rating.userInfo?.email || '';
      
      return [
        rating.userId,
        userName,
        userEmail,
        rating.audioA,
        rating.audioB,
        rating.rating.ratingA,
        rating.rating.ratingB
      ].join(',');
    });
    
    return [headers, ...rows].join('\n');
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return null;
  }
}

