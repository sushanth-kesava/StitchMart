"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, User, Briefcase, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("customer");

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    // Add signup logic here
    setTimeout(() => setIsLoading(false), 2000);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 indian-motif-bg opacity-5" />
        
        <Card className="w-full max-w-lg relative z-10 border-border/50 shadow-2xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-secondary" />
          <CardHeader className="space-y-2 text-center pt-8">
            <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-2">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Create Account</CardTitle>
            <CardDescription>
              Join the largest embroidery community in India today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>I want to register as a...</Label>
                <RadioGroup 
                  defaultValue="customer" 
                  onValueChange={setRole}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="customer" id="customer" className="peer sr-only" />
                    <Label
                      htmlFor="customer"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-secondary [&:has([data-state=checked])]:border-secondary cursor-pointer"
                    >
                      <User className="mb-2 h-6 w-6" />
                      <span className="font-bold">Customer</span>
                      <span className="text-[10px] text-muted-foreground text-center mt-1">I want to buy designs and tools</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="dealer" id="dealer" className="peer sr-only" />
                    <Label
                      htmlFor="dealer"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-secondary [&:has([data-state=checked])]:border-secondary cursor-pointer"
                    >
                      <Briefcase className="mb-2 h-6 w-6" />
                      <span className="font-bold">Dealer</span>
                      <span className="text-[10px] text-muted-foreground text-center mt-1">I want to sell my products</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="Arjun" required className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Sharma" required className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  placeholder="name@example.com" 
                  type="email" 
                  disabled={isLoading}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  disabled={isLoading}
                  className="h-12 rounded-xl"
                  required
                />
                <p className="text-[10px] text-muted-foreground">Must be at least 8 characters long.</p>
              </div>

              <Button 
                className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-secondary/20 bg-secondary hover:bg-secondary/90" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Complete Registration"}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <p className="text-xs text-center text-muted-foreground px-6">
              By clicking register, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">Privacy Policy</Link>.
            </p>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-secondary font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
