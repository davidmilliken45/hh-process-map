import { HealthStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, AlertCircle, Lightbulb } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatDistanceToNow } from "date-fns";

async function getDashboardData() {
  const components = await prisma.component.findMany({
    include: {
      section: true,
      owner: true,
    },
  });

  const todos = await prisma.todo.findMany({
    where: { completed: false },
  });

  const issues = await prisma.issue.findMany({
    where: { status: { not: "RESOLVED" } },
  });

  const ideas = await prisma.idea.findMany({
    where: { implemented: false },
  });

  const recentActivity = await prisma.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
    },
  });

  // Calculate health metrics
  const healthCounts = {
    RED: components.filter((c) => c.healthStatus === HealthStatus.RED).length,
    YELLOW: components.filter((c) => c.healthStatus === HealthStatus.YELLOW).length,
    GREEN: components.filter((c) => c.healthStatus === HealthStatus.GREEN).length,
    GRAY: components.filter((c) => c.healthStatus === HealthStatus.GRAY).length,
    BLUE: components.filter((c) => c.healthStatus === HealthStatus.BLUE).length,
  };

  // Calculate overall health score (0-100)
  const totalComponents = components.length;
  const healthScore = totalComponents > 0
    ? Math.round(
        ((healthCounts.GREEN * 100 + healthCounts.YELLOW * 50 + healthCounts.RED * 0) /
          (totalComponents * 100)) *
          100
      )
    : 0;

  return {
    healthScore,
    healthCounts,
    totalTodos: todos.length,
    totalIssues: issues.length,
    totalIdeas: ideas.length,
    recentActivity,
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();

  const chartData = [
    { name: "Performing Well", value: data.healthCounts.GREEN, color: "#22c55e" },
    { name: "Needs Attention", value: data.healthCounts.YELLOW, color: "#eab308" },
    { name: "Critical", value: data.healthCounts.RED, color: "#ef4444" },
    { name: "Not Set", value: data.healthCounts.GRAY, color: "#9ca3af" },
  ].filter((item) => item.value > 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Business Health Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of process health and activity
          </p>
        </div>

        {/* Health Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-5xl font-bold">
                    {data.healthScore}
                    <span className="text-2xl text-gray-500">/100</span>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full ${
                      data.healthScore >= 70
                        ? "bg-green-500"
                        : data.healthScore >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="font-medium">Critical:</span>
                    <span className="text-gray-600">{data.healthCounts.RED}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="font-medium">Needs Attention:</span>
                    <span className="text-gray-600">{data.healthCounts.YELLOW}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="font-medium">Performing Well:</span>
                    <span className="text-gray-600">{data.healthCounts.GREEN}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Todos</p>
                  <p className="text-2xl font-bold">{data.totalTodos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Open Issues</p>
                  <p className="text-2xl font-bold">{data.totalIssues}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ideas</p>
                  <p className="text-2xl font-bold">{data.totalIdeas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500">No recent activity</p>
              ) : (
                data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5">
                      {activity.action === "created" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {activity.action === "updated" && (
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                      )}
                      {activity.action === "deleted" && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">
                        <span className="font-medium">{activity.user.name}</span>{" "}
                        {activity.action} {activity.entityType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
