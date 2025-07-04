import { User } from "@/types/user";

// Tennis booking types
export interface TennisBooking {
  id: number;
  title: string;
  description: string;
  bookingTime: string;
  location: string;
  latitude?: number;
  longitude?: number;
  type: BookingType;
  status: BookingStatus;
  minSkillLevel: SkillLevel;
  maxSkillLevel: SkillLevel;
  maxParticipants: number;
  currentParticipants: number;
  isFlexible: boolean;
  preferredTimeSlots?: string;
  contactInfo?: string;
  additionalNotes?: string;
  creatorId: number;
  createdAt: string;
  updatedAt?: string;
  creator: User;
  participants: BookingParticipant[];
  requests: BookingRequest[];
}

export interface CreateBookingDto {
  title: string;
  description: string;
  bookingTime: string;
  location: string;
  latitude?: number;
  longitude?: number;
  type: BookingType;
  minSkillLevel: SkillLevel;
  maxSkillLevel: SkillLevel;
  maxParticipants: number;
  isFlexible: boolean;
  preferredTimeSlots?: string;
  contactInfo?: string;
  additionalNotes?: string;
}

export interface UpdateBookingDto {
  title?: string;
  description?: string;
  bookingTime?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  type?: BookingType;
  minSkillLevel?: SkillLevel;
  maxSkillLevel?: SkillLevel;
  maxParticipants?: number;
  isFlexible?: boolean;
  preferredTimeSlots?: string;
  contactInfo?: string;
  additionalNotes?: string;
}

export interface BookingParticipant {
  id: number;
  bookingId: number;
  userId: number;
  status: ParticipantStatus;
  joinedAt: string;
  confirmedAt?: string;
  user: User;
}

export interface BookingRequest {
  id: number;
  bookingId: number;
  requesterId: number;
  message: string;
  status: RequestStatus;
  requestedAt: string;
  respondedAt?: string;
  responseMessage?: string;
  requester: User;
}

export interface CreateBookingRequestDto {
  bookingId: number;
  message: string;
}

export interface RespondToRequestDto {
  status: RequestStatus;
  responseMessage?: string;
}

// Enums
export enum BookingType {
  Casual = 1,
  Training = 2,
  Competition = 3,
  Doubles = 4,
  Singles = 5,
  Mixed = 6
}

export enum BookingStatus {
  Pending = 1,
  Confirmed = 2,
  InProgress = 3,
  Completed = 4,
  Cancelled = 5,
  Expired = 6
}

export enum ParticipantStatus {
  Pending = 1,
  Confirmed = 2,
  Declined = 3,
  Cancelled = 4
}

export enum RequestStatus {
  Pending = 1,
  Accepted = 2,
  Rejected = 3,
  Cancelled = 4
}

export enum SkillLevel {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
  Professional = 4
}

// Helper functions
export const getBookingTypeLabel = (type: BookingType): string => {
  switch (type) {
    case BookingType.Casual: return "Casual Booking";
    case BookingType.Training: return "Training";
    case BookingType.Competition: return "Competition";
    case BookingType.Doubles: return "Doubles";
    case BookingType.Singles: return "Singles";
    case BookingType.Mixed: return "Mixed";
    default: return "Unknown";
  }
};

export const getBookingStatusLabel = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.Pending: return "Pending";
    case BookingStatus.Confirmed: return "Confirmed";
    case BookingStatus.InProgress: return "In Progress";
    case BookingStatus.Completed: return "Completed";
    case BookingStatus.Cancelled: return "Cancelled";
    case BookingStatus.Expired: return "Expired";
    default: return "Unknown";
  }
};

export const getSkillLevelLabel = (level: SkillLevel): string => {
  switch (level) {
    case SkillLevel.Beginner: return "Beginner";
    case SkillLevel.Intermediate: return "Intermediate";
    case SkillLevel.Advanced: return "Advanced";
    case SkillLevel.Professional: return "Professional";
    default: return "Unknown";
  }
};

export const getBookingStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.Pending: return "bg-yellow-100 text-yellow-800";
    case BookingStatus.Confirmed: return "bg-green-100 text-green-800";
    case BookingStatus.InProgress: return "bg-blue-100 text-blue-800";
    case BookingStatus.Completed: return "bg-gray-100 text-gray-800";
    case BookingStatus.Cancelled: return "bg-red-100 text-red-800";
    case BookingStatus.Expired: return "bg-gray-100 text-gray-600";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const getSkillLevelColor = (level: SkillLevel): string => {
  switch (level) {
    case SkillLevel.Beginner: return "bg-green-100 text-green-800";
    case SkillLevel.Intermediate: return "bg-yellow-100 text-yellow-800";
    case SkillLevel.Advanced: return "bg-orange-100 text-orange-800";
    case SkillLevel.Professional: return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}; 