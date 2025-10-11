import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { HealthStatus } from '@prisma/client';

// GET /api/components - Get all components with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');
    const healthStatus = searchParams.get('healthStatus') as HealthStatus | null;

    const where: any = {};
    if (sectionId) where.sectionId = sectionId;
    if (healthStatus) where.healthStatus = healthStatus;

    const components = await prisma.component.findMany({
      where,
      include: {
        section: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        metrics: {
          orderBy: { order: 'asc' },
        },
        todos: {
          where: { completed: false },
          orderBy: { createdAt: 'desc' },
        },
        issues: {
          where: { status: { not: 'RESOLVED' } },
          orderBy: { priority: 'asc' },
        },
        ideas: {
          orderBy: { votes: 'desc' },
        },
        _count: {
          select: {
            todos: true,
            issues: true,
            ideas: true,
            comments: true,
          },
        },
      },
      orderBy: [
        { section: { order: 'asc' } },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json(components);
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}

// POST /api/components - Create a new component
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
    const {
      title,
      sectionId,
      ownerId,
      tool,
      healthStatus,
      currentState,
      targetState,
      positionX,
      positionY,
    } = body;

    // Validate required fields
    if (!title || !sectionId || !ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, sectionId, ownerId' },
        { status: 400 }
      );
    }

    // Verify section exists
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
    });
    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    // Verify owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });
    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    const component = await prisma.component.create({
      data: {
        title,
        sectionId,
        ownerId,
        tool,
        healthStatus: healthStatus || 'GRAY',
        currentState,
        targetState,
        positionX,
        positionY,
      },
      include: {
        section: true,
        owner: {
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
        entityType: 'component',
        entityId: component.id,
        changes: {
          title,
          sectionId,
          ownerId,
        },
      },
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error('Error creating component:', error);
    return NextResponse.json(
      { error: 'Failed to create component' },
      { status: 500 }
    );
  }
}
