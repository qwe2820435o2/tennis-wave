"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Volleyball, Users, MapPin, Calendar, Trophy, MessageCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { hideLoading } from "@/store/slices/loadingSlice";

interface User {
  userId: number;
  userName: string;
  email: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      }
    }
    // 进入首页时关闭全局loading
    dispatch(hideLoading());
  }, [dispatch]);

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Find Tennis Partners",
      description: "Connect with tennis enthusiasts in your area and find the perfect match for your skill level."
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Discover Courts",
      description: "Find the best tennis courts near you with detailed information and reviews."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Schedule Matches",
      description: "Easily schedule and manage your tennis matches with integrated calendar support."
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Real-time Chat",
      description: "Communicate with your tennis partners through our real-time messaging system."
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Track Progress",
      description: "Monitor your tennis journey with detailed statistics and progress tracking."
    },
    {
      icon: <Volleyball className="w-6 h-6" />,
      title: "Join Tournaments",
      description: "Participate in local tournaments and compete with players of similar skill levels."
    }
  ];

  return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 dark:bg-green-500 rounded-full mb-6">
                <Volleyball className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Connect with Tennis
                <span className="text-green-600 dark:text-green-400"> Enthusiasts</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Find tennis partners, join matches, and improve your game with our community of passionate players.
              </p>

              {user ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/matches">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-lg px-8 py-3 text-white">
                        Find Matches
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        My Profile
                      </Button>
                    </Link>
                  </div>
              ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth/register">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-lg px-8 py-3 text-white">
                        Get Started
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Sign In
                      </Button>
                    </Link>
                  </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need for Tennis
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our platform provides all the tools you need to enhance your tennis experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                  <Card key={index} className="border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-colors bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50">
                    <CardHeader>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="border-2 border-green-600 dark:border-green-500 shadow-2xl bg-white dark:bg-gray-800">
              <CardContent className="pt-12 pb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Start Your Tennis Journey?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Join thousands of tennis enthusiasts and take your game to the next level.
                </p>
                {!user && (
                    <Link href="/auth/register">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-lg px-8 py-3 text-white">
                        Join Tennis Wave Today
                      </Button>
                    </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-black text-white py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                <Volleyball className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">Tennis Wave</span>
            </div>
            <p className="text-gray-400 dark:text-gray-300 mb-4">
              Connect with tennis enthusiasts, start your tennis journey
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2025 Tennis Wave. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
  );
}