"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ArrowRight, ShieldCheck, ShoppingCart, Zap, BookOpen, Layers, CheckCircle, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="AgentPay AI logo"
              width={32}
              height={32}
              priority
              className="w-8 h-8 rounded-lg shadow-sm shrink-0"
            />
            <span className="font-semibold text-base sm:text-lg text-foreground">
              AgentPay AI
            </span>
            <Badge variant="success" className="hidden sm:inline-flex text-[11px] font-medium">
              ● PayPal Sandbox Ready
            </Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/docs">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                <BookOpen className="w-4 h-4 mr-1.5" /> Documentation
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Open Demo
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 max-w-4xl mx-auto w-full text-center">
        {/* Category Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <Badge variant="sponsor" className="px-3 py-1 font-medium text-xs">
            PayPal AI Hackathon 2026
          </Badge>
          <Badge variant="purple" className="px-3 py-1 font-medium text-xs">
            Safe AI Shopping
          </Badge>
        </div>

        {/* Clear, Human Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight max-w-3xl">
          Shop with AI.{" "}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Never get overcharged.
          </span>
        </h1>

        {/* Friendly 2-Line Subheading */}
        <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
          Tell the AI what you need and set your spending limit. It searches stores, compares prices, catches sneaky markups, and asks for your 1-click approval before paying with PayPal.
        </p>

        {/* The 1-Click Guest Demo Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="glow" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3.5 text-sm sm:text-base font-medium">
              <span>Try the Live Demo (No Sign-Up Needed)</span>
              <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
            </Button>
          </Link>
        </div>
        <p className="mt-2 text-xs text-muted-foreground font-normal">
          Instant access • Safe PayPal Sandbox mode • Test cards provided
        </p>

        {/* Sponsor Banner in Simple Words */}
        <div className="mt-12 w-full max-w-3xl pt-6 border-t border-border/60">
          <p className="text-xs text-muted-foreground font-medium mb-3">
            Built with trusted developer tools:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-foreground/80 font-normal">
            <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">PayPal Orders v2</span>
            <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">Channel3 Catalog</span>
            <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">AG Grid Tables</span>
            <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">APIMatic Schemas</span>
            <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">Elastic Search</span>
            <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">Zapier Webhooks</span>
            <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">Postman &amp; Render</span>
          </div>
        </div>

        {/* 3 Simple, Clear Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 w-full text-left">
          <Card className="glass p-5">
            <CardHeader className="p-0 pb-2">
              <ShoppingCart className="w-5 h-5 text-primary mb-2" />
              <CardTitle className="text-base font-semibold">1. Finds the Best Match</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                Reads specifications, customer reviews, and warranties to find what truly fits your requirements.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass p-5">
            <CardHeader className="p-0 pb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
              <CardTitle className="text-base font-semibold">2. Catches Sneaky Fees</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                If a seller adds unapproved markups or goes over your budget, the AI halts and rejects the purchase immediately.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass p-5">
            <CardHeader className="p-0 pb-2">
              <Zap className="w-5 h-5 text-purple-400 mb-2" />
              <CardTitle className="text-base font-semibold">3. You Stay in Control</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                The AI can never spend your money by itself. It always asks for your 1-click confirmation before paying.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Simple Deep-Dive Section for Judges */}
        <div className="mt-14 w-full text-left">
          <Tabs defaultValue="how-it-works" className="w-full">
            <div className="flex justify-center mb-4">
              <TabsList>
                <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
                <TabsTrigger value="safety">Safety & Limits</TabsTrigger>
                <TabsTrigger value="tests">Tests & Code Quality</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="how-it-works">
              <Card className="glass p-5">
                <h4 className="font-semibold text-sm text-foreground mb-1.5 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> The 3-Step Shopping Process
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You tell the AI what you want and set your spending limit. The AI searches verified stores, checks quotes for any hidden surcharges or fees, and asks for your 1-click approval before paying safely with PayPal.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="safety">
              <Card className="glass p-5">
                <h4 className="font-semibold text-sm text-foreground mb-1.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Spending Limits You Can Trust
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every order is checked against your maximum budget limit. If any quote exceeds your limit or includes unapproved line-item fees, the checkout is halted automatically.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="tests">
              <Card className="glass p-5">
                <h4 className="font-semibold text-sm text-foreground mb-1.5 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" /> Fully Tested
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Includes 21 automated safety checks and tests that verify payment safety, budget limits, and live PayPal API connections.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 px-4 text-center text-xs text-muted-foreground font-normal">
        AgentPay AI • PayPal AI Hackathon 2026 • Open Source (MIT License)
      </footer>
    </div>
  );
}
