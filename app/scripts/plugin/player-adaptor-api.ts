/**
 * @description The parameters describe behavior of the player controls
 * It is used as default controls parameters for correct timeline behavior in overlay
 * and in full screen mode.
 */
export interface ControlsDescriptor {
    height: number;
    /**
     * The height in pixels of the controls
     */

    progressBarOffInOverlay?: boolean;
    /**
     * if true the custom progress bar (not the timeline) will be force disabled in overlay.
     * In other cases logic will be applied of when to show it and when to hide it.
     */

    track: {
        marginRight: number;
        /**
         * The space in pixels between the right edge of the player and the end of the track
         */
        marginLeft: number;
        /**
         * The space in pixels between the left edge of the player and the start of the track
         */

        maxWidth?: number;
        /**
         * Maximum width of the track in pixels.
         * Not required for some of the players because the track width is 100%.
         * If set must be set to an integer representing pixels.
         */

        widthPercentage?: number;
        /**
         * Width of the track in percentage of the whole screen width.
         * Some players don't use fixed width but use
         * percentage instead.
         */
    };
    /**
     * The track is the progress timeline element of the controls
     * not including the other controls like the play button.
     */

    fullScreen: {
        height: number;
        topTrack?: {
            margins?: number;
        };
        /**
         *  Set the margins for the timeline.
         *  if Annoto configured to place the timeline at the top of
         *  the screen when the player is in full screen.
         */

        track: {
            marginRight: number;
            marginLeft:  number;
            maxWidth?: number;
            widthPercentage?: number;
        }
    };
    /**
     * Same parameters as above for full screen. Some players have different parameters of controls
     * when they are in full screen.
     */

    mouse: {
        trackMove: boolean;
        /**
         * Set to true if movement of the mouse inside player opens the controls
         */
        moveTimeout?: number;
        /**
         * Timeout in milliseconds after which the controls are hiding
         * when mouse inside the player is not moved.
         */
        hideOnLeave: boolean;
        /**
         * Set to true if the controls are hiding when mouse leaves the video frame
         * (see hideDelay below).
         */
        showOnEnter: boolean;
        /**
         * Set to true if when mouse enters the video frame the controls gets open.
         */
        enterTimeout?: number;
        /**
         * similar to moveTimeout but for mouse enter into video frame.
         * Useful when trackMove is false
         */
    };
    /**
     * The controls are dynamically closing and opening based on user mouse movement.
     * To fit the the timeline to the state of the controls, we track mouse movement.
     */

    hideOnPlay: boolean;
    /**
     * Set to true if play() action causes controls to hide
     */
    shownOnLoad: boolean;
    /**
     * Set to true if controls are shown when the player loads
     */
    showDelay?: 10;
    /**
     * Delay in milliseconds for any show controls action
     */
    hideDelay?: number;
    /**
     * Delay in milliseconds for hide action (for example after mouse leaves the video frame)
     */
    firstShowDelay?: number;
    /**
     * Similar to showDelay, but only for first show of controls. Not required for most players.
     */
}

export interface MediaMetadata {
    title: string; // Media Title
    description?: string; // (Optional) Media description
    group?: {             // (Optional) Course/group
        id: string | number; // Unique group identifier
        title: string; // Group title
        description?: string; // (Optional) Group description
    };
    period?: {          // (Optional) Semester/period
        id: string | number; // Unique period identifier
        title: string; // Period Title
        start?: Date; // (Optional) Period start date
        end?: Date; // (Optional) Period end date
    };
}


export type PlayerEventCallback = () => void;

/**
 * @description Annoto Player Adaptor API
 */
export interface PlayerAdaptorApi {
    /**
     * @description This method is called by Annoto as the first method.
     * Use it to configure the player interface object.
     * If the method returns false, Annoto will retry a number of times with fixed
     * period of time between the retries.
     * This is useful if your player needs to load some resources, or wait for some condition.
     * Notice: For Advanced use cases, the method can return a Promise. If a Promise is returned,
     *         No retries shall be performed. Annoto will wait for Promise resolve/reject.
     *
     * @param element - html DOM element of the player (as configured by Annoto API)
     * @returns {boolean/Promise}
     */
    init: (element: Element) => boolean | Promise<boolean>;

