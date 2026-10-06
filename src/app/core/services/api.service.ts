import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';

const PRIORITY_TO_SLA_CODE: Record<string, string> = {
  Gấp: 'Urgent',
  Cao: 'High',
  'Trung bình': 'Normal',
  Thấp: 'Low'
};

const SLA_CODE_TO_PRIORITY: Record<string, string> = {
  Urgent: 'Gấp',
  High: 'Cao',
  Normal: 'Trung bình',
  Low: 'Thấp'
};

interface SupportData {
  tickets: any[];
  statuses: { statusCode: string; statusName: string }[];
  topics: any[];
  departments: { departmentCode: string; departmentName: string }[];
  employees: { employeeCode: string; employeeName: string; userName?: string; departmentCode: string; status: string }[];
  sla: { SLAcode: string; SLApriority: string; SLAvalue: string }[];
  responses: any[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private employeesByCode = new Map<string, { employeeCode: string; employeeName: string }>();

  constructor(protected http: HttpClient, private auth: AuthService) {}

  /**
   * Lấy danh sách tất cả ticket từ server
   * @returns Observable chứa mảng ticket đã được chuẩn hóa
   */
  getTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tickets`).pipe(
      map((tickets) => tickets.map((ticket) => this.normalizeTicket(ticket)))
    );
  }

  /**
   * Lấy toàn bộ dữ liệu hỗ trợ bao gồm ticket, trạng thái, chủ đề, phòng/ban và SLA
   * @returns Observable chứa đối tượng SupportData với tất cả thông tin cần thiết
   */
  getSupportData(): Observable<SupportData> {
    return forkJoin({
      tickets: this.getTickets(),
      statuses: this.getStatuses(),
      topics: this.getTopics(),
      departments: this.getDepartments(),
      employees: this.getEmployees(),
      sla: this.getSlas()
    }).pipe(
      map((data) => {
        const employeesByIdentifier = new Map(
          data.employees.flatMap((employee) => [
            [employee.employeeCode, employee],
            [employee.userName, employee]
          ])
        );
        const tickets = data.tickets.map((ticket) => {
          const assignedIdentifier = ticket.assignedUser ?? ticket.assignedTo ?? '';
          const employee = employeesByIdentifier.get(assignedIdentifier);
          return employee
            ? { ...ticket, assignedName: `${employee.employeeCode} - ${employee.employeeName}` }
            : ticket;
        });
        return { ...data, tickets, responses: [] };
      })
    );
  }

  /**
   * Lấy danh sách phản hồi cho một ticket cụ thể
   * @param ticketId - ID của ticket
   * @returns Observable chứa mảng phản hồi đã được chuẩn hóa
   */
  getTicketResponses(ticketId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tickets/${encodeURIComponent(ticketId)}/responses`).pipe(
      map((responses) => responses.map((response) => ({
        ...response,
        ticketId: response.ticketId ?? response.TicketId,
        responseId: response.responseId ?? response.ResponseId,
        createdDate: response.createdDate ?? response.CreatedDate ?? '',
        createdBy: response.createdBy ?? response.CreatedBy ?? '',
        attachedFiles: response.attachedFiles ?? response.AttachedFiles ?? []
      })))
    );
  }

  getTicketActionLogs(ticketId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tickets/${encodeURIComponent(ticketId)}/actions`);
  }

  getTicketActions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/actions`);
  }

  /**
   * Lấy danh sách phản hồi cho nhiều ticket cùng một lúc
   * @param tickets - Mảng ticket
   * @returns Observable chứa mảng phản hồi kết hợp từ tất cả ticket
   */
  getResponsesForTickets(tickets: any[]): Observable<any[]> {
    if (!tickets.length) return of([]);
    return forkJoin(tickets.map((ticket) => this.getTicketResponses(ticket.id))).pipe(
      map((responses) => responses.flat())
    );
  }

  /**
   * Lấy danh sách tất cả chủ đề hỗ trợ
   * @returns Observable chứa mảng chủ đề đã được chuẩn hóa
   */
  getTopics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/topics`).pipe(
      map((topics) => topics.map((topic) => ({
        ...topic,
        id: topic.id ?? topic.Id,
        topicName: topic.topicName ?? topic.TopicName,
        topicDescription: topic.topicDescription ?? topic.TopicDescription,
        departmentCode: topic.departmentCode ?? topic.DepartmentCode,
        status: topic.status ?? topic.Status,
        assignedEmployee: topic.assignedEmployee ?? topic.AssignedEmployee,
        SLA: topic.SLA ?? topic.slaHours ?? topic.SlaHours ?? '',
        slaPriority: topic.slaPriority ?? topic.SlaPriority ?? topic.SLApriority ?? '',
        slaCode: topic.slaCode ?? topic.SlaCode ?? '',
        slaHours: topic.slaHours ?? topic.SlaHours ?? ''
      })))
    );
  }

  /**
   * Lấy danh sách tất cả phòng/ban
   * @returns Observable chứa mảng phòng/ban
   */
  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/departments`);
  }

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employees`).pipe(
      map((employees) => {
        const uniqueEmployees = new Map<string, any>();
        for (const employee of employees) {
          const normalized = {
            employeeCode: employee.employeeCode ?? employee.EmployeeCode ?? '',
            employeeName: employee.employeeName ?? employee.EmployeeName ?? '',
            userName: employee.userName ?? employee.UserName ?? employee.username ?? employee.Username ?? '',
            departmentCode: employee.departmentCode ?? employee.DepartmentCode ?? '',
            status: employee.status ?? employee.Status ?? ''
          };
          if (normalized.status.trim().toUpperCase() === 'RESIGNATION') {
            continue;
          }

          const key = normalized.employeeName.trim();
          if (key && !uniqueEmployees.has(key)) {
            uniqueEmployees.set(key, normalized);
          }
        }
        const result = Array.from(uniqueEmployees.values()).sort((left, right) =>
          left.departmentCode.localeCompare(right.departmentCode) ||
          left.employeeName.localeCompare(right.employeeName) ||
          left.employeeCode.localeCompare(right.employeeCode)
        );
        this.employeesByCode = new Map(
          result.flatMap((employee) => [
            [employee.employeeCode, employee],
            [employee.userName, employee]
          ])
        );
        return result;
      })
    );
  }

  /**
   * Lấy danh sách tất cả trạng thái ticket
   * @returns Observable chứa mảng trạng thái
   */
  getStatuses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/statuses`);
  }

  /**
   * Lấy danh sách tất cả cấp độ SLA (Mức độ ưu tiên)
   * @returns Observable chứa mảng SLA đã được chuẩn hóa
   */
  getSlas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/slas`).pipe(
      map((slas) => slas.map((sla) => ({
        SLAcode: sla.SLAcode ?? sla.slaCode ?? sla.SlaCode ?? sla.slAcode ?? '',
        SLApriority: sla.SLApriority ?? sla.slaPriority ?? sla.SlaPriority ?? sla.slApriority ?? '',
        SLAvalue: sla.SLAvalue ?? sla.slaValue ?? sla.SlaValue ?? sla.slAvalue ?? ''
      })))
    );
  }

  /**
   * Lấy dữ liệu thống kê dashboard
   * @returns Observable chứa thông tin thống kê ticket
   */
  getDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`);
  }

  /**
   * Tạo ticket mới
   * @param ticket - Đối tượng ticket chứa các thông tin cần tạo
   * @returns Observable chứa ticket đã được tạo
   */
  createTicket(ticket: any): Observable<any> {
    const createdBy = this.currentUsername();
    const payload = {
      topicId: ticket.topicId,
      ticketName: ticket.ticketName ?? ticket.subject,
      ticketContent: ticket.ticketContent ?? ticket.content,
      attachedFile: ticket.attachedFile ?? null,
      fileIds: ticket.fileIds ?? [],
      createdBy
    };
    return this.http.post(`${this.baseUrl}/tickets`, payload).pipe(
      map((created) => this.normalizeTicket(created))
    );
  }

  /**
   * Cập nhật thông tin ticket
   * @param id - ID của ticket cần cập nhật
   * @param changes - Đối tượng chứa các trường cần cập nhật
   * @returns Observable chứa ticket đã được cập nhật
   */
  updateTicket(id: string, changes: any): Observable<any> {
    const payload = {
      statusCode: changes.statusCode,
      assignedTo: changes.assignedTo ?? changes.assignedUser,
      topicName: changes.topicName,
      slaCode: changes.slaCode ?? this.priorityCode(changes.priority),
      dueDate: changes.dueDate,
      closedDate: changes.closedDate,
      createdBy: this.currentUsername()
    };
    return this.http.patch(`${this.baseUrl}/tickets/${encodeURIComponent(id)}`, payload).pipe(
      map((updated) => this.normalizeTicket(updated))
    );
  }

  /**
   * Tạo phản hồi mới cho ticket
   * @param id - ID của ticket
   * @param content - Nội dung phản hồi
   * @param attachedFiles - Mảng tên tệp đính kèm (tùy chọn)
   * @returns Observable chứa phản hồi đã được tạo
   */
  createResponse(id: string, content: string, attachedFiles: string[] = [], fileIds: string[] = []): Observable<any> {
    const createdBy = this.currentUsername();

    return this.http.post(`${this.baseUrl}/tickets/${encodeURIComponent(id)}/responses`, {
      content,
      attachedFiles,
      fileIds,
      createdBy
    }).pipe(
      map((response: any) => ({
        ...response,
        ticketId: response.ticketId ?? response.TicketId,
        responseId: response.responseId ?? response.ResponseId,
        createdDate: response.createdDate ?? response.CreatedDate ?? '',
        createdBy: response.createdBy ?? response.CreatedBy ?? createdBy,
        attachedFiles: response.attachedFiles ?? response.AttachedFiles ?? []
      }))
    );
  }

  /**
   * Tạo chủ đề hỗ trợ mới
   * @param topic - Đối tượng chủ đề chứa các thông tin cần tạo
   * @returns Observable chứa chủ đề đã được tạo
   */
  createTopic(topic: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/topics`, topic);
  }

  /**
   * Cập nhật thông tin chủ đề
   * @param id - ID của chủ đề cần cập nhật
   * @param topic - Đối tượng chứa các trường cần cập nhật
   * @returns Observable chứa chủ đề đã được cập nhật
   */
  updateTopic(id: string, topic: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/topics/${encodeURIComponent(id)}`, topic);
  }

  /**
   * Xóa chủ đề (đánh dấu là không hoạt động)
   * @param id - ID của chủ đề cần xóa
   * @returns Observable void
   */
  deleteTopic(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/topics/${encodeURIComponent(id)}`);
  }

  /**
   * Chuẩn hóa dữ liệu ticket từ server để đảm bảo tất cả các trường cần thiết đều có giá trị
   * @param ticket - Đối tượng ticket thô từ server
   * @returns Đối tượng ticket đã được chuẩn hóa
   */
  private normalizeTicket(ticket: any): any {
    const slaCode = ticket.slaCode ?? ticket.SlaCode ?? ticket.SLAcode ?? ticket.slAcode ?? '';
    const assignedCode = ticket.assignedTo ?? ticket.assignedUser ?? ticket.AssignedTo ?? ticket.AssignedUser ?? '';
    const assignedEmployee = this.employeesByCode.get(assignedCode);
    return {
      ...ticket,
      id: ticket.ticketId ?? ticket.id ?? ticket.Id,
      ticketId: ticket.ticketId ?? ticket.id ?? ticket.Id,
      topicId: ticket.topicId ?? ticket.TopicId ?? '',
      departmentCode: ticket.departmentCode ?? ticket.DepartmentCode ?? '',
      ticketName: ticket.ticketName ?? ticket.subject ?? ticket.Subject ?? '',
      ticketContent: ticket.ticketContent ?? ticket.content ?? ticket.Content ?? '',
      subject: ticket.ticketName ?? ticket.subject ?? ticket.Subject ?? '',
      content: ticket.ticketContent ?? ticket.content ?? ticket.Content ?? '',
      attachedFile: ticket.attachedFile ?? ticket.AttachedFile ?? '',
      statusCode: ticket.statusCode ?? ticket.StatusCode ?? 'open',
      slaCode,
      priority: ticket.priority ?? ticket.Priority ?? this.priorityForCode(slaCode),
      assignedTo: assignedCode,
      assignedUser: assignedCode,
      assignedName: assignedEmployee
        ? `${assignedEmployee.employeeCode} - ${assignedEmployee.employeeName}`
        : ticket.assignedName ?? ticket.AssignedName ?? assignedCode,
      creatorUser: ticket.createdBy ?? ticket.CreatedBy ?? '',
      creatorName: ticket.createdBy ?? ticket.creatorName ?? ticket.CreatorName ?? '',
      creatorPhone: '',
      creatorDept: ticket.departmentCode ?? ticket.DepartmentCode ?? '',
      assignedPhone: '',
      assignedDept: ticket.departmentCode ?? ticket.DepartmentCode ?? '',
      assignedDate: ticket.assignedDate ?? ticket.AssignedDate ?? '',
      closedBy: ticket.closedBy ?? ticket.ClosedBy ?? '',
      createdBy: ticket.createdBy ?? ticket.CreatedBy ?? '',
      createdDate: ticket.createdDate ?? ticket.CreatedDate ?? '',
      dueDate: ticket.dueDate ?? ticket.DueDate ?? '',
      closedDate: ticket.closedDate ?? ticket.ClosedDate ?? '',
      topicName: ticket.topicName ?? ticket.TopicName ?? ''
    };
  }

  private priorityCode(priority?: string): string | undefined {
    return PRIORITY_TO_SLA_CODE[priority ?? ''];
  }

  currentUserName(): string {
    return this.auth.currentUserName();
  }

  currentUsername(): string {
    return this.auth.currentUsername();
  }

  /**
   * Chuyển đổi mã SLA sang tên mức độ ưu tiên tiếng Việt
   * @param code - Mã SLA (Urgent, High, Normal, Low)
   * @returns Tên mức độ ưu tiên (Gấp, Cao, Trung bình, Thấp)
   */
  private priorityForCode(code: string): string {
    return SLA_CODE_TO_PRIORITY[code] ?? 'Thấp';
  }
}
