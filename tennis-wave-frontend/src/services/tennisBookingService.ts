import axiosInstance from './axiosInstance';
import { 
  TennisBooking, 
  CreateBookingDto, 
  UpdateBookingDto, 
  CreateBookingRequestDto, 
  RespondToRequestDto,
  BookingRequest,
  BookingType,
  BookingStatus,
  SearchBookingDto,
  TennisBookingSearchResultDto
} from '@/types/tennisBooking';

export const tennisBookingService = {
  // Get all bookings
  async getBookings(): Promise<TennisBooking[]> {
    const response = await axiosInstance.get('/api/tennisbooking');
    return response.data.data;
  },

  // Get bookings with pagination
  async getBookingsWithPagination(
    page: number = 1,
    pageSize: number = 20,
    sortBy?: string,
    sortDescending: boolean = false
  ): Promise<TennisBookingSearchResultDto> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortDescending: sortDescending.toString()
    });
    
    if (sortBy) {
      params.append('sortBy', sortBy);
    }

    const response = await axiosInstance.get(`/api/tennisbooking/paginated?${params}`);
    return response.data.data;
  },

  // Get available bookings with pagination
  async getAvailableBookingsWithPagination(
    page: number = 1,
    pageSize: number = 20,
    sortBy?: string,
    sortDescending: boolean = false
  ): Promise<TennisBookingSearchResultDto> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortDescending: sortDescending.toString()
    });
    
    if (sortBy) {
      params.append('sortBy', sortBy);
    }

    const response = await axiosInstance.get(`/api/tennisbooking/available?${params}`);
    return response.data.data;
  },

  // Get my bookings with pagination
  async getMyBookingsWithPagination(
    page: number = 1,
    pageSize: number = 20,
    sortBy?: string,
    sortDescending: boolean = false
  ): Promise<TennisBookingSearchResultDto> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortDescending: sortDescending.toString()
    });
    
    if (sortBy) {
      params.append('sortBy', sortBy);
    }

    const response = await axiosInstance.get(`/api/tennisbooking/my-bookings?${params}`);
    return response.data.data;
  },

  // Get recommended bookings with pagination
  async getRecommendedBookingsWithPagination(
    page: number = 1,
    pageSize: number = 20
  ): Promise<TennisBookingSearchResultDto> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    const response = await axiosInstance.get(`/api/tennisbooking/recommended?${params}`);
    return response.data.data;
  },

  // Get booking by ID
  async getBookingById(id: number): Promise<TennisBooking> {
    const response = await axiosInstance.get(`/api/tennisbooking/${id}`);
    return response.data.data;
  },

  // Get available bookings (legacy method)
  async getAvailableBookings(): Promise<TennisBooking[]> {
    const response = await axiosInstance.get('/api/tennisbooking/available');
    return response.data.data;
  },

  // Get my bookings (legacy method)
  async getMyBookings(): Promise<TennisBooking[]> {
    const response = await axiosInstance.get('/api/tennisbooking/my-bookings');
    return response.data.data;
  },

  // Get bookings by type
  async getBookingsByType(type: BookingType): Promise<TennisBooking[]> {
    const response = await axiosInstance.get(`/api/tennisbooking/by-type/${type}`);
    return response.data.data;
  },

  // Get bookings by status
  async getBookingsByStatus(status: BookingStatus): Promise<TennisBooking[]> {
    const response = await axiosInstance.get(`/api/tennisbooking/by-status/${status}`);
    return response.data.data;
  },

  // Get bookings by location
  async getBookingsByLocation(location: string): Promise<TennisBooking[]> {
    const response = await axiosInstance.get(`/api/tennisbooking/by-location?location=${encodeURIComponent(location)}`);
    return response.data.data;
  },

  // Create booking
  async createBooking(bookingData: CreateBookingDto): Promise<TennisBooking> {
    const response = await axiosInstance.post('/api/tennisbooking', bookingData);
    return response.data.data;
  },

  // Update booking
  async updateBooking(id: number, bookingData: UpdateBookingDto): Promise<TennisBooking> {
    const response = await axiosInstance.put(`/api/tennisbooking/${id}`, bookingData);
    return response.data.data;
  },

  // Delete booking
  async deleteBooking(id: number): Promise<boolean> {
    const response = await axiosInstance.delete(`/api/tennisbooking/${id}`);
    return response.data.data;
  },

  // Join booking
  async joinBooking(id: number): Promise<boolean> {
    const response = await axiosInstance.post(`/api/tennisbooking/${id}/join`);
    return response.data.data;
  },

  // Leave booking
  async leaveBooking(id: number): Promise<boolean> {
    const response = await axiosInstance.post(`/api/tennisbooking/${id}/leave`);
    return response.data.data;
  },

  // Confirm participant
  async confirmParticipant(bookingId: number, participantId: number): Promise<boolean> {
    const response = await axiosInstance.post(`/api/tennisbooking/${bookingId}/participants/${participantId}/confirm`);
    return response.data.data;
  },

  // Decline participant
  async declineParticipant(bookingId: number, participantId: number): Promise<boolean> {
    const response = await axiosInstance.post(`/api/tennisbooking/${bookingId}/participants/${participantId}/decline`);
    return response.data.data;
  },

  // Request to join booking
  async requestToJoin(id: number, requestData: CreateBookingRequestDto): Promise<boolean> {
    const response = await axiosInstance.post(`/api/tennisbooking/${id}/request`, requestData);
    return response.data.data;
  },

  // Respond to request
  async respondToRequest(requestId: number, responseData: RespondToRequestDto): Promise<boolean> {
    const response = await axiosInstance.post(`/api/tennisbooking/requests/${requestId}/respond`, responseData);
    return response.data.data;
  },

  // Get requests by booking ID
  async getRequestsByBookingId(bookingId: number): Promise<BookingRequest[]> {
    const response = await axiosInstance.get(`/api/tennisbooking/${bookingId}/requests`);
    return response.data.data;
  },

  // Get my requests
  async getMyRequests(): Promise<BookingRequest[]> {
    const response = await axiosInstance.get('/api/tennisbooking/my-requests');
    return response.data.data;
  },

  // Get recommended bookings (legacy method)
  async getRecommendedBookings(): Promise<TennisBooking[]> {
    const response = await axiosInstance.get('/api/tennisbooking/recommended');
    return response.data.data;
  },

  // Search bookings
  async searchBookings(searchDto: SearchBookingDto): Promise<TennisBookingSearchResultDto> {
    // Clean the searchDto: remove all fields with value "", null, or undefined
    const cleanedSearchDto: Record<string, any> = {};
    Object.entries(searchDto).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        cleanedSearchDto[key] = value;
      }
    });
    const response = await axiosInstance.post('/api/tennisbooking/search', cleanedSearchDto);
    return response.data.data;
  },

  // Get booking statistics
  async getBookingStatistics(): Promise<any> {
    const response = await axiosInstance.get('/api/tennisbooking/statistics');
    return response.data.data;
  }
}; 