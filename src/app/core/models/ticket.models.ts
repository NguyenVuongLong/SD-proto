export interface Ticket {
  id: string;
  ticketId?: string;
  topicId?: string;
  subject: string;
  content: string;
  attachedFile?: string;
  statusCode: string;
  slaCode?: string;
  priority?: string;
  creatorUser?: string;
  creatorName?: string;
  creatorPhone?: string;
  creatorDept?: string;
  assignedUser?: string;
  assignedName?: string;
  assignedPhone?: string;
  assignedDept?: string;
  createdDate?: string;
  dueDate?: string;
  closedDate?: string;
  topicName?: string;
}

export interface TicketResponse {
  ticketId: string;
  responseId: string;
  content: string;
  createdDate?: string;
  createdBy?: string;
  attachedFiles?: string[];
}

export interface TicketActionLog {
  actionName?: string;
  actionCode?: string;
  actionBy?: string;
  createdBy?: string;
  createdDate?: string;
  actionDate?: string;
  created_at?: string;
}

export interface SupportStatus {
  statusCode: string;
  statusName: string;
}

export interface Department {
  departmentCode: string;
  departmentName: string;
}

export interface Employee {
  employeeCode: string;
  employeeName: string;
  userName?: string;
  departmentCode: string;
  status: string;
}

export interface Sla {
  SLAcode: string;
  SLApriority: string;
  SLAvalue: string;
}

export interface SupportData {
  tickets: Ticket[];
  statuses: SupportStatus[];
  topics: Topic[];
  departments: Department[];
  employees: Employee[];
  sla: Sla[];
  responses: TicketResponse[];
}

export interface CreateTicketInput {
  topicId: string;
  ticketName: string;
  ticketContent: string;
  attachedFile?: string | null;
  fileIds?: string[];
}

export interface AttachmentInfo {
  fileId: string;
  originalName: string;
  extension: string;
  fileSize: number;
}

export interface TicketUpdate {
  statusCode?: string;
  assignedTo?: string;
  assignedUser?: string;
  topicName?: string;
  slaCode?: string;
  priority?: string;
  dueDate?: string;
  closedDate?: string;
}

export interface Topic {
  id: string;
  topicName: string;
  topicDescription: string;
  departmentCode: string;
  status: string;
  assignedEmployee: string;
  SLA: string;
  slaPriority: string;
  slaCode: string;
}
