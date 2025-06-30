// src/app/matches/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, Plus, Search } from "lucide-react";
import { tennisMatchService } from "@/services/tennisMatchService";
import { TennisMatch } from "@/types/tennisMatch";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import { toast } from "sonner";
import {AxiosError} from "axios";

export default function MatchesPage() {
    const [matches, setMatches] = useState<TennisMatch[]>([]);
    const [filteredMatches, setFilteredMatches] = useState<TennisMatch[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [skillFilter, setSkillFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const dispatch = useDispatch();

    useEffect(() => {
        loadMatches();
    }, []);

    useEffect(() => {
        filterMatches();
    }, [matches, searchTerm, skillFilter, typeFilter]);

    const loadMatches = async () => {
        try {
            dispatch(showLoading());
            const data = await tennisMatchService.getMatches();
            setMatches(data);
        } catch(error: unknown) {

            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status !== 401) {
                    toast.error("Failed to load matches");
                }
            }
        }finally {
            dispatch(hideLoading());
        }
    };

    const filterMatches = () => {
        const filtered = matches.filter(match => {
            const matchesSearch = match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSkill = skillFilter === "all" || match.skillLevel === skillFilter;
            const matchesType = typeFilter === "all" || match.matchType === typeFilter;
            return matchesSearch && matchesSkill && matchesType;
        });
        setFilteredMatches(filtered);
    };

    const getSkillLevelColor = (level: string) => {
        switch (level) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'Advanced': return 'bg-orange-100 text-orange-800';
            case 'Professional': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Find Tennis Matches</h1>
                            <p className="text-gray-600 mt-2">Discover and join tennis matches in your area</p>
                        </div>
                        <Link href="/matches/create">
                            <Button className="bg-green-600 hover:bg-green-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Match
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search matches..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={skillFilter} onValueChange={setSkillFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Skill Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                                <SelectItem value="Professional">Professional</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Match Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Singles">Singles</SelectItem>
                                <SelectItem value="Doubles">Doubles</SelectItem>
                                <SelectItem value="Mixed">Mixed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={loadMatches}>
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Matches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMatches.map((match) => (
                        <Card key={match.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{match.title}</CardTitle>
                                    <Badge className={getSkillLevelColor(match.skillLevel)}>
                                        {match.skillLevel}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {match.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {match.location}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {formatDate(match.matchTime)}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Users className="w-4 h-4 mr-2" />
                                        {match.currentParticipants}/{match.maxParticipants} participants
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <Badge variant="outline">
                                            {match.matchType}
                                        </Badge>
                                        <Link href={`/matches/${match.id}`}>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredMatches.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No matches found</p>
                        <p className="text-gray-400 mt-2">Try adjusting your filters or create a new match</p>
                    </div>
                )}
            </div>
        </div>
    );
}