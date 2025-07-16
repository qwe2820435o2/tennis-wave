"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar,
  Users, 
  Target, 
  X,
  SlidersHorizontal,
  MapPin,
  Clock
} from "lucide-react";
import { 
  SearchBookingDto, 
  BookingType, 
  BookingStatus, 
  SkillLevel,
  getBookingTypeLabel,
  getBookingStatusLabel,
  getSkillLevelLabel
} from "@/types/tennisBooking";

interface AdvancedSearchFilterProps {
  onSearch: (searchDto: SearchBookingDto) => void;
  onReset: () => void;
  statistics?: {
    typeCounts: Record<string, number>;
    statusCounts: Record<string, number>;
    skillLevelCounts: Record<string, number>;
    availableLocations: string[];
  };
}

export default function AdvancedSearchFilter({ onSearch, onReset, statistics }: AdvancedSearchFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchDto, setSearchDto] = useState<SearchBookingDto>({
    page: 1,
    pageSize: 20
  });

  const handleInputChange = (field: keyof SearchBookingDto, value: any) => {
    setSearchDto(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    onSearch(searchDto);
  };

  const handleReset = () => {
    setSearchDto({ page: 1, pageSize: 20 });
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchDto.keyword) count++;
    if (searchDto.location) count++;
    if (searchDto.type !== undefined) count++;
    if (searchDto.status !== undefined) count++;
    if (searchDto.minSkillLevel !== undefined) count++;
    if (searchDto.maxSkillLevel !== undefined) count++;
    if (searchDto.startDate) count++;
    if (searchDto.endDate) count++;
    if (searchDto.hasAvailableSlots) count++;
    if (searchDto.isFlexible !== undefined) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Main search area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by title or description"
              value={searchDto.keyword || ""}
              onChange={(e) => handleInputChange("keyword", e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Enter location..."
              value={searchDto.location || ""}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400"
            />
          </div>
          <Button 
            onClick={handleSearch}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-8"
          >
            Search
          </Button>
        </div>

        {/* Quick filter tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {statistics?.typeCounts && Object.entries(statistics.typeCounts).map(([type, count]) => (
            <Button
              key={type}
              variant={searchDto.type === parseInt(type) ? "default" : "outline"}
              size="sm"
              onClick={() => handleInputChange("type", searchDto.type === parseInt(type) ? undefined : parseInt(type))}
              className={searchDto.type === parseInt(type) 
                ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white" 
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }
            >
              {getBookingTypeLabel(parseInt(type) as BookingType)}
              <Badge variant="secondary" className="ml-2 bg-white/20 dark:bg-black/20 text-white dark:text-gray-300">
                {count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {isExpanded ? "Hide Advanced Filters" : "Show Advanced Filters"}
            </Button>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                {activeFiltersCount} active filters
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReset}
              className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filter area */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Time range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Time Range
              </Label>
              <div className="space-y-2">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={searchDto.startDate || ""}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
                <Input
                  type="date"
                  placeholder="End date"
                  value={searchDto.endDate || ""}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Type and status */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Type & Status
              </Label>
              <div className="space-y-2">
                <Select 
                  value={searchDto.type !== undefined ? searchDto.type.toString() : ""} 
                  onValueChange={(value) => handleInputChange("type", value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(BookingType).filter(v => !isNaN(Number(v))).map(type => (
                      <SelectItem key={type} value={type.toString()}>
                        {getBookingTypeLabel(type as BookingType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={searchDto.status !== undefined ? searchDto.status.toString() : ""} 
                  onValueChange={(value) => handleInputChange("status", value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(BookingStatus).filter(v => !isNaN(Number(v))).map(status => (
                      <SelectItem key={status} value={status.toString()}>
                        {getBookingStatusLabel(status as BookingStatus)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skill level */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Skill Level
              </Label>
              <div className="space-y-2">
                <Select 
                  value={searchDto.minSkillLevel !== undefined ? searchDto.minSkillLevel.toString() : ""} 
                  onValueChange={(value) => handleInputChange("minSkillLevel", value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder="Min level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SkillLevel).filter(v => !isNaN(Number(v))).map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        {getSkillLevelLabel(level as SkillLevel)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={searchDto.maxSkillLevel !== undefined ? searchDto.maxSkillLevel.toString() : ""} 
                  onValueChange={(value) => handleInputChange("maxSkillLevel", value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder="Max level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SkillLevel).filter(v => !isNaN(Number(v))).map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        {getSkillLevelLabel(level as SkillLevel)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Participants
              </Label>
              <div className="space-y-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="Min participants"
                  value={searchDto.minParticipants || ""}
                  onChange={(e) => handleInputChange("minParticipants", e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
                <Input
                  type="number"
                  min="1"
                  placeholder="Max participants"
                  value={searchDto.maxParticipants || ""}
                  onChange={(e) => handleInputChange("maxParticipants", e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Other options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Other Options
              </Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasAvailableSlots"
                    checked={searchDto.hasAvailableSlots || false}
                    onCheckedChange={(checked) => handleInputChange("hasAvailableSlots", checked)}
                  />
                  <Label htmlFor="hasAvailableSlots" className="text-sm text-gray-600 dark:text-gray-400">
                    Only show bookings with available slots
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFlexible"
                    checked={searchDto.isFlexible || false}
                    onCheckedChange={(checked) => handleInputChange("isFlexible", checked)}
                  />
                  <Label htmlFor="isFlexible" className="text-sm text-gray-600 dark:text-gray-400">
                    Only show flexible time bookings
                  </Label>
                </div>
              </div>
            </div>

            {/* Sort options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort
              </Label>
              <div className="space-y-2">
                <Select 
                  value={searchDto.sortBy || "createdat"} 
                  onValueChange={(value) => handleInputChange("sortBy", value)}
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdat">Date Created</SelectItem>
                    <SelectItem value="bookingtime">Booking Time</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="currentparticipants">Participants</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={searchDto.sortDescending ? "desc" : "asc"} 
                  onValueChange={(value) => handleInputChange("sortDescending", value === "desc")}
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 