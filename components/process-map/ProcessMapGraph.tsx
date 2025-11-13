"use client";

import { useState, useRef, useEffect } from "react";
import { Section, Component, User } from "@prisma/client";
import { Card } from "@/components/ui/card";
import ComponentDetail from "./ComponentDetail";

type ComponentWithRelations = Component & {
  owner: User;
  metrics: any[];
  todos: any[];
  issues: any[];
  ideas: any[];
  comments: any[];
  _count?: {
    todos: number;
    issues: number;
    ideas: number;
  };
};

type SectionWithComponents = Section & {
  components: ComponentWithRelations[];
};

interface ProcessMapGraphProps {
  sections: SectionWithComponents[];
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  component: ComponentWithRelations;
  section: Section;
}

const healthColors = {
  RED: "#ef4444",
  YELLOW: "#eab308",
  GREEN: "#22c55e",
  GRAY: "#9ca3af",
  BLUE: "#3b82f6",
};

export default function ProcessMapGraph({ sections }: ProcessMapGraphProps) {
  const [selectedComponent, setSelectedComponent] = useState<ComponentWithRelations | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Calculate node positions in a flowchart layout
  const calculateNodePositions = (): NodePosition[] => {
    const positions: NodePosition[] = [];
    const horizontalSpacing = 280;
    const verticalSpacing = 180;
    const startX = 150;
    const startY = 100;

    let currentY = startY;

    sections.forEach((section, sectionIndex) => {
      const componentsInSection = section.components.length;
      const sectionWidth = Math.min(componentsInSection, 4) * horizontalSpacing;

      section.components.forEach((component, componentIndex) => {
        const row = Math.floor(componentIndex / 4);
        const col = componentIndex % 4;

        positions.push({
          id: component.id,
          x: startX + col * horizontalSpacing,
          y: currentY + row * verticalSpacing,
          component,
          section,
        });
      });

      // Move Y position for next section
      const rows = Math.ceil(componentsInSection / 4);
      currentY += rows * verticalSpacing + 80; // Extra space between sections
    });

    return positions;
  };

  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);

  useEffect(() => {
    setNodePositions(calculateNodePositions());
  }, [sections]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(800, containerRef.current.clientHeight),
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw connections based on flow (each component connects to the next in the same section)
    nodePositions.forEach((node, index) => {
      const nextInSection = nodePositions.find(
        (n, i) =>
          i > index &&
          n.section.id === node.section.id &&
          i === index + 1
      );

      if (nextInSection) {
        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(node.x + 100, node.y + 40);
        ctx.lineTo(nextInSection.x - 20, nextInSection.y + 40);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw arrow
        const arrowSize = 8;
        const angle = Math.atan2(
          nextInSection.y + 40 - (node.y + 40),
          nextInSection.x - 20 - (node.x + 100)
        );
        ctx.fillStyle = "#d1d5db";
        ctx.beginPath();
        ctx.moveTo(nextInSection.x - 20, nextInSection.y + 40);
        ctx.lineTo(
          nextInSection.x - 20 - arrowSize * Math.cos(angle - Math.PI / 6),
          nextInSection.y + 40 - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          nextInSection.x - 20 - arrowSize * Math.cos(angle + Math.PI / 6),
          nextInSection.y + 40 + arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    });
  }, [nodePositions, dimensions]);

  const handleNodeClick = (node: NodePosition) => {
    setSelectedComponent(node.component);
  };

  return (
    <>
      <div ref={containerRef} className="relative w-full" style={{ height: "calc(100vh - 300px)", minHeight: "600px" }}>
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute top-0 left-0"
        />

        <div className="absolute top-0 left-0 w-full h-full overflow-auto">
          <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
            {/* Section Labels */}
            {sections.map((section, index) => {
              const sectionNodes = nodePositions.filter(n => n.section.id === section.id);
              if (sectionNodes.length === 0) return null;

              const minY = Math.min(...sectionNodes.map(n => n.y));

              return (
                <div
                  key={section.id}
                  className="absolute bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2"
                  style={{
                    left: 20,
                    top: minY - 50,
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#1e40af",
                  }}
                >
                  {section.name}
                </div>
              );
            })}

            {/* Component Nodes */}
            {nodePositions.map((node) => {
              const isHovered = hoveredNode === node.id;
              const healthColor = healthColors[node.component.healthStatus];

              return (
                <div
                  key={node.id}
                  className="absolute cursor-pointer transition-transform hover:scale-105"
                  style={{
                    left: node.x,
                    top: node.y,
                    width: 220,
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                  }}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <Card className={`p-3 shadow-md ${isHovered ? "shadow-lg ring-2 ring-blue-400" : ""}`}>
                    <div className="flex items-start gap-2">
                      <div
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: healthColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {node.component.title}
                        </h3>
                        {node.component.tool && (
                          <p className="text-xs text-gray-500 truncate">
                            {node.component.tool}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2 text-xs">
                          {node.component._count && node.component._count.todos > 0 && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {node.component._count.todos} todos
                            </span>
                          )}
                          {node.component._count && node.component._count.issues > 0 && (
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              {node.component._count.issues} issues
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
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
