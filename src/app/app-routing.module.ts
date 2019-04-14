import { ProjectorStartPageComponent } from './projector-start-page/projector-start-page.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectorViewPageComponent } from './projector-view-page/projector-view-page.component';
import { RouteDefs } from './util/Constants';

const routes: Routes = [
  {path: RouteDefs.HOME, component: ProjectorStartPageComponent},
  {path: RouteDefs.PRESENTATION, component: ProjectorViewPageComponent},
  {path: RouteDefs.CONTROL, component: ProjectorViewPageComponent},
  {path: '**',  pathMatch: 'full', redirectTo: RouteDefs.HOME},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false } )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
