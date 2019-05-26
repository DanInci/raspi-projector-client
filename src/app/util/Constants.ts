export const enum Response {
    SLIDE_SHOW_FINISHED = 'slideshow_finished',
    SLIDE_SHOW_STARTED = 'slideshow_started',
    SLIDE_UPDATED = 'slide_updated'
}

export const enum Request {
    PRESENTATION_START = 'presentation_start',
    PRESENTATION_STOP = 'presentation_stop',
    PRESENTATION_RESUME = 'presentation_resume',
    PRESENTATION_BLANK_SCREEN = 'presentation_blank_screen',
    TRANSITION_NEXT = 'transition_next',
    TRANSITION_PREVIOUS = 'transition_previous',
    GO_TO_SLIDE = 'goto_slide'
}

export const enum RouteDefs {
    HOME = 'home',
    PRESENTATION = 'presentation',
    CONTROL = 'control'
}

export const OWNER_UUID = 'ownerUUID';
