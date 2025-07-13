import axiosInstance from './axiosInstance';
import { User, UserSearchDto, UserSearchParams, UserSearchResultDto } from '@/types/user';

export const userService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    const response = await axiosInstance.get('/api/user');
    return response.data.data;
  },

  // Get users with pagination
  async getUsersWithPagination(
    page: number = 1,
    pageSize: number = 20,
    sortBy?: string,
    sortDescending: boolean = false
  ): Promise<UserSearchResultDto> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortDescending: sortDescending.toString()
    });
    
    if (sortBy) {
      params.append('sortBy', sortBy);
    }

    const response = await axiosInstance.get(`/api/user/paginated?${params}`);
    return response.data.data;
  },

  // Search users with pagination
  async searchUsersWithPagination(searchParams: UserSearchParams): Promise<UserSearchResultDto> {
    const response = await axiosInstance.post('/api/user/search', searchParams);
    return response.data.data;
  },

  // Get recommended partners with pagination
  async getRecommendedPartnersWithPagination(
    page: number = 1,
    pageSize: number = 20
  ): Promise<UserSearchResultDto> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    const response = await axiosInstance.get(`/api/user/recommended-partners?${params}`);
    return response.data.data;
  },

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    const response = await axiosInstance.get(`/api/user/${id}`);
    return response.data.data;
  },

  // Create user
  async createUser(userData: any): Promise<User> {
    const response = await axiosInstance.post('/api/user', userData);
    return response.data.data;
  },

  // Update user
  async updateUser(id: number, userData: any): Promise<User> {
    const response = await axiosInstance.put(`/api/user/${id}`, userData);
    return response.data.data;
  },

  // Delete user
  async deleteUser(id: number): Promise<void> {
    await axiosInstance.delete(`/api/user/${id}`);
  },

  // Change password
  async changePassword(id: number, passwordData: any): Promise<boolean> {
    const response = await axiosInstance.post(`/api/user/${id}/change-password`, passwordData);
    return response.data.data;
  },

  // Check email uniqueness
  async checkEmailUnique(email: string, excludeUserId?: number): Promise<boolean> {
    const params = new URLSearchParams({ email });
    if (excludeUserId) {
      params.append('excludeUserId', excludeUserId.toString());
    }
    
    const response = await axiosInstance.get(`/api/user/check-email?${params}`);
    return response.data.data;
  },

  // Check username uniqueness
  async checkUsernameUnique(userName: string, excludeUserId?: number): Promise<boolean> {
    const params = new URLSearchParams({ userName });
    if (excludeUserId) {
      params.append('excludeUserId', excludeUserId.toString());
    }
    
    const response = await axiosInstance.get(`/api/user/check-username?${params}`);
    return response.data.data;
  },

  // Search users (simple search)
  async searchUsers(query: string): Promise<UserSearchDto[]> {
    const response = await axiosInstance.get(`/api/user/search-simple?query=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  // Get recommended partners (legacy method)
  async getRecommendedPartners(): Promise<User[]> {
    const response = await axiosInstance.get('/api/user/recommended-partners');
    return response.data.data;
  }
};

// Legacy export for backward compatibility
export const getRecommendedPartners = userService.getRecommendedPartners;