import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.module').then(({ AuthModule }) => AuthModule)
  },
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('@business/dashboard/dashboard.component').then(({ DashboardComponent }) => DashboardComponent)
      },
      {
        path: 'my-tickets',
        loadComponent: () => import('@business/my-tickets/my-tickets.component').then(({ MyTicketsComponent }) => MyTicketsComponent)
      },
      {
        path: 'manage-tickets',
        loadComponent: () => import('@business/manage-ticket/manage-ticket.component').then(({ ManageTicketComponent }) => ManageTicketComponent)
      },
      {
        path: 'monitor-ticket',
        loadComponent: () => import('@business/monitor-ticket/monitor-ticket.component').then(({ MonitorTicketComponent }) => MonitorTicketComponent)
      },
      {
        path: 'manage-topic',
        loadComponent: () => import('@business/manage-topic/manage-topic.component').then(({ ManageTopicComponent }) => ManageTopicComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
