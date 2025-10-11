import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/issues/[id] - Update an issue (including status/priority changes)
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

    // Check if issue exists
    const existing = await prisma.issue.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, priority, status } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;

    // Handle status changes and resolution tracking
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'RESOLVED' && existing.status !== 'RESOLVED') {
        updateData.resolvedAt = new Date();
      } else if (status !== 'RESOLVED' && existing.status === 'RESOLVED') {
        updateData.resolvedAt = null;
      }
    }

    const issue = await prisma.issue.update({
      where: { id: params.id },
      data: updateData,
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

    // Log activity with more detail for status changes
    const action = status !== undefined && status !== existing.status
      ? 'status_changed'
      : 'updated';

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action,
        entityType: 'issue',
        entityId: issue.id,
        changes: {
          ...updateData,
          ...(action === 'status_changed' && {
            oldStatus: existing.status,
            newStatus: status,
          }),
        },
      },
    });

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}

// DELETE /api/issues/[id] - Delete an issue
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - VIEWER can't delete
    if (session.user.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if issue exists
    const existing = await prisma.issue.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    await prisma.issue.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'deleted',
        entityType: 'issue',
        entityId: params.id,
        changes: {
          title: existing.title,
          priority: existing.priority,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting issue:', error);
    return NextResponse.json(
      { error: 'Failed to delete issue' },
      { status: 500 }
    );
  }
}
