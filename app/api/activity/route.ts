import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/activity - Get activity log with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (action) where.action = action;

    // Get total count for pagination
    const total = await prisma.activityLog.count({ where });

    // Get activity logs
    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Math.min(limit, 100), // Max 100 items per request
      skip: offset,
    });

    // Optionally enrich with entity details
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        let entityDetails = null;

        try {
          // Fetch basic entity details based on type
          switch (activity.entityType) {
            case 'component':
              entityDetails = await prisma.component.findUnique({
                where: { id: activity.entityId },
                select: { id: true, title: true },
              });
              break;
            case 'todo':
              entityDetails = await prisma.todo.findUnique({
                where: { id: activity.entityId },
                select: { id: true, title: true },
              });
              break;
            case 'issue':
              entityDetails = await prisma.issue.findUnique({
                where: { id: activity.entityId },
                select: { id: true, title: true },
              });
              break;
            case 'idea':
              entityDetails = await prisma.idea.findUnique({
                where: { id: activity.entityId },
                select: { id: true, title: true },
              });
              break;
            case 'metric':
              entityDetails = await prisma.metric.findUnique({
                where: { id: activity.entityId },
                select: { id: true, name: true },
              });
              break;
            case 'comment':
              entityDetails = await prisma.comment.findUnique({
                where: { id: activity.entityId },
                select: { id: true, content: true },
              });
              break;
            case 'section':
              entityDetails = await prisma.section.findUnique({
                where: { id: activity.entityId },
                select: { id: true, name: true },
              });
              break;
            case 'snapshot':
              entityDetails = await prisma.snapshot.findUnique({
                where: { id: activity.entityId },
                select: { id: true, name: true },
              });
              break;
          }
        } catch (error) {
          // Entity might have been deleted, that's ok
          console.warn(`Could not fetch entity details for ${activity.entityType}:${activity.entityId}`);
        }

        return {
          ...activity,
          entityDetails,
        };
      })
    );

    return NextResponse.json({
      activities: enrichedActivities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + activities.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity log' },
      { status: 500 }
    );
  }
}
