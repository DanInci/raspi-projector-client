import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ProjectorStartPageComponent } from './projector-start-page/projector-start-page.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { ProjectorViewPageComponent } from './projector-view-page/projector-view-page.component';
import { CookieService } from 'ngx-cookie-service';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppConfig } from './app.config';
import { APP_INITIALIZER } from '@angular/core';

export const initializeApp = (appConfig: AppConfig) => {
  return () => appConfig.load();
};

@NgModule({
  declarations: [
    AppComponent,
    ProjectorStartPageComponent,
    ProjectorViewPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule.forRoot(),
    NgCircleProgressModule.forRoot({
      radius: 60,
      space: -10,
      outerStrokeWidth: 10,
      outerStrokeColor: '#4882c2',
      innerStrokeColor: '#e7e8ea',
      innerStrokeWidth: 10,
      title: 'UI',
      animateTitle: false,
      animationDuration: 1000,
      showSubtitle: false,
      showUnits: false,
      showBackground: false,
      clockwise: false,
      startFromZero: false
    })
  ],
  providers: [
    CookieService,
    NgbActiveModal,
    AppConfig,
    { provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
