import axios from 'axios';
import { createApiUrl, API_ENDPOINTS } from '../config/api';

const api = {
  // Get all items (lost or found)
  async getItems(type) {
    try {
      const response = await axios.get(createApiUrl(API_ENDPOINTS.statusChecks));
      return response.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  // Create a new item
  async createItem(itemData) {
    try {
      const response = await axios.post(createApiUrl(API_ENDPOINTS.statusChecks), itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },
};

export default api; 