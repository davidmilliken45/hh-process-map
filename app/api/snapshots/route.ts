import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/snapshots - Get all snapshots
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshots = await prisma.snapshot.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        createdById: true,
        // Don't include full data in list view to save bandwidth
      },
    });

    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    );
  }
}

// POST /api/snapshots - Create a new snapshot with full component data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - Only ADMIN and MANAGER can create snapshots
    if (session.user.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // Fetch the entire process map state
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
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Create the snapshot with the full state
    const snapshot = await prisma.snapshot.create({
      data: {
        name,
        createdById: session.user.id,
        data: sections as any, // Store the entire state as JSON
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'created',
        entityType: 'snapshot',
        entityId: snapshot.id,
        changes: {
          name,
          componentCount: sections.reduce(
            (acc, section) => acc + section.components.length,
            0
          ),
        },
      },
    });

    return NextResponse.json(
      {
        id: snapshot.id,
        name: snapshot.name,
        createdAt: snapshot.createdAt,
        createdById: snapshot.createdById,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to create snapshot' },
      { status: 500 }
    );
  }
}
