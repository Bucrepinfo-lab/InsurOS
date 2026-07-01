export type WorkflowStatus =
  | 'Draft'
  | 'Submitted'
  | 'In Review'
  | 'Approved'
  | 'Rejected'
  | 'Escalated'
  | 'Closed';

export type WorkflowPriority = 'Low' | 'Normal' | 'High' | 'Critical';

export interface WorkflowInstance {
  id: string;
  reference: string;
  name: string;
  module: 'Marketplace' | 'Customers' | 'Policies' | 'Claims' | 'Finance';
  status: WorkflowStatus;
  priority: WorkflowPriority;
  assignee: string;
  dueAt: string;
}

export type WorkflowTaskStatus =
  | 'Open'
  | 'In Progress'
  | 'Blocked'
  | 'Completed'
  | 'Cancelled';

export interface WorkflowTask {
  id: string;
  workflowId: string;
  title: string;
  module: WorkflowInstance['module'];
  status: WorkflowTaskStatus;
  priority: WorkflowPriority;
  assignee: string;
  dueAt: string;
}