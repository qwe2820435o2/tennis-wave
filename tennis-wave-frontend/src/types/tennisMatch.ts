// src/types/tennisMatch.ts
export interface TennisMatch {
    id: number;
    title: string;
    description: string;
    location: string;
    matchTime: string;
    latitude?: number;
    longitude?: number;
    matchType: string;
    skillLevel: string;
    maxParticipants: number;
    currentParticipants: number;
    status: string;
    createdAt: string;
    creatorId: number;
    creatorName: string;
    creatorAvatar: string;
}

export interface MatchParticipant {
    participantId: number;
    matchId: number;
    userId: number;
    userName: string;
    joinDate: string;
    status: 'Pending' | 'Confirmed' | 'Rejected';
}

export interface CreateMatchDto {
    title: string;
    description: string;
    location: string;
    matchTime: string;
    latitude?: number;
    longitude?: number;
    matchType: string;
    skillLevel: string;
    maxParticipants: number;
}

export interface JoinMatchDto {
    matchId: number;
}

export interface MatchParticipant {
    participantId: number;
    matchId: number;
    userId: number;
    userName: string;
    joinDate: string;
    status: 'Pending' | 'Confirmed' | 'Rejected';
}