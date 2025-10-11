"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

interface ProcessMapFiltersProps {
  users: { id: string; name: string | null }[];
  sections: { id: string; name: string }[];
  currentFilters: {
    health?: string;
    owner?: string;
    section?: string;
    search?: string;
  };
}

export default function ProcessMapFilters({
  users,
  sections,
  currentFilters,
}: ProcessMapFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/process-map?${params.toString()}`);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search components..."
              className="pl-9"
              defaultValue={currentFilters.search || ""}
              onChange={(e) => {
                const timer = setTimeout(() => {
                  updateFilter("search", e.target.value);
                }, 500);
                return () => clearTimeout(timer);
              }}
            />
          </div>

          {/* Health Status Filter */}
          <Select
            value={currentFilters.health || "all"}
            onValueChange={(value) => updateFilter("health", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Health Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Health Statuses</SelectItem>
              <SelectItem value="GREEN">Green - Performing Well</SelectItem>
              <SelectItem value="YELLOW">Yellow - Needs Attention</SelectItem>
              <SelectItem value="RED">Red - Critical</SelectItem>
              <SelectItem value="GRAY">Gray - Not Set</SelectItem>
              <SelectItem value="BLUE">Blue - In Progress</SelectItem>
            </SelectContent>
          </Select>

          {/* Owner Filter */}
          <Select
            value={currentFilters.owner || "all"}
            onValueChange={(value) => updateFilter("owner", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Section Filter */}
          <Select
            value={currentFilters.section || "all"}
            onValueChange={(value) => updateFilter("section", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
