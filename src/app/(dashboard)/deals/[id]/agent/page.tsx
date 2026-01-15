"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Sparkles,
  Zap,
  MessageSquare,
  FileSearch,
  ClipboardList,
  Bell,
  Brain,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDeal } from "@/lib/supabase/queries";
import type { Deal } from "@/lib/supabase/types";

// Planned agent capabilities
const capabilities = [
  {
    icon: FileSearch,
    title: "Due Diligence Research",
    description: "Automatically gather property data, comparable sales, market trends, and zoning information.",
    color: "#60A5FA",
  },
  {
    icon: ClipboardList,
    title: "Task Automation",
    description: "Auto-create tasks based on deal stage, assign to team members, and track deadlines.",
    color: "#3ECF8E",
  },
  {
    icon: MessageSquare,
    title: "Document Analysis",
    description: "Extract key terms from leases, contracts, and inspection reports using AI.",
    color: "#A78BFA",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get proactive alerts about deadlines, market changes, and deal blockers.",
    color: "#FBBF24",
  },
  {
    icon: Brain,
    title: "Deal Insights",
    description: "AI-powered analysis of deal strengths, risks, and optimization opportunities.",
    color: "#F87171",
  },
  {
    icon: Rocket,
    title: "Workflow Orchestration",
    description: "Chain multiple tasks into automated workflows that run on schedule or trigger.",
    color: "#34D399",
  },
];

export default function DealAgentPage() {
  const params = useParams();
  const dealId = params.id as string;

  const { data: deal } = useQuery<Deal>({
    queryKey: ["deal", dealId],
    queryFn: () => getDeal(dealId),
    staleTime: 60 * 1000,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">AI Agent</h2>
            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
          </div>
          <p className="text-sm text-foreground-muted">
            Automate tasks and get AI-powered assistance for {deal?.name || "this deal"}
          </p>
        </div>
      </div>

      {/* Hero Card */}
      <Card className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10" />

        <div className="relative p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                <Bot className="h-10 w-10 text-purple-400" />
              </div>
              <div className="absolute -top-1 -right-1 flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                <Sparkles className="h-3 w-3 text-yellow-400" />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-3">
            AI-Powered Deal Management
          </h3>
          <p className="text-sm text-foreground-muted max-w-lg mx-auto mb-6">
            Dispatch intelligent agents to help manage your deals. Automate research,
            streamline workflows, generate reports, and stay ahead of deadlines.
            Powered by OpenRouter for maximum flexibility.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button disabled className="opacity-70">
              <Zap className="h-4 w-4 mr-2" />
              Enable AI Agent
            </Button>
            <Button variant="outline" disabled className="opacity-70">
              Learn More
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Capabilities Grid */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Planned Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((capability) => {
            const Icon = capability.icon;
            return (
              <Card key={capability.title} className="p-4 hover:bg-surface-hover transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center h-10 w-10 rounded-lg shrink-0"
                    style={{ backgroundColor: `${capability.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: capability.color }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      {capability.title}
                    </h4>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      {capability.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Integration Note */}
      <Card className="p-4 bg-surface-elevated border-border">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/20 shrink-0">
            <Zap className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">
              Powered by OpenRouter
            </h4>
            <p className="text-xs text-foreground-muted">
              Access the best AI models through a single API. Claude, GPT-4, Gemini, and more -
              choose the right model for each task with automatic fallbacks and cost optimization.
            </p>
          </div>
        </div>
      </Card>

      {/* Early Access CTA */}
      <div className="text-center py-4">
        <p className="text-sm text-foreground-muted mb-2">
          Want early access to AI features?
        </p>
        <Button variant="outline" size="sm" disabled className="opacity-70">
          Join Waitlist
        </Button>
      </div>
    </div>
  );
}
