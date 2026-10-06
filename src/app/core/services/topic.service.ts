import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SupportData, Topic } from '../models';

@Injectable({ providedIn: 'root' })
export class TopicService {
  constructor(private api: ApiService) {}

  getSupportData(): Observable<SupportData> {
    return this.api.getSupportData();
  }

  createTopic(topic: Topic): Observable<Topic> {
    return this.api.createTopic(topic);
  }

  updateTopic(id: string, topic: Topic): Observable<Topic> {
    return this.api.updateTopic(id, topic);
  }

  deleteTopic(id: string): Observable<void> {
    return this.api.deleteTopic(id);
  }
}
