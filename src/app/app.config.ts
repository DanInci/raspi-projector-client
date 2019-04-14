import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAppConfig } from './models';

const CONFIG_FILE_LOCATION = 'assets/config/config.json';

@Injectable()
export class AppConfig {

    static settings: IAppConfig;

    constructor(private http: HttpClient) {}

    /*
     * This function loads config from `CONFIG_FILE_LOCATION` and stores it in settings variable
     */
    load() {
        return new Promise<void>((resolve, reject) => {
            this.http.get(CONFIG_FILE_LOCATION).toPromise().then((response: IAppConfig) => {
               AppConfig.settings = <IAppConfig>response;
               resolve();
            }).catch((response: any) => {
               reject(`Could not load config file '${CONFIG_FILE_LOCATION}': ${JSON.stringify(response)}`);
            });
        });
    }
}
