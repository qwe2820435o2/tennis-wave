"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  Calendar,
  Users, 
  Target, 
  Clock,
  X,
  SlidersHorizontal
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

  return (
    <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <CardTitle className="text-gray-900 dark:text-white">Search & Filter</CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{getActiveFiltersCount()} active</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {isExpanded ? "Hide" : "Advanced"}
            </Button>
            {getActiveFiltersCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Find the perfect tennis booking with advanced filters
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Basic Search */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="keyword" className="text-gray-700 dark:text-gray-300">Search</Label>
              <Input
                id="keyword"
                placeholder="Search by title, description, or location..."
                value={searchDto.keyword || ""}
                onChange={(e) => handleInputChange("keyword", e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location</Label>
              <Input
                id="location"
                placeholder="Enter location..."
                value={searchDto.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
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
                <Badge variant="secondary" className="ml-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">{count}</Badge>
              </Button>
            ))}
          </div>

          <Button onClick={handleSearch} className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <>
            <Separator className="my-6 bg-gray-200 dark:bg-gray-600" />
            
            <div className="space-y-6">
              {/* Time Filters */}
              <div>
                <h3 className="text-lg font-medium flex items-center mb-4 text-gray-900 dark:text-white">
                  <Calendar className="w-5 h-5 mr-2" />
                  Time & Date
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-gray-700 dark:text-gray-300">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={searchDto.startDate || ""}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-gray-700 dark:text-gray-300">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={searchDto.endDate || ""}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime" className="text-gray-700 dark:text-gray-300">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={searchDto.startTime || ""}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime" className="text-gray-700 dark:text-gray-300">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={searchDto.endTime || ""}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Type & Status Filters */}
              <div>
                <h3 className="text-lg font-medium flex items-center mb-4 text-gray-900 dark:text-white">
                  <Filter className="w-5 h-5 mr-2" />
                  Type & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">Booking Type</Label>
                    <Select 
                      value={searchDto.type !== undefined ? searchDto.type.toString() : "all"} 
                      onValueChange={(value) => handleInputChange("type", value === "all" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectItem value="all">All types</SelectItem>
                        {Object.values(BookingType).filter(v => !isNaN(Number(v))).map(type => (
                          <SelectItem key={type} value={type.toString()}>
                            {getBookingTypeLabel(type as BookingType)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">Status</Label>
                    <Select 
                      value={searchDto.status !== undefined ? searchDto.status.toString() : "all"} 
                      onValueChange={(value) => handleInputChange("status", value === "all" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectItem value="all">All statuses</SelectItem>
                        {Object.values(BookingStatus).filter(v => !isNaN(Number(v))).map(status => (
                          <SelectItem key={status} value={status.toString()}>
                            {getBookingStatusLabel(status as BookingStatus)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Skill Level Filters */}
              <div>
                <h3 className="text-lg font-medium flex items-center mb-4 text-gray-900 dark:text-white">
                  <Target className="w-5 h-5 mr-2" />
                  Skill Level
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minSkill" className="text-gray-700 dark:text-gray-300">Minimum Skill Level</Label>
                    <Select 
                      value={searchDto.minSkillLevel !== undefined ? searchDto.minSkillLevel.toString() : "all"} 
                      onValueChange={(value) => handleInputChange("minSkillLevel", value === "all" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectItem value="all">Any level</SelectItem>
                        {Object.values(SkillLevel).filter(v => !isNaN(Number(v))).map(level => (
                          <SelectItem key={level} value={level.toString()}>
                            {getSkillLevelLabel(level as SkillLevel)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxSkill" className="text-gray-700 dark:text-gray-300">Maximum Skill Level</Label>
                    <Select 
                      value={searchDto.maxSkillLevel !== undefined ? searchDto.maxSkillLevel.toString() : "all"} 
                      onValueChange={(value) => handleInputChange("maxSkillLevel", value === "all" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectItem value="all">Any level</SelectItem>
                        {Object.values(SkillLevel).filter(v => !isNaN(Number(v))).map(level => (
                          <SelectItem key={level} value={level.toString()}>
                            {getSkillLevelLabel(level as SkillLevel)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Participant Filters */}
              <div>
                <h3 className="text-lg font-medium flex items-center mb-4 text-gray-900 dark:text-white">
                  <Users className="w-5 h-5 mr-2" />
                  Participants
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minParticipants" className="text-gray-700 dark:text-gray-300">Min Participants</Label>
                    <Input
                      id="minParticipants"
                      type="number"
                      min="1"
                      placeholder="Any"
                      value={searchDto.minParticipants || ""}
                      onChange={(e) => handleInputChange("minParticipants", e.target.value ? parseInt(e.target.value) : undefined)}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants" className="text-gray-700 dark:text-gray-300">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="1"
                      placeholder="Any"
                      value={searchDto.maxParticipants || ""}
                      onChange={(e) => handleInputChange("maxParticipants", e.target.value ? parseInt(e.target.value) : undefined)}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Filters */}
              <div>
                <h3 className="text-lg font-medium flex items-center mb-4 text-gray-900 dark:text-white">
                  <Clock className="w-5 h-5 mr-2" />
                  Additional Filters
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasAvailableSlots"
                      checked={searchDto.hasAvailableSlots || false}
                      onCheckedChange={(checked) => handleInputChange("hasAvailableSlots", checked)}
                    />
                    <Label htmlFor="hasAvailableSlots" className="text-gray-700 dark:text-gray-300">Only show bookings with available slots</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFlexible"
                      checked={searchDto.isFlexible || false}
                      onCheckedChange={(checked) => handleInputChange("isFlexible", checked)}
                    />
                    <Label htmlFor="isFlexible" className="text-gray-700 dark:text-gray-300">Only show flexible time bookings</Label>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Sort By</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sortBy" className="text-gray-700 dark:text-gray-300">Sort Field</Label>
                    <Select 
                      value={searchDto.sortBy || "all"} 
                      onValueChange={(value) => handleInputChange("sortBy", value === "all" ? undefined : value)}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Created date" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectItem value="all">Created date</SelectItem>
                        <SelectItem value="time">Booking time</SelectItem>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="skill">Skill level</SelectItem>
                        <SelectItem value="participants">Participants</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sortOrder" className="text-gray-700 dark:text-gray-300">Sort Order</Label>
                    <Select 
                      value={searchDto.sortDescending ? "desc" : "asc"} 
                      onValueChange={(value) => handleInputChange("sortDescending", value === "desc")}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 