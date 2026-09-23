export const deckPrompts = {
  'executive-command-center': `Build an interactive HTML Executive Command Center that shows what requires my attention today and this week.
Use my calendar, recent emails, Teams conversations, meeting transcripts, and priority documents from [Priority Folder]. Focus on decisions, commitments, risks, and workstreams where my involvement could change the outcome.
At the top, show:
One or two urgent items requiring action
Today’s most important meeting or priority
My busiest day this week
Remaining working days this week
Organize the command center into three views:
Meetings: Key meetings, preparation needed, conflicts, and follow-ups
Priorities: Active commitments, approaching deadlines, blockers, and decisions waiting on me
Org pulse: Workstreams receiving significant attention, areas with limited recent activity, and important commitments that may have gone quiet
For each recommended action, label it: Lean in, Delegate, Re-engage, or Protect time.
Explain the signal behind the recommendation and give me one clear next action. Keep recommendations focused on workstreams, decisions, and commitments rather than evaluating individual people. Make the dashboard executive-ready and easy to scan, with expandable sections, traffic-light indicators, and links to the supporting emails, meetings, chats, and files. The most important content should answer: What needs my attention, and what should I do differently today?
After I approve the output, use the approved tenant process to create or update the Executive Command Center skill, and schedule it to run every weekday at [time] using the latest available context.
Create the review-ready package, cite or name the sources used, and flag missing inputs and assumptions.`,
  'customer-meeting-prep': `I have a customer meeting with [Customer Name] on [Date] at [Time]. I need help with both meeting prep and post-meeting follow-up.
Meeting prep:
Help me prep for the meeting with [Customer]. Pull the account history, open opportunities, and recent activity from Dynamics 365 Sales, and cross-reference my recent emails and meetings so I know what’s changed.
Give me a tight brief in, including: Where the relationship stands, what’s open, and the two or three things I should walk in ready to address. Share the brief with all internal coworkers on the meeting invite.
Meeting follow up:
Create a scheduled task at [Time] after the meeting. Use the meeting transcript to do the following:
Summarize my meeting with [Customer] that just ended. Pull out: (1) key decisions made, (2) action items with owners and due dates, and (3) any risks, blockers, or open questions mentioned.
Draft a follow-up email to all attendees with the summary, decisions, action items, and next steps.
Draft an internal account-team update with the customer status, findings, open items, proposal updates, and any asks for the account team.
Write any customer-facing draft in my voice - use my writing-style skill or profile if I have one, otherwise match my recent sent email to that customer. Keep it to the shortest version that does the job. Show me the prep brief, the meeting summary, and both draft emails before anything is sent, shared, or scheduled - including the brief to internal coworkers. Cite the sources you used and flag any missing inputs or assumptions.`,
  'campaign-asset-production': `I’m turning a campaign brief for [Campaign Name] into the full asset package and need one workflow across drafting, review, and publishing.
Read the brief:
Use the campaign brief, the asset library, brand and legal review materials, the publishing system or CMS, the project tracker, and relevant SharePoint, OneDrive, Teams, or Outlook context.
List the assets required, their purpose, and what already exists versus what still needs to be created.
Drive production:
Track each asset through drafting, review, and final approval.
Flag blockers, missing inputs, and version issues before they slow the launch.
Prepare draft review notes or routing messages for the owners who need to weigh in.
Publish when ready:
Create the review-ready package and the publish queue, but hold all final publishing, sends, and writebacks for my approval.`,
  'case-intake-brief': `I need a complete intake brief for case #[Case ID] before I start working it.
Pull the case context:
Use the case system, CRM customer profile, entitlement and SLA data, prior cases, knowledge base material, Outlook and Teams context, call transcripts, and product telemetry where available.
Summarize who the customer is, what they are entitled to, what has already happened, and what changed most recently.
Surface related cases, known product signals, and any prior commitments we already made.
Set me up to act:
Tell me the likely blocker, the immediate next step, and any risk to the SLA or customer relationship.
Call out any missing information I should get before I respond.
Deliverable:
Give me a clear intake brief I can work from immediately, and hold any outbound replies or writebacks for my review.`,
  'close-variance-narrative': `I’m building the close package for [Period] and need the material variances explained in a leadership-ready narrative.
Pull the close data:
Use the ERP or general ledger, consolidation system, Excel close workbooks, prior close packages, Power BI or Fabric, and any commentary in Teams, Outlook, SharePoint, or OneDrive.
Identify the biggest swings versus plan, forecast, and prior period where relevant.
Bring together the financial data and the commentary already sitting in different places.
Explain the variances:
Summarize the likely driver behind each material swing and note where support is still incomplete.
Flag the exceptions or unresolved items that leadership should know before review.
Package it:
Draft the close narrative and supporting review list, and hold any distribution or writebacks for my review.`,
} as const;
