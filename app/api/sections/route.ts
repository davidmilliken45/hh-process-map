import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/sections - Get all sections
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sections = await prisma.section.findMany({
      include: {
        components: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
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
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST /api/sections - Create a new section
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - Only ADMIN and MANAGER can create sections
    if (session.user.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, color, description, order } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // If order is not provided, get the next order number
    let sectionOrder = order;
    if (sectionOrder === undefined) {
      const lastSection = await prisma.section.findFirst({
        orderBy: { order: 'desc' },
      });
      sectionOrder = lastSection ? lastSection.order + 1 : 0;
    }

    // Check if order is already taken
    const existingSection = await prisma.section.findUnique({
      where: { order: sectionOrder },
    });

    if (existingSection) {
      return NextResponse.json(
        { error: `Section with order ${sectionOrder} already exists` },
        { status: 400 }
      );
    }

    const section = await prisma.section.create({
      data: {
        name,
        color,
        description,
        order: sectionOrder,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'created',
        entityType: 'section',
        entityId: section.id,
        changes: {
          name,
          order: sectionOrder,
        },
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}
