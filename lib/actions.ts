'use server'

import { generateExerciseRecommendations as generateRecommendations } from './recommendations';

export async function generateExerciseRecommendations(diagnosis: string) {
  return generateRecommendations(diagnosis);
}