import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/metrics - Get all metrics with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const componentId = searchParams.get('componentId');

    const where: any = {};
    if (componentId) where.componentId = componentId;

    const metrics = await prisma.metric.findMany({
      where,
      include: {
        component: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [
        { componentId: 'asc' },
        { order: 'asc' },
      ],
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// POST /api/metrics - Create a new metric
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
    const { componentId, name, target, current, unit, order } = body;

    // Validate required fields
    if (!componentId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: componentId, name' },
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

    // If order is not provided, get the next order number for this component
    let metricOrder = order;
    if (metricOrder === undefined) {
      const lastMetric = await prisma.metric.findFirst({
        where: { componentId },
        orderBy: { order: 'desc' },
      });
      metricOrder = lastMetric ? lastMetric.order + 1 : 0;
    }

    const metric = await prisma.metric.create({
      data: {
        componentId,
        name,
        target,
        current,
        unit,
        order: metricOrder,
      },
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
        action: 'created',
        entityType: 'metric',
        entityId: metric.id,
        changes: {
          name,
          componentId,
        },
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}
