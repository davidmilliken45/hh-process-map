import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/ideas/[id] - Update an idea (including votes and implemented status)
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

    // Check if idea exists
    const existing = await prisma.idea.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, votes, implemented } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (votes !== undefined) {
      // Validate votes is a number
      if (typeof votes !== 'number' || votes < 0) {
        return NextResponse.json(
          { error: 'Votes must be a non-negative number' },
          { status: 400 }
        );
      }
      updateData.votes = votes;
    }
    if (implemented !== undefined) updateData.implemented = implemented;

    const idea = await prisma.idea.update({
      where: { id: params.id },
      data: updateData,
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

    // Log activity with special handling for implemented status
    const action = implemented !== undefined && implemented !== existing.implemented
      ? (implemented ? 'marked_implemented' : 'marked_not_implemented')
      : 'updated';

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action,
        entityType: 'idea',
        entityId: idea.id,
        changes: updateData,
      },
    });

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Error updating idea:', error);
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    );
  }
}

// DELETE /api/ideas/[id] - Delete an idea
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

    // Check if idea exists
    const existing = await prisma.idea.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    await prisma.idea.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'deleted',
        entityType: 'idea',
        entityId: params.id,
        changes: {
          title: existing.title,
          votes: existing.votes,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting idea:', error);
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    );
  }
}
