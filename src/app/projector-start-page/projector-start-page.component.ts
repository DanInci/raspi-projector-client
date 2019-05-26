import { CookieService } from 'ngx-cookie-service';
import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../requests.service';
import { IPresentation, IUploadResponse, IErrorResponse, IStatsResponse } from '../models';
import { Router } from '@angular/router';
import { repeatWhen } from 'rxjs/operators';
import { interval } from 'rxjs';
import { RouteDefs } from '../util/Constants';

@Component({
  selector: 'app-projector-start-page',
  templateUrl: './projector-start-page.component.html',
  styleUrls: ['./projector-start-page.component.css']
})
export class ProjectorStartPageComponent implements OnInit {

  private presentation: IPresentation;
  uploadText = 'Your Presentation.ppt';
  errors: string; // error messages to be displayed

  isFound = false;
  isLoading = false;

  isOwnerPresent = false;
  usersOnline = 0;
  runningFileName = 'Running File Name';

  constructor(private _requestService: RequestsService,
    private _cookieService: CookieService,
    private _router: Router) { }

  ngOnInit() {
    // start polling for stats every 10s
    this.pollForStats(10000);
  }

  /**
   * Polls stats every `every` ms
   */
  private pollForStats(every: number) {
    this._requestService.getStats().pipe(
      repeatWhen(() => interval(every))
    ).subscribe(
      res => {
        if (res.status === 200) {
          this.isFound = true;
          const statsResponse = res.body as IStatsResponse;
          this.isOwnerPresent = statsResponse.isOwnerPresent;
          this.usersOnline = statsResponse.controllers;
          this.runningFileName = statsResponse.name;
        } else if (res.status === 404) {
          this.isFound = false;
        } else {
          this.isFound = false;
          const statsResponse = res.body as IErrorResponse;
          console.error(`Error requesting stats: ${statsResponse.error}`);
        }
      }, err => {
        this.isFound = false;
        console.error(`Error requesting stats: ${err}`);
      });
  }


  /**
   * Connect to an already running presentation
   */
  private connect() {
    this.isLoading = true;
    if (this._cookieService.check('ownerUUID')) {
      this._router.navigate([RouteDefs.CONTROL]);
    } else {
      this._router.navigate([RouteDefs.PRESENTATION]);
    }
  }

  /**
   * file chooser event listener
   */
  private onFileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      // set presentation
      this.presentation = {
        fileName: file.name,
        uploadFile: file
      };
      // update upload text
      this.uploadText = file.name;
      this.errors = '';
    }
  }

  /**
   * Verifies and uploads attached presentation file
   * Starts the presentation
   */
  private upload() {
    this.errors = ''; // clear errors
    if (this.checkAttachedFile()) {
      this.isLoading = true; // start loading annimation
      this._requestService.postPresentation(this.presentation) // post presentation
      .subscribe(response => {
        if (response.status === 201) {
          const uploadResponse = response.body as IUploadResponse;
          this._cookieService.set('ownerUUID', uploadResponse.ownerUUID, 7200, '/'); // store ownerUUID
          this._router.navigate([RouteDefs.CONTROL]); // go to next page
        } else {
          const uploadResponse = response.body as IErrorResponse;
          this.isLoading = false;
          this.isFound = false;
          this.errors = JSON.stringify(uploadResponse);
        }
      }, err => {
        console.error(`Error uploading file: ${err}`);
        this.isFound = false;
        this.isLoading = false;
        this.errors = 'Error uploading file...';
      });
    }
  }

  /**
   * Checks if there is a valid attachment
   */
  private checkAttachedFile(): Boolean {
    if (this.presentation) {
      if (this.presentation.uploadFile.type !== 'application/vnd.ms-powerpoint') {
        this.errors = 'Only .ppt presentations are allowed';
        return false;
      }
    } else {
      this.errors = 'No file attached';
      return false;
    }
    return true;
  }

}
