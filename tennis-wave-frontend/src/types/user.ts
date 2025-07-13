export interface User {
  id: number;
  userName: string;
  email: string;
  bio?: string;
  tennisLevel?: string;
  preferredLocation?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  userName: string;
  email: string;
  password: string;
  bio?: string;
  tennisLevel?: string;
  preferredLocation?: string;
  avatar?: string;
}

export interface UpdateUserDto {
  userName?: string;
  email?: string;
  bio?: string;
  tennisLevel?: string;
  preferredLocation?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserSearchDto {
  userId: number;
  userName: string;
  avatar?: string;
  isOnline: boolean;
}

// Pagination types
export interface PaginationDto {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDescending: boolean;
}

export interface UserSearchParams extends PaginationDto {
  keyword?: string;
  tennisLevel?: string;
  preferredLocation?: string;
  excludeUserId?: number;
}

export interface SearchResultDto<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserSearchResultDto extends SearchResultDto<User> {
  levelCounts: Record<string, number>;
  locationCounts: Record<string, number>;
  availableLevels: string[];
  availableLocations: string[];
}