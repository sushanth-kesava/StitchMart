"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    // Add login logic here
    setTimeout(() => setIsLoading(false), 2000);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 indian-motif-bg opacity-5" />
        
        <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-primary" />
          <CardHeader className="space-y-2 text-center pt-8">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Welcome Back</CardTitle>
            <CardDescription>
              Login to access your designs, orders, and personalized recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  placeholder="name@example.com" 
                  type="email" 
                  autoCapitalize="none" 
                  autoComplete="email" 
                  autoCorrect="off" 
                  disabled={isLoading}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  disabled={isLoading}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <Button 
                className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12 rounded-xl border-border/50">
                Google
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-border/50">
                Facebook
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                Register now
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
