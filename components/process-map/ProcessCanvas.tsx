"use client";

import { useState } from "react";
import { Section, Component, Metric, User, Todo, Issue, Idea, Comment } from "@prisma/client";
import ComponentCard from "./ComponentCard";
import ComponentDetail from "./ComponentDetail";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

  return (
    <>
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

      {selectedComponent && (
        <ComponentDetail
          component={selectedComponent}
          open={!!selectedComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </>
  );
}
