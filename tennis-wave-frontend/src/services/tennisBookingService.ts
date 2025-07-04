import axiosInstance from './axiosInstance';
import { 
  TennisBooking, 
  CreateBookingDto, 
  UpdateBookingDto, 
  CreateBookingRequestDto, 
  RespondToRequestDto,
  BookingRequest,
  BookingType,
  BookingStatus
} from '@/types/tennisBooking';

export const tennisBookingService = {
  // Get all bookings
  async getBookings(): Promise<TennisBooking[]> {
    const response = await axiosInstance.get('/api/tennisbooking');
    return response.data.data;
  },

  // Get booking by ID
  async getBookingById(id: number): Promise<TennisBooking> {
    const response = await axiosInstance.get(`/api/tennisbooking/${id}`);
    return response.data.data;
  },

  // Get my bookings
  async getMyBookings(): Promise<TennisBooking[]> {
    const response = await axiosInstance.get('/api/tennisbooking/my-bookings');
    return response.data.data;
  },

  // Get available bookings
  async getAvailableBookings(): Promise<TennisBooking[]> {
    const response = await axiosInstance.get('/api/tennisbooking/available');
    return response.data.data;
  },

  // Get bookings by type
  async getBookingsByType(type: BookingType): Promise<TennisBooking[]> {
    const response = await axiosInstance.get(`/api/tennisbooking/type/${type}`);
    return response.data.data;
  },

  // Get bookings by status
  async getBookingsByStatus(status: BookingStatus): Promise<TennisBooking[]> {
    const response = await axiosInstance.get(`/api/tennisbooking/status/${status}`);
    return response.data.data;
  },

  // Get bookings by location
  async getBookingsByLocation(location: string): Promise<TennisBooking[]> {
    const response = await axiosInstance.get(`/api/tennisbooking/location/${encodeURIComponent(location)}`);
    return response.data.data;
  },

  // Create booking
  async createBooking(dto: CreateBookingDto): Promise<TennisBooking> {
    const response = await axiosInstance.post('/api/tennisbooking', dto);
    return response.data.data;
  },

  // Update booking
  async updateBooking(id: number, dto: UpdateBookingDto): Promise<TennisBooking> {
    const response = await axiosInstance.put(`/api/tennisbooking/${id}`, dto);
    return response.data.data;
  },

  // Delete booking
  async deleteBooking(id: number): Promise<void> {
    await axiosInstance.delete(`/api/tennisbooking/${id}`);
  },

  // Join booking
  async joinBooking(id: number): Promise<void> {
    await axiosInstance.post(`/api/tennisbooking/${id}/join`);
  },

  // Leave booking
  async leaveBooking(id: number): Promise<void> {
    await axiosInstance.post(`/api/tennisbooking/${id}/leave`);
  },

  // Request to join booking
  async requestToJoin(id: number, dto: CreateBookingRequestDto): Promise<void> {
    await axiosInstance.post(`/api/tennisbooking/${id}/request`, dto);
  },

  // Respond to request
  async respondToRequest(requestId: number, dto: RespondToRequestDto): Promise<void> {
    await axiosInstance.post(`/api/tennisbooking/requests/${requestId}/respond`, dto);
  },

  // Get booking requests
  async getBookingRequests(bookingId: number): Promise<BookingRequest[]> {
    const response = await axiosInstance.get(`/api/tennisbooking/${bookingId}/requests`);
    return response.data.data;
  },

  // Get my requests
  async getMyRequests(): Promise<BookingRequest[]> {
    const response = await axiosInstance.get('/api/tennisbooking/my-requests');
    return response.data.data;
  },

  // Get recommended bookings
  async getRecommendedBookings(): Promise<TennisBooking[]> {
    const response = await axiosInstance.get('/api/tennisbooking/recommended');
    return response.data.data;
  }
}; 