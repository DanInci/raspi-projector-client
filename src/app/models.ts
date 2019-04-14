import { Response } from './util/Constants';
import { SafeUrl } from '@angular/platform-browser';

export interface IAppConfig {
    server: {
        apiUrl: string;
        wsUrl: string;
    };
}

export interface IPresentation {
    fileName: string;
    uploadFile: File;
}

export interface IStatsResponse {
    name: string;
    status: {
        command: Response;
        totalSlides?: number;
        currentSlide?: number;
    };
    controllers: number;
    maxControllers: number;
    isOwnerPresent: boolean;
    ownerTimeout: number;
}

export interface IUploadResponse {
    ownerUUID: string;
}

export interface IErrorResponse {
    error: string;
}

export interface ISocketResponse {
    command: Response;
    totalSlides?: number;
    currentSlide?: number;
    preview?: string;
}
