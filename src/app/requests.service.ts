import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IPresentation, IStatsResponse, IErrorResponse, IUploadResponse } from './models';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from './app.config';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  private _url = AppConfig.settings.server.apiUrl;

  constructor(private _http: HttpClient) {}

  /**
   * Get stats from server:
   * 404 - means that slideshow is not present
   * 200 - means that slideshow is present
   */
  getStats(): Observable<{ status: number, body: IStatsResponse | IErrorResponse }> {
    return this._http.get(this._url + '/stats', { observe: 'response' }).pipe(
      map(response => {
        return <{ status: number, body: IStatsResponse | IErrorResponse }>{ status: response.status, body: response.body };
      }),
      catchError(error => of(<{ status: number, body: IStatsResponse | IErrorResponse }> { status: error.status, body: error.body })
      )
    );
  }

  /**
   * Post presentation on local server
   * Returns a response regarding it's success
   */
  postPresentation(presentation: IPresentation): Observable<{ status: number, body: IUploadResponse | IErrorResponse }> {
    const formData: FormData = new FormData();
    formData.append('fileName', presentation.fileName);
    formData.append('uploadFile', presentation.uploadFile);
    return this._http.post(this._url + '/upload', formData, { observe: 'response' }).pipe(
      map(response => {
        return <{ status: number, body: IUploadResponse | IErrorResponse }>{ status: response.status, body: response.body };
      }),
      catchError(error => of(<{ status: number, body: IUploadResponse | IErrorResponse }> { status: error.status, body: error.body }))
    );
  }
}