    /**
     * @description (OPTIONAL) called by Annoto to release resources when the widget is closing.
     * NOTICE: Although optional this method is highly recommended if you use Annoto API
     * to dynamically load and close the widget.
     */
    remove?: () => void | Promise<void>;

    /**
     * @description Start playing the media
     */
    play: () => void | Promise<void>;

    /**
     * @description Pause the media
     */
    pause: () => void | Promise<void>;

    /**
     * @description Set the media current time of track (skip/seek to time of the track)
     * @param time - in seconds
     */
    setCurrentTime: (time: number) => void | Promise<void>;

    /**
     * @description Get time of current playback position.
     * @returns {Number | Promise<number>} - in seconds. Preferred Floating point precision.
     */
    currentTime: () => number | Promise<number>;

    /**
     * @description Get the total media track duration in seconds
     * 0 or NaN or 'undefined' values may be returned until media is ready.
     * @returns {Number | NaN | Promise<number>} - in seconds
     */
    duration: () => number | Promise<number>;

    /**
     * @description Get player playback state (playing or paused)
     * @returns {boolean | Promise<boolean>} - true if pause, false if playing
     */
    paused: () => boolean | Promise<boolean>;

    /**
     * @description Get full URL of the currently played media source.
     * @returns {string | Promise<string>}
     */
    mediaSrc: () => string | Promise<string>;

    /**
     * @description (OPTIONAL) Get Metadata for the media.
     * @return {MediaMetadata | Promise<MediaMetadata>}
     */
    mediaMetadata?: () => MediaMetadata | Promise<MediaMetadata>;

    /**
     * @description Get player autoplay configuration option
     * (if player configured to play on page load)
     * If such an option is not supported, return false.
     * @returns {boolean | Promise<boolean>}
     */
    autoplay: () => boolean | Promise<boolean>;

    /**
     * @description Get player controls description parameters.
     * The parameters describe behavior of the player controls.
     * @returns {ControlsDescriptor} controls descriptor object
     */
    controlsDescriptor: () => ControlsDescriptor;

    /**
     * @description (OPTIONAL) Get player full screen state.
     * NOTE: if not supported the function must be undefined.
     * Annoto will use other methods to detect full screen.
     * Below it is defined only for purposes of API documentation.
     * @returns {boolean}
     */
    fullScreen?: () => boolean;

    /**
     * @description (OPTIONAL) Get player width in pixels.
     * NOTE: if not supported the function must be undefined.
     * Annoto will use other methods to detect width of the player.
     * Below it is defined only for purposes of API documentation.
     * @returns {number | string} if string, may contain 'px'
     */
    width?: () => number | string;

    /**
     * @description (OPTIONAL) Get player height in pixels.
     * NOTE: if not supported the function must be undefined.
     * Annoto will use other methods to detect height of the player.
     * Below it is defined only for purposes of API documentation.
     * @returns {number | string} if string, may contain 'px'
     */
    height?: () => number | string;

    /**
     * @description (OPTIONAL) Get player controls hidden state.
     * NOTE: if not supported the function must be undefined.
     * Annoto will use other methods to detect controls state.
     * Below it is defined only for purposes of API documentation.
     * @returns {boolean}
     */
    controlsHidden?: () => boolean;

    /**
     * @description (OPTIONAL) Get player controls height in pixels.
     * If supported it will be used instead of controlsDescriptor values.
     * NOTE: if not supported the function must be undefined.
     * Annoto will use other methods to detect height of the player.
     * Below it is defined only for purposes of API documentation.
     * @returns {number | string} if string, may contain 'px'
     */
    controlsHeight?: () => number | string;

    /**
     * @description (OPTIONAL) Get player player controls track left margin in pixels.
     * If supported it will be used instead of controlsDescriptor values.
     * NOTE: if not supported the function must be undefined.
     * Annoto will use other methods to detect height of the player.
     * Below it is defined only for purposes of API documentation.
     * @returns {number | string} if string, may contain 'px'
     */
    trackMarginLeft?: () => number | string;

