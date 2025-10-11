import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/components/[id] - Get a single component by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const component = await prisma.component.findUnique({
      where: { id: params.id },
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
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        issues: {
          include: {
            reportedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        ideas: {
          include: {
            submittedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { votes: 'desc' },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        connectionsFrom: {
          include: {
            toComponent: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        connectionsTo: {
          include: {
            fromComponent: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(component);
  } catch (error) {
    console.error('Error fetching component:', error);
    return NextResponse.json(
      { error: 'Failed to fetch component' },
      { status: 500 }
    );
  }
}

// PATCH /api/components/[id] - Update a component
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - VIEWER can't modify
    if (session.user.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if component exists
    const existing = await prisma.component.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
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

    // If updating section, verify it exists
    if (sectionId && sectionId !== existing.sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: sectionId },
      });
      if (!section) {
        return NextResponse.json(
          { error: 'Section not found' },
          { status: 404 }
        );
      }
    }

    // If updating owner, verify they exist
    if (ownerId && ownerId !== existing.ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });
      if (!owner) {
        return NextResponse.json(
          { error: 'Owner not found' },
          { status: 404 }
        );
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (sectionId !== undefined) updateData.sectionId = sectionId;
    if (ownerId !== undefined) updateData.ownerId = ownerId;
    if (tool !== undefined) updateData.tool = tool;
    if (healthStatus !== undefined) updateData.healthStatus = healthStatus;
    if (currentState !== undefined) updateData.currentState = currentState;
    if (targetState !== undefined) updateData.targetState = targetState;
    if (positionX !== undefined) updateData.positionX = positionX;
    if (positionY !== undefined) updateData.positionY = positionY;

    const component = await prisma.component.update({
      where: { id: params.id },
      data: updateData,
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
        action: 'updated',
        entityType: 'component',
        entityId: component.id,
        changes: updateData,
      },
    });

    return NextResponse.json(component);
  } catch (error) {
    console.error('Error updating component:', error);
    return NextResponse.json(
      { error: 'Failed to update component' },
      { status: 500 }
    );
  }
}

// DELETE /api/components/[id] - Delete a component
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - Only ADMIN and MANAGER can delete
    if (session.user.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if component exists
    const existing = await prisma.component.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    await prisma.component.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'deleted',
        entityType: 'component',
        entityId: params.id,
        changes: {
          title: existing.title,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting component:', error);
    return NextResponse.json(
      { error: 'Failed to delete component' },
      { status: 500 }
    );
  }
}
