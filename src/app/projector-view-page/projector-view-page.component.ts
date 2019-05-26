import { CookieService } from 'ngx-cookie-service';
import { WebsocketService } from '../websocket.service';
import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../requests.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ISocketResponse, IErrorResponse, IStatsResponse } from '../models';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Request, Response, RouteDefs } from '../util/Constants';
import { repeatWhen, takeWhile } from 'rxjs/operators';
import { interval } from 'rxjs';
import { AppConfig } from '../app.config';

@Component({
  selector: 'app-projector-view-page',
  templateUrl: './projector-view-page.component.html',
  styleUrls: ['./projector-view-page.component.css']
})
export class ProjectorViewPageComponent implements OnInit {

  name: string;
  preview: SafeUrl;
  isOwnerPresent = false;
  currentSlide = 0;
  totalSlides = 0;
  usersOnline = 0;

  isControlPage = false;
  isLoading = true;
  showModal = true;

  private pollStats = true;

  constructor(private _wsService: WebsocketService,
    private _requestService: RequestsService,
    private _router: Router,
    private _activeRoute: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private _cookieService: CookieService,
    private _modalService: NgbModal,
    modalConfig: NgbModalConfig) {
      modalConfig.backdrop = 'static';
      modalConfig.keyboard = false;
  }

  ngOnInit() {
    // decide if it's a control page or not
    this._activeRoute.url.subscribe(urls => {
      const lastRoutePath = urls.length > 0 ? urls[urls.length - 1].path : '';
      if (lastRoutePath === RouteDefs.CONTROL) {
        this.isControlPage = true;
      } else if (lastRoutePath === RouteDefs.PRESENTATION) {
        this.isControlPage = false;
      } else {
        this.redirectToHomePage();
      }
    });

    // open socket
    this.openSocketConnection();

    // start polling for stats
    this.pollForStats(10000);
  }

  /**
   * Opens a socket connection to `wsUrl`
   */
  private openSocketConnection() {
    this._wsService.connect(AppConfig.settings.server.wsUrl);
    this._wsService.getEventListener().subscribe(event => {
      if (event.type === 'message') {
        this.handleMessages(event);
      }
      if (event.type === 'close') {
        this.pollStats = false;
        this._cookieService.deleteAll();
      }
      if (event.type === 'open') {
        this.pollStats = true;
      }
    });
  }

  /**
   * Polls stats every `every` ms
   */
  private pollForStats(every: number) {
    this._requestService.getStats().pipe(
      repeatWhen(() => interval(every)),
      takeWhile(() => this.pollStats)
    ).subscribe(
      res => {
        if (res.status === 200) {
          this.isLoading = false;
          const statsResponse = res.body as IStatsResponse;
          this.isOwnerPresent = statsResponse.isOwnerPresent;
          this.usersOnline = statsResponse.controllers;
          this.name = statsResponse.name;
        } else if (res.status === 404) {
          this.clean();
          this.redirectToHomePage();
        } else {
          const statsResponse = res.body as IErrorResponse;
          console.error(`Error requesting stats: ${statsResponse.error}`);
          this.clean();
          this.redirectToHomePage();
        }
      }, err => {
        console.error(`Error requesting stats: ${err}`);
        this.clean();
        this.redirectToHomePage();
      });
  }



  /**
   * Handle Socket Messages
   */
  private handleMessages(event) {
    if (event.data) {
      const response: ISocketResponse = JSON.parse(event.data);
      console.log(response.command);
      switch (response.command) {
        case Response.SLIDE_SHOW_STARTED:
          this.totalSlides = response.totalSlides ? response.totalSlides - 1 : 0; // because the last slide is always black
          this.currentSlide = response.currentSlide ? response.currentSlide : 0;
          if (response.preview) {
            this.preview = this._sanitizer.bypassSecurityTrustUrl(response.preview);
          }
          break;
        case Response.SLIDE_UPDATED:
          this.currentSlide = response.currentSlide ? response.currentSlide : 0;
          if (response.preview) {
            this.preview = this._sanitizer.bypassSecurityTrustUrl(response.preview);
          }
          break;
        case Response.SLIDE_SHOW_FINISHED:
          this.clean();
          // this.openModal('Projector Warning');
          this.redirectToHomePage();
          break;
        default:
          console.error(`Unrecognized response: ${event.data}`);
      }
    }
  }

  private clean() {
    console.log('Clean... delete stored cookies, close socket connection, stop polling for stats.');
    this._cookieService.deleteAll();
    this._wsService.close();
    this.pollStats = false;
  }

  /**
   * Redirect To Home Page
   */
  private redirectToHomePage() {
    this._router.navigate([RouteDefs.HOME]);
  }
  /**
   * send json with:
   * {command: 'transition_next'}
   * to websocket
   */
  private nextSlide() {
    const command = JSON.stringify({command: Request.TRANSITION_NEXT});
    this._wsService.send(command);
  }

  /**
   * send json with:
   * {command: 'transition_previous'}
   * to websocket
   */
  private prevSlide() {
    const command = JSON.stringify({command: Request.TRANSITION_PREVIOUS});
    this._wsService.send(command);
  }

  /**
  * send json with:
  * {command: 'presentation_stop'}
  * to websocket
  */
 private stopPresentation() {
    const command = JSON.stringify({command: Request.PRESENTATION_STOP});
    this._wsService.send(command);
  }

}
