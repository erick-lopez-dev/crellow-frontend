import { Routes } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Dashboard } from './dashboard/dashboard'
import { AuthGuard } from './auth/auth.guard';
import { BoardDetail } from './dashboard/board-detail/board-detail';

export const routes: Routes = [
    {path: '', component: LandingPage},
    {path: 'auth/login', component: Login, },
    {path: 'auth/register', component: Register},
    {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: Dashboard,
    children: [
      { path: 'boards/:id', component: BoardDetail }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

