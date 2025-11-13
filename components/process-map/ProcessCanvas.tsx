"use client";

import { useState } from "react";
import { Section, Component, Metric, User, Todo, Issue, Idea, Comment } from "@prisma/client";
import ComponentCard from "./ComponentCard";
import ComponentDetail from "./ComponentDetail";
import ProcessMapGraph from "./ProcessMapGraph";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Network } from "lucide-react";

type ComponentWithRelations = Component & {
  owner: User;
  metrics: Metric[];
  todos: (Todo & { assignee?: User | null })[];
  issues: (Issue & { reportedBy: User })[];
  ideas: (Idea & { submittedBy: User })[];
  comments: (Comment & { author: User })[];
  _count?: {
    todos: number;
    issues: number;
    ideas: number;
  };
};

type SectionWithComponents = Section & {
  components: ComponentWithRelations[];
};

interface ProcessCanvasProps {
  sections: SectionWithComponents[];
}

export default function ProcessCanvas({ sections }: ProcessCanvasProps) {
  const [selectedComponent, setSelectedComponent] = useState<ComponentWithRelations | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");

  return (
    <>
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          onClick={() => setViewMode("list")}
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          List View
        </Button>
        <Button
          variant={viewMode === "graph" ? "default" : "outline"}
          onClick={() => setViewMode("graph")}
          className="gap-2"
        >
          <Network className="h-4 w-4" />
          Graph View
        </Button>
      </div>

      {/* Render based on view mode */}
      {viewMode === "graph" ? (
        <ProcessMapGraph sections={sections} />
      ) : (
        <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-xl">{section.name}</CardTitle>
              {section.description && (
                <p className="text-sm text-gray-600">{section.description}</p>
              )}
            </CardHeader>
            <CardContent>
              {section.components.length === 0 ? (
                <p className="text-sm text-gray-500">No components in this section</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {section.components.map((component) => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      onClick={() => setSelectedComponent(component)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No sections configured yet</p>
          </div>
        )}
        </div>
      )}

      {viewMode === "list" && selectedComponent && (
        <ComponentDetail
          component={selectedComponent}
          open={!!selectedComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </>
  );
}
