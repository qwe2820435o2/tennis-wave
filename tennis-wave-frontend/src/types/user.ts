export interface UserSearchDto {
    userId: number;
    userName: string;
    avatar?: string;
    isOnline: boolean;
}

export type User = UserSearchDto;