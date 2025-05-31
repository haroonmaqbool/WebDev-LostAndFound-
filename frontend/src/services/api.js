import axios from 'axios';
import { createApiUrl, API_ENDPOINTS } from '../config/api';

const api = {
  // Get all items (lost or found)
  async getItems(type) {
    try {
      const response = await axios.get(createApiUrl(API_ENDPOINTS.items), {
        params: { type }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  // Get a single item by ID
  async getItem(id) {
    try {
      const response = await axios.get(createApiUrl(API_ENDPOINTS.item(id)));
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  },

  // Create a new item
  async createItem(itemData) {
    try {
      const response = await axios.post(createApiUrl(API_ENDPOINTS.items), itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  // Update an existing item
  async updateItem(id, itemData) {
    try {
      const response = await axios.put(createApiUrl(API_ENDPOINTS.item(id)), itemData);
      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },
};

export default api; 