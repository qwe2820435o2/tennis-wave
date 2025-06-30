// src/services/tennisMatchService.ts
import axiosInstance from './axiosInstance';
import { TennisMatch, CreateMatchDto, JoinMatchDto } from '@/types/tennisMatch';

export const tennisMatchService = {
    // Get all matches
    async getMatches(): Promise<TennisMatch[]> {
        const response = await axiosInstance.get('/api/TennisMatch');
        return response.data.data;
    },

    // Get match by ID
    async getMatchById(matchId: number): Promise<TennisMatch> {
        const response = await axiosInstance.get(`/api/TennisMatch/${matchId}`);
        return response.data.data;
    },

    // Create new match
    async createMatch(matchData: CreateMatchDto): Promise<TennisMatch> {
        const response = await axiosInstance.post('/api/TennisMatch', matchData);
        return response.data.data;
    },

    // Join match
    async joinMatch(joinData: JoinMatchDto): Promise<void> {
        await axiosInstance.post(`/api/TennisMatch/${joinData.matchId}/join`);
    },

    // Get user's matches
    async getUserMatches(): Promise<TennisMatch[]> {
        const response = await axiosInstance.get('/api/TennisMatch/my-matches');
        return response.data.data;
    },

    // Update match
    async updateMatch(matchId: number, matchData: Partial<CreateMatchDto>): Promise<TennisMatch> {
        const response = await axiosInstance.put(`/api/TennisMatch/${matchId}`, matchData);
        return response.data.data;
    },

    // Delete match
    async deleteMatch(matchId: number): Promise<void> {
        await axiosInstance.delete(`/api/TennisMatch/${matchId}`);
    }
};