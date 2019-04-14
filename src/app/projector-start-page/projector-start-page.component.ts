import { CookieService } from 'ngx-cookie-service';
import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../requests.service';
import { IPresentation, IUploadResponse, IErrorResponse, IStatsResponse } from '../models';
import { Router } from '@angular/router';
import { RouteDefs } from '../util/Constants';

@Component({
  selector: 'app-projector-start-page',
  templateUrl: './projector-start-page.component.html',
  styleUrls: ['./projector-start-page.component.css']
})
export class ProjectorStartPageComponent implements OnInit {

  isFound = false;
  isLoading = false;
  isOwnerPresent = false;
  usersOnline = 0;
  uploadText = 'Your Presentation.ppt';
  runningFileName = 'Running File Name';
  errors: string; // error messages to be displayed
  private presentation: IPresentation;

  constructor(private _requestService: RequestsService,
    private _cookieService: CookieService,
    private _router: Router) { }

  ngOnInit() {
    // delete all cookies
    this._cookieService.deleteAll('/');
    // request stats
    this._requestService.getStats().subscribe(
      res => {
        if (res.status === 200) {
          const statsResponse = res.body as IStatsResponse;
          this.isFound = true;
          this.isOwnerPresent = statsResponse.isOwnerPresent;
          this.usersOnline = statsResponse.controllers;
          this.runningFileName = statsResponse.name;
        } else if (res.status === 404) {
          this.isFound = false;
        } else {
          const statsResponse = res.body as IErrorResponse;
          console.log(`Error requesting stats: ${statsResponse.error}`);
          this.isFound = false;
        }
      }, err => {
        console.log(`Error requesting stats: ${err}`);
        this.isFound = false;
      });
  }

  /**
   * file chooser event listener
   */
  onFileChange(event) {
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
   * Checks if there is a right file attached
   */
  checkAttachedFile(): Boolean {
    if (this.presentation) {
      if (this.presentation.uploadFile.type !== 'application/vnd.ms-powerpoint') {
        this.errors = 'Only presentations are allowed';
        return false;
      }
    } else {
      this.errors = 'No file attached';
      return false;
    }
    return true;
  }

  /**
   * Verifies and uploads attached presentation file
   * Starts the presentation
   */
  upload() {
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
        console.log(`Error uploading file: ${err}`);
        this.isFound = false;
        this.isLoading = false;
        this.errors = 'Error uploading file...';
      });
    }
  }

  /**
   * Connect to an already running presentation
   */
  connect() {
    this.isLoading = true;
    this._router.navigate([RouteDefs.PRESENTATION]); // go to next page
  }

}
