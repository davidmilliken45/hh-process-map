"use client";

import { useState } from "react";
import { Component, Metric, User, Todo, Issue, Idea, Comment } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HealthIndicator from "./HealthIndicator";
import { CheckCircle2, AlertTriangle, Lightbulb, MessageSquare, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ComponentDetailProps {
  component: Component & {
    owner: User;
    metrics: Metric[];
    todos: (Todo & { assignee?: User | null })[];
    issues: (Issue & { reportedBy: User })[];
    ideas: (Idea & { submittedBy: User })[];
    comments: (Comment & { author: User })[];
  };
  open: boolean;
  onClose: () => void;
}

const priorityColors = {
  P1: "bg-red-100 text-red-800",
  P2: "bg-orange-100 text-orange-800",
  P3: "bg-yellow-100 text-yellow-800",
  P4: "bg-gray-100 text-gray-800",
};

export default function ComponentDetail({
  component,
  open,
  onClose,
}: ComponentDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const activeTodos = component.todos.filter((t) => !t.completed);
  const openIssues = component.issues.filter((i) => i.status !== "RESOLVED");
  const activeIdeas = component.ideas.filter((i) => !i.implemented);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <HealthIndicator status={component.healthStatus} size="lg" />
              <DialogTitle className="text-2xl">{component.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Component Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Owner:</span>{" "}
              {component.owner.name}
            </div>
            {component.tool && (
              <div>
                <span className="font-medium text-gray-700">Tool:</span>{" "}
                {component.tool}
              </div>
            )}
          </div>

          {/* Current and Target State */}
          {(component.currentState || component.targetState) && (
            <div className="space-y-3">
              {component.currentState && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Current State:
                  </div>
                  <p className="text-sm text-gray-600">{component.currentState}</p>
                </div>
              )}
              {component.targetState && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Target State:
                  </div>
                  <p className="text-sm text-gray-600">{component.targetState}</p>
                </div>
              )}
            </div>
          )}

          {/* Metrics */}
          {component.metrics.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Metrics</h3>
              <div className="space-y-2">
                {component.metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">{metric.name}:</span>
                    <span className="font-mono">
                      {metric.current || "N/A"}
                      {metric.target && (
                        <span className="text-gray-500"> (target: {metric.target})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs for Todos, Issues, Ideas, Comments */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Todos ({activeTodos.length})
              </TabsTrigger>
              <TabsTrigger value="issues" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Issues ({openIssues.length})
              </TabsTrigger>
              <TabsTrigger value="ideas" className="text-xs">
                <Lightbulb className="h-3 w-3 mr-1" />
                Ideas ({activeIdeas.length})
              </TabsTrigger>
              <TabsTrigger value="comments" className="text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                Comments ({component.comments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="space-y-3">
              {activeTodos.length === 0 ? (
                <p className="text-sm text-gray-500">No active todos</p>
              ) : (
                activeTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-3 border rounded-md space-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{todo.title}</h4>
                    </div>
                    {todo.description && (
                      <p className="text-sm text-gray-600">{todo.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {todo.assignee && <span>Assigned to: {todo.assignee.name}</span>}
                      {todo.dueDate && (
                        <span>
                          Due: {formatDistanceToNow(todo.dueDate, { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="issues" className="space-y-3">
              {openIssues.length === 0 ? (
                <p className="text-sm text-gray-500">No open issues</p>
              ) : (
                openIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 border rounded-md space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm flex-1">{issue.title}</h4>
                      <Badge className={priorityColors[issue.priority]}>
                        {issue.priority}
                      </Badge>
                    </div>
                    {issue.description && (
                      <p className="text-sm text-gray-600">{issue.description}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      Reported by {issue.reportedBy.name} •{" "}
                      {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="ideas" className="space-y-3">
              {activeIdeas.length === 0 ? (
                <p className="text-sm text-gray-500">No ideas yet</p>
              ) : (
                activeIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-3 border rounded-md space-y-2"
                  >
                    <h4 className="font-medium text-sm">{idea.title}</h4>
                    {idea.description && (
                      <p className="text-sm text-gray-600">{idea.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>By {idea.submittedBy.name}</span>
                      <span>•</span>
                      <span>{idea.votes} votes</span>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-3">
              {component.comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet</p>
              ) : (
                component.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 border rounded-md space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.author.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
