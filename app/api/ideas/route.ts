import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/ideas - Get all ideas with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const componentId = searchParams.get('componentId');
    const implemented = searchParams.get('implemented');

    const where: any = {};
    if (componentId) where.componentId = componentId;
    if (implemented !== null) where.implemented = implemented === 'true';

    const ideas = await prisma.idea.findMany({
      where,
      include: {
        component: {
          select: {
            id: true,
            title: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { implemented: 'asc' },
        { votes: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}

// POST /api/ideas - Create a new idea
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
    const { componentId, title, description } = body;

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

    const idea = await prisma.idea.create({
      data: {
        componentId,
        title,
        description,
        submittedById: session.user.id,
        votes: 0,
        implemented: false,
      },
      include: {
        component: {
          select: {
            id: true,
            title: true,
          },
        },
        submittedBy: {
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
        entityType: 'idea',
        entityId: idea.id,
        changes: {
          title,
          componentId,
        },
      },
    });

    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}