    /**
     * @description (OPTIONAL) Get player player controls track right margin in pixels.
     * If supported it will be used instead of controlsDescriptor values.
     * NOTE: if not supported the function must be undefined.
     * Annoto will use other methods to detect height of the player.
     * Below it is defined only for purposes of API documentation.
     * @returns {number | string} if string, may contain 'px'
     */
    trackMarginRight?: () => number | string;

// Events - callbacks to be called when certain events take place.
// No need to support multiple registrations for same event. We register only once.
// Annoto will register to those Events after the init() call returns true.

    /**
     * @description cb should be called when the player is setup and the media metadata is loaded.
     * This method must be called as the first event.
     * If your player does not support this event, simulate it by calling the cb manually.
     * @param cb{PlayerEventCallback}
     */
    onReady: (cb: PlayerEventCallback) => void;

    /**
     * @description cb should be called when the media is played.
     * @param cb{PlayerEventCallback}
     */
    onPlay: (cb: PlayerEventCallback) => void;

    /**
     * @description cb should be called when the media is paused.
     * @param cb{PlayerEventCallback}
     */
    onPause: (cb: PlayerEventCallback) => void;

    /**
     * @description cb should be called when the media is seeked
     * (playback position changes after seeking).
     * @param cb{PlayerEventCallback}
     */
    onSeek: (cb: PlayerEventCallback) => void;

    /**
     * @description cb should be called when the media playback current time is updated.
     * Or when the media duration is changed.
     * can be frequent. 200 msec is a good choice for period.
     * @param cb{PlayerEventCallback}
     */
    onTimeUpdate: (cb: PlayerEventCallback) => void;

    /**
     * @description cb should be called when the media source changes.
     * @param cb{PlayerEventCallback}
     */
    onMediaChange: (cb: PlayerEventCallback) => void;

    /**
     * @description (OPTIONAL) cb should be called when full screen state of the player changes.
     * NOTE: if not supported the function must be undefined.
     * Annoto will use other methods to detect full screen.
     * Below it is defined only for purposes of API documentation.
     * @param cb{(isFullScreen?: boolean) => void} the callback may pass
     * non mandatory new full screen state as boolean.
     */
    onFullScreen?: (cb: (isFullScreen?: boolean) => void) => void;

    /**
     * @description (OPTIONAL) cb should be called when player size changes.
     * NOTE: if not supported the function must be undefined.
     * Annoto will use other methods to detect size change.
     * Below it is defined only for purposes of API documentation.
     * @param cb{PlayerEventCallback}
     */
    onSizeChange?: (cb: PlayerEventCallback) => void;

    /**
     * @description (OPTIONAL) cb should be called when player controls are shown.
     * If implemented the onControlsHide() method must be implemented as well.
     * If implemented those events will be used instead of mouse tracking
     * and controlsDescriptor.mouse parameters.
     * NOTE: if not supported the function must be undefined.
     * Annoto will use other methods to detect controls state.
     * Below it is defined only for purposes of API documentation.
     * @param cb{function}
     */
    onControlsShow?: (cb: PlayerEventCallback) => void;

    /**
     * @description (OPTIONAL) cb should be called when player controls are hidden.
     * If implemented the onControlsShow() method must be implemented as well.
     * If implemented those events will be used instead of mouse tracking
     * and controlsDescriptor.mouse parameters.
     * NOTE: if not supported the function must be undefined.
     * Annoto will use other methods to detect controls state.
     * Below it is defined only for purposes of API documentation.
     * @param cb{PlayerEventCallback}
     */
    onControlsHide?: (cb: PlayerEventCallback) => void;

    /**
     * @description (OPTIONAL) cb should be called when an error occurred
     * during the loading of the media.
     * @param cb{(err?: Error) => void}
     */
    onError?: (cb: (err?: Error) => void) => void;

    /**
     * @description (OPTIONAL) cb should be called when
     * the media element/player is taken off of a page.
     * Useful for dynamic websites.
     * @param cb{PlayerEventCallback}
     */
    onRemove?: (cb: PlayerEventCallback) => void;
}
