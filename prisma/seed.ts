import { PrismaClient, HealthStatus, Priority, IssueStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // =====================
  // CREATE USERS
  // =====================

  const davidPassword = await bcrypt.hash('password123', 10);
  const david = await prisma.user.upsert({
    where: { email: 'david@horizonhomes.com' },
    update: {},
    create: {
      email: 'david@horizonhomes.com',
      name: 'David Milliken',
      password: davidPassword,
      role: 'ADMIN'
    }
  });

  const kristiePassword = await bcrypt.hash('password123', 10);
  const kristie = await prisma.user.upsert({
    where: { email: 'kristie@horizonhomes.com' },
    update: {},
    create: {
      email: 'kristie@horizonhomes.com',
      name: 'Kristie',
      password: kristiePassword,
      role: 'MANAGER'
    }
  });

  const codyPassword = await bcrypt.hash('password123', 10);
  const cody = await prisma.user.upsert({
    where: { email: 'cody@horizonhomes.com' },
    update: {},
    create: {
      email: 'cody@horizonhomes.com',
      name: 'Cody',
      password: codyPassword,
      role: 'MANAGER'
    }
  });

  console.log('✓ Users created');

  // =====================
  // CREATE SECTIONS
  // =====================

  const leadGenSection = await prisma.section.upsert({
    where: { order: 1 },
    update: {},
    create: {
      name: 'Lead Generation',
      order: 1,
      color: '#3B82F6',
      description: 'Initial customer contact and qualification'
    }
  });

  const salesSection = await prisma.section.upsert({
    where: { order: 2 },
    update: {},
    create: {
      name: 'Sales & Estimation',
      order: 2,
      color: '#10B981',
      description: 'Consultation, estimation, and closing'
    }
  });

  const productionSection = await prisma.section.upsert({
    where: { order: 3 },
    update: {},
    create: {
      name: 'Production & Installation',
      order: 3,
      color: '#F59E0B',
      description: 'Scheduling, preparation, and installation'
    }
  });

  const postInstallSection = await prisma.section.upsert({
    where: { order: 4 },
    update: {},
    create: {
      name: 'Post-Install & Service',
      order: 4,
      color: '#8B5CF6',
      description: 'Follow-up, warranty, and ongoing relationship'
    }
  });

  console.log('✓ Sections created');

  // =====================
  // LEAD GENERATION COMPONENTS
  // =====================

  // Web Form Lead Capture - GREEN
  const webFormLead = await prisma.component.create({
    data: {
      title: 'Web Form Lead Capture',
      sectionId: leadGenSection.id,
      ownerId: kristie.id,
      tool: 'WordPress Gravity Forms → n8n',
      healthStatus: 'GREEN',
      currentState: 'Zapier → Pipedrive working well, but expensive',
      targetState: 'n8n → Twenty CRM with auto-reply and assignment',
      positionX: 100,
      positionY: 100
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: webFormLead.id,
        name: 'Monthly leads',
        target: '50',
        current: '45',
        unit: 'leads',
        order: 1
      },
      {
        componentId: webFormLead.id,
        name: 'Form completion rate',
        target: '85',
        current: '82',
        unit: '%',
        order: 2
      },
      {
        componentId: webFormLead.id,
        name: 'Time to contact',
        target: '2',
        current: '3',
        unit: 'hrs',
        order: 3
      }
    ]
  });

  await prisma.todo.createMany({
    data: [
      {
        componentId: webFormLead.id,
        title: 'Migrate from Zapier to n8n',
        assigneeId: david.id,
        completed: false
      },
      {
        componentId: webFormLead.id,
        title: 'Build auto-reply email template',
        assigneeId: david.id,
        completed: false
      },
      {
        componentId: webFormLead.id,
        title: 'Test n8n webhook integration',
        assigneeId: david.id,
        completed: false
      }
    ]
  });

  await prisma.issue.create({
    data: {
      componentId: webFormLead.id,
      title: '3-hour response time exceeds target',
      description: 'Current average response time is 3 hours vs target of 2 hours. Need to improve notification system and ensure Kristie gets immediate alerts.',
      priority: 'P2',
      status: 'OPEN',
      reportedById: kristie.id
    }
  });

  await prisma.idea.createMany({
    data: [
      {
        componentId: webFormLead.id,
        title: 'Add chatbot for instant engagement',
        description: 'Implement a chatbot on the website to engage leads immediately while they fill out the form. Could improve conversion and satisfaction.',
        submittedById: david.id,
        votes: 3
      },
      {
        componentId: webFormLead.id,
        title: 'A/B test shorter form',
        description: 'Current form might be too long. Test a shorter version with fewer fields to see if completion rate improves.',
        submittedById: kristie.id,
        votes: 2
      }
    ]
  });

  // Phone Lead - Main Line - GREEN
  const phoneMainLead = await prisma.component.create({
    data: {
      title: 'Phone Lead - Main Line',
      sectionId: leadGenSection.id,
      ownerId: kristie.id,
      tool: 'Quo/OpenPhone → n8n',
      healthStatus: 'GREEN',
      currentState: 'Voicemail → Manual entry into CRM',
      targetState: 'Quo webhook → Auto CRM entry with call recording',
      positionX: 300,
      positionY: 100
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: phoneMainLead.id,
        name: 'Monthly calls',
        target: '30',
        current: '28',
        unit: 'calls',
        order: 1
      },
      {
        componentId: phoneMainLead.id,
        name: 'Callback rate',
        target: '95',
        current: '92',
        unit: '%',
        order: 2
      },
      {
        componentId: phoneMainLead.id,
        name: 'Time to callback',
        target: '4',
        current: '5',
        unit: 'hrs',
        order: 3
      }
    ]
  });

  await prisma.todo.createMany({
    data: [
      {
        componentId: phoneMainLead.id,
        title: 'Set up Quo webhook integration',
        assigneeId: david.id,
        completed: false
      },
      {
        componentId: phoneMainLead.id,
        title: 'Create automated call logging workflow',
        assigneeId: david.id,
        completed: false
      }
    ]
  });

  // Google Ads Phone Line - RED (underperforming)
  const adPhoneLead = await prisma.component.create({
    data: {
      title: 'Google Ads Phone Line',
      sectionId: leadGenSection.id,
      ownerId: kristie.id,
      tool: 'Tracking number → n8n',
      healthStatus: 'RED',
      currentState: 'Manual tracking, poor conversion tracking',
      targetState: 'Auto-tagged in CRM with ad campaign data',
      positionX: 500,
      positionY: 100
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: adPhoneLead.id,
        name: 'Monthly calls',
        target: '15',
        current: '8',
        unit: 'calls',
        order: 1
      },
      {
        componentId: adPhoneLead.id,
        name: 'Cost per call',
        target: '45',
        current: '78',
        unit: '$',
        order: 2
      },
      {
        componentId: adPhoneLead.id,
        name: 'Conversion rate',
        target: '55',
        current: '38',
        unit: '%',
        order: 3
      }
    ]
  });

  await prisma.issue.createMany({
    data: [
      {
        componentId: adPhoneLead.id,
        title: 'Call volume down 47% month-over-month',
        description: 'Google Ads phone leads have dropped significantly. Need to review ad performance, keywords, and targeting immediately.',
        priority: 'P1',
        status: 'OPEN',
        reportedById: kristie.id
      },
      {
        componentId: adPhoneLead.id,
        title: 'Conversion rate below break-even',
        description: 'Current conversion rate of 38% vs target 55% means we are losing money on this channel. Need to improve or pause.',
        priority: 'P1',
        status: 'OPEN',
        reportedById: david.id
      },
      {
        componentId: adPhoneLead.id,
        title: 'Cost per call exceeds target by 73%',
        description: 'Paying $78 per call vs target of $45. Need to optimize ad spend or reconsider this channel.',
        priority: 'P1',
        status: 'OPEN',
        reportedById: kristie.id
      }
    ]
  });

  await prisma.idea.createMany({
    data: [
      {
        componentId: adPhoneLead.id,
        title: 'Pause Google Ads and focus on SEO',
        description: 'Given poor performance, consider pausing ads temporarily and investing in organic search instead.',
        submittedById: kristie.id,
        votes: 2
      },
      {
        componentId: adPhoneLead.id,
        title: 'A/B test different ad copy',
        description: 'Current ad copy might not be resonating. Test different messages focused on pain points.',
        submittedById: david.id,
        votes: 1
      }
    ]
  });

  // Referral Tracking - YELLOW (needs system)
  const referralTracking = await prisma.component.create({
    data: {
      title: 'Referral Tracking',
      sectionId: leadGenSection.id,
      ownerId: kristie.id,
      tool: 'Twenty CRM custom field',
      healthStatus: 'YELLOW',
      currentState: 'Manual tagging in Pipedrive, inconsistent',
      targetState: 'Dedicated workflow with thank you automation',
      positionX: 700,
      positionY: 100
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: referralTracking.id,
        name: 'Monthly referrals',
        target: '10',
        current: '6',
        unit: 'referrals',
        order: 1
      },
      {
        componentId: referralTracking.id,
        name: 'Referral conversion rate',
        target: '90',
        current: '95',
        unit: '%',
        order: 2
      },
      {
        componentId: referralTracking.id,
        name: 'Thank you note sent',
        target: '100',
        current: '40',
        unit: '%',
        order: 3
      }
    ]
  });

  await prisma.issue.create({
    data: {
      componentId: referralTracking.id,
      title: 'Only 40% of referrers receive thank you',
      description: 'Manual process means many referrers are not being thanked properly, which could hurt future referrals.',
      priority: 'P2',
      status: 'OPEN',
      reportedById: kristie.id
    }
  });

  await prisma.idea.create({
    data: {
      componentId: referralTracking.id,
      title: 'Automated referral incentive program',
      description: 'Send gift cards or discounts automatically when referral closes. Could increase referral volume.',
      submittedById: cody.id,
      votes: 4
    }
  });

  // =====================
  // SALES & ESTIMATION COMPONENTS
  // =====================

  // Lead Qualification - GREEN
  const qualificationCall = await prisma.component.create({
    data: {
      title: 'Lead Qualification',
      sectionId: salesSection.id,
      ownerId: kristie.id,
      tool: 'Twenty CRM + Phone',
      healthStatus: 'GREEN',
      currentState: 'Manual process with good results',
      targetState: 'Scripted templates with auto-logging',
      positionX: 300,
      positionY: 300
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: qualificationCall.id,
        name: 'Qualification rate',
        target: '70',
        current: '72',
        unit: '%',
        order: 1
      },
      {
        componentId: qualificationCall.id,
        name: 'Avg call duration',
        target: '15',
        current: '18',
        unit: 'min',
        order: 2
      },
      {
        componentId: qualificationCall.id,
        name: 'Follow-up booking rate',
        target: '85',
        current: '88',
        unit: '%',
        order: 3
      }
    ]
  });

  await prisma.todo.create({
    data: {
      componentId: qualificationCall.id,
      title: 'Create qualification script templates',
      description: 'Document best practices and create reusable scripts for consistent qualification.',
      assigneeId: kristie.id,
      completed: false
    }
  });

  // Initial Consultation - GREEN
  const initialConsult = await prisma.component.create({
    data: {
      title: 'Initial Consultation',
      sectionId: salesSection.id,
      ownerId: cody.id,
      tool: 'Google Calendar + CompanyCam',
      healthStatus: 'GREEN',
      currentState: 'Manual scheduling, good conversion',
      targetState: 'Cal.com booking with automated reminders',
      positionX: 500,
      positionY: 300
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: initialConsult.id,
        name: 'Consult to estimate rate',
        target: '85',
        current: '88',
        unit: '%',
        order: 1
      },
      {
        componentId: initialConsult.id,
        name: 'Avg consult duration',
        target: '60',
        current: '65',
        unit: 'min',
        order: 2
      },
      {
        componentId: initialConsult.id,
        name: 'No-show rate',
        target: '5',
        current: '8',
        unit: '%',
        order: 3
      }
    ]
  });

  await prisma.issue.create({
    data: {
      componentId: initialConsult.id,
      title: 'No-show rate higher than target',
      description: 'Currently seeing 8% no-shows vs target of 5%. Better reminders could help.',
      priority: 'P3',
      status: 'OPEN',
      reportedById: cody.id
    }
  });

  await prisma.idea.createMany({
    data: [
      {
        componentId: initialConsult.id,
        title: 'Add SMS reminders 24hrs before',
        description: 'Email reminders are good but SMS might reduce no-shows further.',
        submittedById: kristie.id,
        votes: 3
      },
      {
        componentId: initialConsult.id,
        title: 'Self-service rescheduling link',
        description: 'Let customers reschedule themselves instead of calling, could reduce no-shows.',
        submittedById: david.id,
        votes: 2
      }
    ]
  });

  // Estimate Preparation - YELLOW (needs automation)
  const estimatePrep = await prisma.component.create({
    data: {
      title: 'Estimate Preparation',
      sectionId: salesSection.id,
      ownerId: cody.id,
      tool: 'Custom Estimator App',
      healthStatus: 'YELLOW',
      currentState: 'Manual data entry, some errors',
      targetState: 'Integrated with energy audit data, auto-populated',
      positionX: 700,
      positionY: 300
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: estimatePrep.id,
        name: 'Avg time to estimate',
        target: '3',
        current: '5',
        unit: 'days',
        order: 1
      },
      {
        componentId: estimatePrep.id,
        name: 'Estimate accuracy',
        target: '95',
        current: '88',
        unit: '%',
        order: 2
      },
      {
        componentId: estimatePrep.id,
        name: 'Revision requests',
        target: '10',
        current: '18',
        unit: '%',
        order: 3
      }
    ]
  });

  await prisma.issue.createMany({
    data: [
      {
        componentId: estimatePrep.id,
        title: 'Taking too long to deliver estimates',
        description: '5 days average vs 3 day target means customers are waiting too long and may be shopping elsewhere.',
        priority: 'P2',
        status: 'OPEN',
        reportedById: cody.id
      },
      {
        componentId: estimatePrep.id,
        title: 'High revision rate indicates accuracy issues',
        description: '18% of estimates need revisions vs 10% target. Manual data entry errors likely cause.',
        priority: 'P2',
        status: 'OPEN',
        reportedById: david.id
      }
    ]
  });

  await prisma.todo.createMany({
    data: [
      {
        componentId: estimatePrep.id,
        title: 'Integrate energy audit data into estimator',
        description: 'Auto-populate estimate fields from consultation data to reduce errors and speed.',
        assigneeId: david.id,
        completed: false
      },
      {
        componentId: estimatePrep.id,
        title: 'Add data validation to prevent common errors',
        assigneeId: david.id,
        completed: false
      }
    ]
  });

  // Estimate Follow-Up - RED (broken)
  const estimateFollowup = await prisma.component.create({
    data: {
      title: 'Estimate Follow-Up',
      sectionId: salesSection.id,
      ownerId: cody.id,
      tool: 'Manual tracking',
      healthStatus: 'RED',
      currentState: 'Inconsistent follow-up, leads falling through cracks',
      targetState: 'Automated email sequence with CRM task reminders',
      positionX: 900,
      positionY: 300
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: estimateFollowup.id,
        name: 'Follow-up completion rate',
        target: '100',
        current: '45',
        unit: '%',
        order: 1
      },
      {
        componentId: estimateFollowup.id,
        name: 'Response rate to follow-ups',
        target: '40',
        current: '25',
        unit: '%',
        order: 2
      },
      {
        componentId: estimateFollowup.id,
        name: 'Time to first follow-up',
        target: '3',
        current: '7',
        unit: 'days',
        order: 3
      }
    ]
  });

  await prisma.issue.createMany({
    data: [
      {
        componentId: estimateFollowup.id,
        title: 'Only 45% of estimates getting follow-up',
        description: 'More than half of estimates are not being followed up on. Missing huge revenue opportunity.',
        priority: 'P1',
        status: 'OPEN',
        reportedById: cody.id
      },
      {
        componentId: estimateFollowup.id,
        title: 'Taking too long to follow up',
        description: '7 days vs 3 day target means customers are cold by the time we reach out.',
        priority: 'P1',
        status: 'OPEN',
        reportedById: kristie.id
      }
    ]
  });

  await prisma.todo.createMany({
    data: [
      {
        componentId: estimateFollowup.id,
        title: 'Build automated follow-up sequence in n8n',
        description: 'Day 3, 7, 14 automated emails with manual call reminders.',
        assigneeId: david.id,
        completed: false
      },
      {
        componentId: estimateFollowup.id,
        title: 'Define follow-up cadence and messaging',
        assigneeId: cody.id,
        completed: false
      }
    ]
  });

  // =====================
  // PRODUCTION & INSTALLATION COMPONENTS
  // =====================

  // Permit Management - YELLOW (manual)
  const permitManagement = await prisma.component.create({
    data: {
      title: 'Permit Management',
      sectionId: productionSection.id,
      ownerId: cody.id,
      tool: 'Manual tracking',
      healthStatus: 'YELLOW',
      currentState: 'Spreadsheet tracking, prone to delays',
      targetState: 'Twenty CRM workflow with automated reminders',
      positionX: 200,
      positionY: 500
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: permitManagement.id,
        name: 'On-time permit rate',
        target: '95',
        current: '78',
        unit: '%',
        order: 1
      },
      {
        componentId: permitManagement.id,
        name: 'Avg permit lead time',
        target: '10',
        current: '14',
        unit: 'days',
        order: 2
      },
      {
        componentId: permitManagement.id,
        name: 'Delayed installs due to permits',
        target: '5',
        current: '15',
        unit: '%',
        order: 3
      }
    ]
  });

  await prisma.issue.create({
    data: {
      componentId: permitManagement.id,
      title: '15% of installs delayed by permit issues',
      description: 'Permits not being pulled early enough causing schedule delays and customer frustration.',
      priority: 'P2',
      status: 'OPEN',
      reportedById: cody.id
    }
  });

  // Installation Scheduling - GREEN
  const installScheduling = await prisma.component.create({
    data: {
      title: 'Installation Scheduling',
      sectionId: productionSection.id,
      ownerId: cody.id,
      tool: 'Google Calendar',
      healthStatus: 'GREEN',
      currentState: 'Manual coordination, works but time-consuming',
      targetState: 'Cal.com with crew availability and customer booking',
      positionX: 400,
      positionY: 500
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: installScheduling.id,
        name: 'Schedule adherence',
        target: '90',
        current: '85',
        unit: '%',
        order: 1
      },
      {
        componentId: installScheduling.id,
        name: 'Avg lead time',
        target: '28',
        current: '35',
        unit: 'days',
        order: 2
      },
      {
        componentId: installScheduling.id,
        name: 'Reschedule rate',
        target: '10',
        current: '12',
        unit: '%',
        order: 3
      }
    ]
  });

  await prisma.todo.create({
    data: {
      componentId: installScheduling.id,
      title: 'Research Cal.com for crew scheduling',
      assigneeId: david.id,
      completed: false
    }
  });

  // Installation Execution - GREEN
  const installExecution = await prisma.component.create({
    data: {
      title: 'Installation Execution',
      sectionId: productionSection.id,
      ownerId: cody.id,
      tool: 'CompanyCam + Manual',
      healthStatus: 'GREEN',
      currentState: 'Good quality, photos captured',
      targetState: 'Digital checklists and progress updates',
      positionX: 600,
      positionY: 500
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: installExecution.id,
        name: 'Customer satisfaction',
        target: '4.5',
        current: '4.7',
        unit: '/5',
        order: 1
      },
      {
        componentId: installExecution.id,
        name: 'On-time completion',
        target: '90',
        current: '88',
        unit: '%',
        order: 2
      },
      {
        componentId: installExecution.id,
        name: 'Callbacks within 30 days',
        target: '5',
        current: '4',
        unit: '%',
        order: 3
      }
    ]
  });

  // Equipment Ordering - YELLOW
  const equipmentOrdering = await prisma.component.create({
    data: {
      title: 'Equipment Ordering',
      sectionId: productionSection.id,
      ownerId: cody.id,
      tool: 'Manual tracking',
      healthStatus: 'YELLOW',
      currentState: 'Email orders, manual tracking',
      targetState: 'Integrated ordering system with delivery tracking',
      positionX: 800,
      positionY: 500
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: equipmentOrdering.id,
        name: 'On-time delivery',
        target: '95',
        current: '82',
        unit: '%',
        order: 1
      },
      {
        componentId: equipmentOrdering.id,
        name: 'Order errors',
        target: '2',
        current: '8',
        unit: '%',
        order: 2
      }
    ]
  });

  // =====================
  // POST-INSTALL & SERVICE COMPONENTS
  // =====================

  // Customer Follow-Up - YELLOW
  const customerFollowup = await prisma.component.create({
    data: {
      title: 'Customer Follow-Up',
      sectionId: postInstallSection.id,
      ownerId: kristie.id,
      tool: 'Manual outreach',
      healthStatus: 'YELLOW',
      currentState: 'Inconsistent, manual',
      targetState: 'Automated satisfaction survey and thank you sequence',
      positionX: 200,
      positionY: 700
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: customerFollowup.id,
        name: 'Follow-up completion rate',
        target: '100',
        current: '65',
        unit: '%',
        order: 1
      },
      {
        componentId: customerFollowup.id,
        name: 'Survey response rate',
        target: '50',
        current: '30',
        unit: '%',
        order: 2
      },
      {
        componentId: customerFollowup.id,
        name: 'Review requests sent',
        target: '100',
        current: '40',
        unit: '%',
        order: 3
      }
    ]
  });

  // Warranty Registration - RED (critical gap)
  const warrantyRegistration = await prisma.component.create({
    data: {
      title: 'Warranty Registration',
      sectionId: postInstallSection.id,
      ownerId: cody.id,
      tool: 'Manual web forms',
      healthStatus: 'RED',
      currentState: 'Manual entry, often missed',
      targetState: 'Playwright automation for manufacturer websites',
      positionX: 400,
      positionY: 700
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        componentId: warrantyRegistration.id,
        name: 'Registration completion rate',
        target: '100',
        current: '55',
        unit: '%',
        order: 1
      },
      {
        componentId: warrantyRegistration.id,
        name: 'Avg time to register',
        target: '7',
        current: '21',
        unit: 'days',
        order: 2
      }
    ]
  });

  await prisma.issue.createMany({
    data: [
      {
        componentId: warrantyRegistration.id,
        title: '45% of warranties not registered',
        description: 'Critical customer protection gap. Could lead to denied warranty claims and angry customers.',
        priority: 'P1',
        status: 'OPEN',
        reportedById: cody.id
      },
      {
        componentId: warrantyRegistration.id,
        title: 'Taking 3x longer than target',
        description: 'Manual web form entry is time-consuming and error-prone. Need automation urgently.',
        priority: 'P1',
        status: 'OPEN',
        reportedById: david.id
      }
    ]
  });

  await prisma.todo.create({
    data: {
      componentId: warrantyRegistration.id,
      title: 'Build Playwright automation for Mitsubishi registration',
      description: 'Start with most common manufacturer and expand from there.',
      assigneeId: david.id,
      completed: false
    }
  });

  // Service Request Management - GRAY (undefined)
  const serviceRequests = await prisma.component.create({
    data: {
      title: 'Service Request Management',
      sectionId: postInstallSection.id,
      ownerId: cody.id,
      tool: 'TBD',
      healthStatus: 'GRAY',
      currentState: 'Process not yet defined',
      targetState: 'Dedicated service workflow in Twenty CRM',
      positionX: 600,
      positionY: 700
    }
  });

  await prisma.todo.createMany({
    data: [
      {
        componentId: serviceRequests.id,
        title: 'Define service request intake process',
        assigneeId: cody.id,
        completed: false
      },
      {
        componentId: serviceRequests.id,
        title: 'Determine warranty vs paid service workflow',
        assigneeId: cody.id,
        completed: false
      },
      {
        componentId: serviceRequests.id,
        title: 'Set service response time standards',
        assigneeId: cody.id,
        completed: false
      }
    ]
  });

  // Ongoing Relationship - BLUE (planned)
  const ongoingRelationship = await prisma.component.create({
    data: {
      title: 'Ongoing Relationship',
      sectionId: postInstallSection.id,
      ownerId: kristie.id,
      tool: 'n8n + Resend',
      healthStatus: 'BLUE',
      currentState: 'Not yet implemented',
      targetState: 'Automated seasonal check-ins and educational content',
      positionX: 800,
      positionY: 700
    }
  });

  await prisma.idea.createMany({
    data: [
      {
        componentId: ongoingRelationship.id,
        title: 'Seasonal maintenance reminder emails',
        description: 'Send automated reminders before heating/cooling seasons to book maintenance.',
        submittedById: kristie.id,
        votes: 5
      },
      {
        componentId: ongoingRelationship.id,
        title: 'Educational content series',
        description: 'Send tips on energy efficiency, system care, etc. to stay top of mind.',
        submittedById: david.id,
        votes: 3
      },
      {
        componentId: ongoingRelationship.id,
        title: 'Annual energy report for customers',
        description: 'Show savings and system performance annually to reinforce value.',
        submittedById: cody.id,
        votes: 4
      }
    ]
  });

  console.log('✓ Components created');

  // =====================
  // CREATE CONNECTIONS
  // =====================

  await prisma.connection.createMany({
    data: [
      // Lead sources to qualification
      {
        fromComponentId: webFormLead.id,
        toComponentId: qualificationCall.id,
        label: 'Lead data + form responses'
      },
      {
        fromComponentId: phoneMainLead.id,
        toComponentId: qualificationCall.id,
        label: 'Call log + voicemail'
      },
      {
        fromComponentId: adPhoneLead.id,
        toComponentId: qualificationCall.id,
        label: 'Call log + ad source tag'
      },
      {
        fromComponentId: referralTracking.id,
        toComponentId: qualificationCall.id,
        label: 'Referral info + referrer name'
      },
      // Qualification to consultation
      {
        fromComponentId: qualificationCall.id,
        toComponentId: initialConsult.id,
        label: 'Qualified lead + home info'
      },
      // Consultation to estimate
      {
        fromComponentId: initialConsult.id,
        toComponentId: estimatePrep.id,
        label: 'Walkthrough notes + photos'
      },
      // Estimate to follow-up
      {
        fromComponentId: estimatePrep.id,
        toComponentId: estimateFollowup.id,
        label: 'Estimate delivered trigger'
      },
      // Follow-up to production (when won)
      {
        fromComponentId: estimateFollowup.id,
        toComponentId: permitManagement.id,
        label: 'Won deal + project scope'
      },
      {
        fromComponentId: estimateFollowup.id,
        toComponentId: equipmentOrdering.id,
        label: 'Won deal + equipment list'
      },
      // Production flow
      {
        fromComponentId: permitManagement.id,
        toComponentId: installScheduling.id,
        label: 'Permit approved'
      },
      {
        fromComponentId: equipmentOrdering.id,
        toComponentId: installScheduling.id,
        label: 'Equipment delivery date'
      },
      {
        fromComponentId: installScheduling.id,
        toComponentId: installExecution.id,
        label: 'Scheduled date + crew assignment'
      },
      // Post-install
      {
        fromComponentId: installExecution.id,
        toComponentId: customerFollowup.id,
        label: 'Install complete + photos'
      },
      {
        fromComponentId: installExecution.id,
        toComponentId: warrantyRegistration.id,
        label: 'Equipment serial numbers'
      },
      {
        fromComponentId: customerFollowup.id,
        toComponentId: ongoingRelationship.id,
        label: 'Add to maintenance list'
      }
    ]
  });

  console.log('✓ Connections created');

  // =====================
  // ADD SOME COMMENTS
  // =====================

  await prisma.comment.createMany({
    data: [
      {
        componentId: adPhoneLead.id,
        authorId: kristie.id,
        content: 'We need to address this ASAP. Losing money on every ad call is not sustainable. Can we review the ad campaigns this week?'
      },
      {
        componentId: estimateFollowup.id,
        authorId: cody.id,
        content: 'I know the follow-up rate is bad. I just don\'t have time to track everything manually. Really need that automation David mentioned.'
      },
      {
        componentId: warrantyRegistration.id,
        authorId: cody.id,
        content: 'Had a customer call today asking about their warranty. Wasn\'t registered. Very embarrassing. This needs to be fixed.'
      },
      {
        componentId: webFormLead.id,
        authorId: david.id,
        content: 'Good news - the n8n migration is almost ready to test. Should have this automated by end of month.'
      }
    ]
  });

  console.log('✓ Comments added');

  // =====================
  // CREATE INITIAL SNAPSHOT
  // =====================

  const allComponents = await prisma.component.findMany({
    include: {
      section: true,
      owner: true,
      metrics: true,
      todos: true,
      issues: true,
      ideas: true,
      comments: true,
      connectionsFrom: true,
      connectionsTo: true
    }
  });

  await prisma.snapshot.create({
    data: {
      name: 'Initial Snapshot - Oct 10, 2025',
      data: allComponents,
      createdById: david.id
    }
  });

  console.log('✓ Initial snapshot created');
  console.log('\n=================================');
  console.log('Seed completed successfully!');
  console.log('=================================');
  console.log('\nCreated:');
  console.log('- 3 users (David, Kristie, Cody)');
  console.log('- 4 sections');
  console.log('- 20 components with varied health statuses');
  console.log('- Multiple metrics, todos, issues, and ideas');
  console.log('- Connections showing data flow');
  console.log('- Comments and activity');
  console.log('- 1 initial snapshot');
  console.log('\nLogin credentials:');
  console.log('- david@horizonhomes.com / password123 (ADMIN)');
  console.log('- kristie@horizonhomes.com / password123 (MANAGER)');
  console.log('- cody@horizonhomes.com / password123 (MANAGER)');
  console.log('=================================\n');
}

main()
  .catch((e) => {
    console.error('Error during seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
