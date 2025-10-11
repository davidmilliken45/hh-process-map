import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/metrics/[id] - Update a metric
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

    // Check if metric exists
    const existing = await prisma.metric.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Metric not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, target, current, unit, order } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (target !== undefined) updateData.target = target;
    if (current !== undefined) updateData.current = current;
    if (unit !== undefined) updateData.unit = unit;
    if (order !== undefined) updateData.order = order;

    const metric = await prisma.metric.update({
      where: { id: params.id },
      data: updateData,
      include: {
        component: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'updated',
        entityType: 'metric',
        entityId: metric.id,
        changes: updateData,
      },
    });

    return NextResponse.json(metric);
  } catch (error) {
    console.error('Error updating metric:', error);
    return NextResponse.json(
      { error: 'Failed to update metric' },
      { status: 500 }
    );
  }
}

// DELETE /api/metrics/[id] - Delete a metric
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

    // Check if metric exists
    const existing = await prisma.metric.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Metric not found' },
        { status: 404 }
      );
    }

    await prisma.metric.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'deleted',
        entityType: 'metric',
        entityId: params.id,
        changes: {
          name: existing.name,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting metric:', error);
    return NextResponse.json(
      { error: 'Failed to delete metric' },
      { status: 500 }
    );
  }
}
