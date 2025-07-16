"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface AvatarPickerProps {
  selectedAvatar?: string;
  onAvatarSelect: (avatar: string) => void;
  disabled?: boolean;
}

const AVATAR_OPTIONS = [
  "avatar1.png",
  "avatar2.png", 
  "avatar3.png",
  "avatar4.png",
  "avatar5.png",
  "avatar6.png",
  "avatar7.png",
  "avatar8.png"
];

export default function AvatarPicker({ selectedAvatar, onAvatarSelect, disabled = false }: AvatarPickerProps) {
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Choose your avatar
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {AVATAR_OPTIONS.map((avatar) => {
          const isSelected = selectedAvatar === avatar;
          const isHovered = hoveredAvatar === avatar;
          
          return (
            <Card
              key={avatar}
              className={`
                relative cursor-pointer transition-all duration-200 p-2
                ${isSelected 
                  ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !disabled && onAvatarSelect(avatar)}
              onMouseEnter={() => !disabled && setHoveredAvatar(avatar)}
              onMouseLeave={() => setHoveredAvatar(null)}
            >
              <div className="relative">
                <img
                  src={`/avatars/${avatar}`}
                  alt={`Avatar ${avatar}`}
                  className="w-full h-auto rounded-lg"
                />
                
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {/* Hover indicator */}
                {isHovered && !isSelected && !disabled && (
                  <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      
      {selectedAvatar && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Selected: {selectedAvatar}
        </div>
      )}
    </div>
  );
} 