import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SupportData, Topic } from '../models';

@Injectable({ providedIn: 'root' })
export class TopicService {
  /**
   * Khởi tạo service chủ đề và inject ApiService.
   */
  constructor(private api: ApiService) {}

  /**
   * Lấy dữ liệu hỗ trợ tổng hợp liên quan đến chủ đề và ticket.
   */
  getSupportData(): Observable<SupportData> {
    return this.api.getSupportData();
  }

  /**
   * Tạo một chủ đề mới trong hệ thống.
   */
  createTopic(topic: Topic): Observable<Topic> {
    return this.api.createTopic(topic);
  }

  /**
   * Cập nhật thông tin của một chủ đề theo ID.
   */
  updateTopic(id: string, topic: Topic): Observable<Topic> {
    return this.api.updateTopic(id, topic);
  }

  /**
   * Xóa hoặc vô hiệu hóa một chủ đề theo ID.
   */
  deleteTopic(id: string): Observable<void> {
    return this.api.deleteTopic(id);
  }
}
