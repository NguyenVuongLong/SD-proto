import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CreateTicketInput, SupportData, Ticket, TicketActionLog, TicketResponse, TicketUpdate } from '../models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  /**
   * Khởi tạo service ticket và inject ApiService.
   */
  constructor(private api: ApiService) {}

  /**
   * Lấy danh sách tất cả ticket.
   */
  getTickets(): Observable<Ticket[]> {
    return this.api.getTickets();
  }

  /**
   * Lấy dữ liệu hỗ trợ tổng hợp cho dashboard và quản lý ticket.
   */
  getSupportData(): Observable<SupportData> {
    return this.api.getSupportData();
  }

  /**
   * Lấy nhật ký thao tác của một ticket cụ thể.
   */
  getTicketActionLogs(ticketId: string): Observable<TicketActionLog[]> {
    return this.api.getTicketActionLogs(ticketId);
  }

  /**
   * Lấy danh sách phản hồi của nhiều ticket cùng lúc.
   */
  getResponsesForTickets(tickets: Ticket[]): Observable<TicketResponse[]> {
    return this.api.getResponsesForTickets(tickets);
  }

  /**
   * Tạo một ticket mới từ dữ liệu người dùng nhập.
   */
  createTicket(ticket: CreateTicketInput): Observable<Ticket> {
    return this.api.createTicket(ticket);
  }

  /**
   * Cập nhật thông tin của một ticket theo ID.
   */
  updateTicket(id: string, changes: TicketUpdate): Observable<Ticket> {
    return this.api.updateTicket(id, changes);
  }

  /**
   * Tạo phản hồi mới cho một ticket.
   */
  createResponse(id: string, content: string, attachedFiles: string[] = [], fileIds: string[] = []): Observable<TicketResponse> {
    return this.api.createResponse(id, content, attachedFiles, fileIds);
  }
}
