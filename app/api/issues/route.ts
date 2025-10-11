import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { IssueStatus, Priority } from '@prisma/client';

// GET /api/issues - Get all issues with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const componentId = searchParams.get('componentId');
    const status = searchParams.get('status') as IssueStatus | null;
    const priority = searchParams.get('priority') as Priority | null;

    const where: any = {};
    if (componentId) where.componentId = componentId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const issues = await prisma.issue.findMany({
      where,
      include: {
        component: {
          select: {
            id: true,
            title: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

// POST /api/issues - Create a new issue
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - VIEWER can't create
    if (session.user.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { componentId, title, description, priority, status } = body;

    // Validate required fields
    if (!componentId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: componentId, title' },
        { status: 400 }
      );
    }

    // Verify component exists
    const component = await prisma.component.findUnique({
      where: { id: componentId },
    });
    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    const issue = await prisma.issue.create({
      data: {
        componentId,
        title,
        description,
        priority: priority || 'P2',
        status: status || 'OPEN',
        reportedById: session.user.id,
      },
      include: {
        component: {
          select: {
            id: true,
            title: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'created',
        entityType: 'issue',
        entityId: issue.id,
        changes: {
          title,
          componentId,
          priority: issue.priority,
        },
      },
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}
