import { Prisma } from '@prisma/client';

/**
 * Type Definitions for Process Map Application
 * Based on Prisma schema with commonly used includes
 */

// =====================
// COMPONENT TYPES
// =====================

/**
 * Component with all related data (full include)
 */
export type ComponentWithRelations = Prisma.ComponentGetPayload<{
  include: {
    section: true;
    owner: {
      select: {
        id: true;
        name: true;
        email: true;
        role: true;
        image: true;
      };
    };
    metrics: true;
    todos: {
      include: {
        assignee: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
    issues: {
      include: {
        reportedBy: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
    ideas: {
      include: {
        submittedBy: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
    comments: {
      include: {
        author: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
    connectionsFrom: {
      include: {
        toComponent: {
          select: {
            id: true;
            title: true;
            healthStatus: true;
          };
        };
      };
    };
    connectionsTo: {
      include: {
        fromComponent: {
          select: {
            id: true;
            title: true;
            healthStatus: true;
          };
        };
      };
    };
  };
}>;

/**
 * Component with basic section and owner info
 */
export type ComponentWithBasics = Prisma.ComponentGetPayload<{
  include: {
    section: true;
    owner: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

/**
 * Component with metrics for health calculation
 */
export type ComponentWithMetrics = Prisma.ComponentGetPayload<{
  include: {
    metrics: true;
  };
}>;

/**
 * Component with counts (for dashboard/list views)
 */
export type ComponentWithCounts = Prisma.ComponentGetPayload<{
  include: {
    section: true;
    owner: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    _count: {
      select: {
        metrics: true;
        todos: true;
        issues: true;
        ideas: true;
        comments: true;
      };
    };
  };
}>;

// =====================
// USER TYPES
// =====================

/**
 * User without password (for API responses)
 */
export type SafeUser = Omit<Prisma.UserGetPayload<{}>, 'password'>;

/**
 * User with component ownership counts
 */
export type UserWithCounts = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: {
        ownedComponents: true;
        todos: true;
        issues: true;
        ideas: true;
      };
    };
  };
}>;

// =====================
// TODO TYPES
// =====================

/**
 * Todo with assignee information
 */
export type TodoWithAssignee = Prisma.TodoGetPayload<{
  include: {
    assignee: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
  };
}>;

/**
 * Todo with component and assignee
 */
export type TodoWithRelations = Prisma.TodoGetPayload<{
  include: {
    component: {
      select: {
        id: true;
        title: true;
        healthStatus: true;
      };
    };
    assignee: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
  };
}>;

// =====================
// ISSUE TYPES
// =====================

/**
 * Issue with reporter information
 */
export type IssueWithReporter = Prisma.IssueGetPayload<{
  include: {
    reportedBy: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
  };
}>;

/**
 * Issue with component and reporter
 */
export type IssueWithRelations = Prisma.IssueGetPayload<{
  include: {
    component: {
      select: {
        id: true;
        title: true;
        healthStatus: true;
      };
    };
    reportedBy: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
  };
}>;

// =====================
// IDEA TYPES
// =====================

/**
 * Idea with submitter information
 */
export type IdeaWithSubmitter = Prisma.IdeaGetPayload<{
  include: {
    submittedBy: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
  };
}>;

/**
 * Idea with component and submitter
 */
export type IdeaWithRelations = Prisma.IdeaGetPayload<{
  include: {
    component: {
      select: {
        id: true;
        title: true;
        healthStatus: true;
      };
    };
    submittedBy: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
  };
}>;

// =====================
// SECTION TYPES
// =====================

/**
 * Section with components
 */
export type SectionWithComponents = Prisma.SectionGetPayload<{
  include: {
    components: {
      include: {
        owner: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
  };
}>;

/**
 * Section with component counts
 */
export type SectionWithCounts = Prisma.SectionGetPayload<{
  include: {
    _count: {
      select: {
        components: true;
      };
    };
  };
}>;

// =====================
// ACTIVITY LOG TYPES
// =====================

/**
 * Activity log with user information
 */
export type ActivityLogWithUser = Prisma.ActivityLogGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
  };
}>;

// =====================
// CONNECTION TYPES
// =====================

/**
 * Connection with both components
 */
export type ConnectionWithComponents = Prisma.ConnectionGetPayload<{
  include: {
    fromComponent: {
      select: {
        id: true;
        title: true;
        healthStatus: true;
      };
    };
    toComponent: {
      select: {
        id: true;
        title: true;
        healthStatus: true;
      };
    };
  };
}>;

// =====================
// COMMENT TYPES
// =====================

/**
 * Comment with author information
 */
export type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
  };
}>;

// =====================
// DASHBOARD TYPES
// =====================

/**
 * Dashboard statistics type
 */
export type DashboardStats = {
  overallHealth: number;
  totalComponents: number;
  componentsByHealth: {
    GREEN: number;
    YELLOW: number;
    RED: number;
    GRAY: number;
    BLUE: number;
  };
  activeTodos: number;
  openIssues: number;
  pendingIdeas: number;
  recentActivity: ActivityLogWithUser[];
};

/**
 * Component health summary for dashboard
 */
export type HealthSummary = {
  status: string;
  count: number;
  percentage: number;
};
