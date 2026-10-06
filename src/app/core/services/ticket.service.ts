import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CreateTicketInput, SupportData, Ticket, TicketActionLog, TicketResponse, TicketUpdate } from '../models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  constructor(private api: ApiService) {}

  getTickets(): Observable<Ticket[]> {
    return this.api.getTickets();
  }

  getSupportData(): Observable<SupportData> {
    return this.api.getSupportData();
  }

  getTicketActionLogs(ticketId: string): Observable<TicketActionLog[]> {
    return this.api.getTicketActionLogs(ticketId);
  }

  getResponsesForTickets(tickets: Ticket[]): Observable<TicketResponse[]> {
    return this.api.getResponsesForTickets(tickets);
  }

  createTicket(ticket: CreateTicketInput): Observable<Ticket> {
    return this.api.createTicket(ticket);
  }

  updateTicket(id: string, changes: TicketUpdate): Observable<Ticket> {
    return this.api.updateTicket(id, changes);
  }

  createResponse(id: string, content: string, attachedFiles: string[] = [], fileIds: string[] = []): Observable<TicketResponse> {
    return this.api.createResponse(id, content, attachedFiles, fileIds);
  }
}
