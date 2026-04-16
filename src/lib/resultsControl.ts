import { database } from '../firebase';
import { ref, get, set, update } from 'firebase/database';
import { ResultsControl } from '../types';

/**
 * Check if results are published for a specific grade
 */
export const checkResultsPublished = async (grade: string): Promise<boolean> => {
    try {
        const resultsRef = ref(database, `resultsControl/${grade}`);
        const snapshot = await get(resultsRef);

        if (snapshot.exists()) {
            const data: ResultsControl = snapshot.val();
            return data.isPublished || false;
        }

        return false; // Default to not published
    } catch (error) {
        console.error('Error checking results publication status:', error);
        return false;
    }
};

/**
 * Toggle results publication for a specific grade
 */
export const toggleResultsPublication = async (grade: string, publish: boolean): Promise<void> => {
    try {
        const resultsRef = ref(database, `resultsControl/${grade}`);
        const data: ResultsControl = {
            isPublished: publish,
            publishedAt: publish ? Date.now() : undefined
        };

        await set(resultsRef, data);
    } catch (error) {
        console.error('Error toggling results publication:', error);
        throw error;
    }
};

/**
 * Get publication status for all grades
 */
export const getAllResultsPublicationStatus = async (): Promise<Record<string, ResultsControl>> => {
    try {
        const resultsRef = ref(database, 'resultsControl');
        const snapshot = await get(resultsRef);

        if (snapshot.exists()) {
            return snapshot.val();
        }

        return {};
    } catch (error) {
        console.error('Error fetching results publication status:', error);
        return {};
    }
};