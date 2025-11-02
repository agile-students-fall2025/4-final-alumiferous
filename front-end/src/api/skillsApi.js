import axios from "axios";

/**
 * Search/filter skills from the backend API
 * @param {string} searchTerm - The search query (minimum 3 characters)
 * @returns {Promise<Array>} - Array of filtered skills
 */
export const searchSkills = async (searchTerm) => {
  try {
    // TODO: Replace with your actual backend API endpoint
    const response = await axios.get(`/api/skills/search`, {
      params: { q: searchTerm }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error searching skills:", error);
    throw error;
  }
};

/**
 * Fetch all skills from the backend
 * @returns {Promise<Array>} - Array of all skills
 */
export const fetchAllSkills = async () => {
  try {
    // TODO: Replace with your actual backend API endpoint
    const response = await axios.get(`/api/skills`);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
};
