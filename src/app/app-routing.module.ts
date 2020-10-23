import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultComponent } from './layouts/default/default.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { AdminComponent } from './modules/admin/admin.component';
import { ChartComponent } from './modules/chart/chart.component';
import { ScreenerComponent } from './modules/screener/screener.component';
import { LoginComponent } from './modules/login/login.component';

import { AppGuard } from './app.guard';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'dashboard', component: DashboardComponent},
      { path: 'chart', component: ChartComponent},
      { path: 'chart/:symbol', component: ChartComponent},
      { path: 'screener', component: ScreenerComponent},
      { path: 'admin', component: AdminComponent},
      { path: 'login', component: LoginComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
