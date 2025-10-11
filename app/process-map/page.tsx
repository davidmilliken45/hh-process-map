import prisma from "@/lib/prisma";
import AppLayout from "@/components/layout/AppLayout";
import ProcessCanvas from "@/components/process-map/ProcessCanvas";
import ProcessMapFilters from "@/components/process-map/ProcessMapFilters";

async function getProcessMapData(searchParams: {
  health?: string;
  owner?: string;
  section?: string;
  search?: string;
}) {
  const sections = await prisma.section.findMany({
    orderBy: { order: "asc" },
    include: {
      components: {
        where: {
          ...(searchParams.health && searchParams.health !== "all"
            ? { healthStatus: searchParams.health as any }
            : {}),
          ...(searchParams.owner && searchParams.owner !== "all"
            ? { ownerId: searchParams.owner }
            : {}),
          ...(searchParams.search
            ? {
                OR: [
                  { title: { contains: searchParams.search, mode: "insensitive" } },
                  { tool: { contains: searchParams.search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: {
          owner: true,
          metrics: {
            orderBy: { order: "asc" },
          },
          todos: {
            where: { completed: false },
            include: {
              assignee: true,
            },
          },
          issues: {
            where: { status: { not: "RESOLVED" } },
            include: {
              reportedBy: true,
            },
          },
          ideas: {
            where: { implemented: false },
            include: {
              submittedBy: true,
            },
          },
          comments: {
            include: {
              author: true,
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              todos: { where: { completed: false } },
              issues: { where: { status: { not: "RESOLVED" } } },
              ideas: { where: { implemented: false } },
            },
          },
        },
      },
    },
  });

  // Filter sections if section filter is applied
  const filteredSections =
    searchParams.section && searchParams.section !== "all"
      ? sections.filter((s) => s.id === searchParams.section)
      : sections;

  // Get all users for owner filter
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return {
    sections: filteredSections,
    users,
    allSections: sections.map((s) => ({ id: s.id, name: s.name })),
  };
}

export default async function ProcessMapPage({
  searchParams,
}: {
  searchParams: {
    health?: string;
    owner?: string;
    section?: string;
    search?: string;
  };
}) {
  const data = await getProcessMapData(searchParams);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Process Map</h1>
            <p className="text-gray-600 mt-2">
              Interactive view of business processes and components
            </p>
          </div>
        </div>

        <ProcessMapFilters
          users={data.users}
          sections={data.allSections}
          currentFilters={searchParams}
        />

        <ProcessCanvas sections={data.sections} />
      </div>
    </AppLayout>
  );
}
