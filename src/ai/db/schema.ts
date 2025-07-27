/**
 * @fileOverview Zod schema for the local database.
 *
 * - UserInfoSchema - Schema for user information.
 * - AudioRatingSchema - Schema for audio ratings.
 * - UserInfo - Type for user information.
 * - AudioRating - Type for audio ratings.
 */
import {z} from 'zod';

export const UserInfoSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});
export type UserInfo = z.infer<typeof UserInfoSchema>;

export const AudioRatingSchema = z.object({
  audioA: z.string(),
  audioB: z.string(),
  ratingA: z.number().min(1).max(5),
  ratingB: z.number().min(1).max(5),
});
export type AudioRating = z.infer<typeof AudioRatingSchema>;
