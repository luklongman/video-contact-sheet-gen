Past updates

Modify FrameSelectionSettings.tsx and adopt the following way of presenting input fields.
Fro	m 	[(# icon) startFrame : integer (allow temporary empty, eg currently it doesn’t allow user to remove the last digit and type again)] frame OR [(clock icon) startTime: timestamp (hh:mm:ss:ms)]
To 		[endFrame (inclusive)] frame or [endTime]
[Interval Toggle off] default off: “Extract every frame”
[Interval Toggle on] Extract for every [(# icon) integer] frame OR [seconds: float] Second(s) *Having said that, convert interval frame and time instantly and give up the interval mode concept. 

[limit Toggle off] default “without limit.”
[limit Toggle on] Up to [integer: maximum number of frames] frames.

Each input field with validator, appropriate icons, text label, border, and appropriate interactivity with corresponding elements. Make sure the timestamp data type is correct. Use context7 for daisyUI best practices.


Create a Hero landing page with overlay image. Adopt a tailored made dark theme that resembles the style of cinema film. Make sure enough contrast. 

In the main page, replace the App bar with a designed user flow button that again resembles a video film frame.
[1 Input]
[2 Frames]
[3 Style]
[4 Format]
[5 Generate]

Functions:
- User has to load a valid video first before moving onto 2,3,4,5. After that, user can navigate freely. 
- Proceed to next step when user confirm the choices and they are valid.
- When user flow button is clicked, show the corresponding card. Hide the others. Apply brisk animation for in and out.
- When hovering over, show key info with daisy tooltip
    - For example
        - Duration; frame rate; resolution and codec in a clean list when hovering over [1 Input]
- The flow chart buttons should display chosen color when chosen.
- On step 5 Summarize the current choices. Having said that. Deattach the generate button from output setting (aka Format section)

Keep the preview for each section.
To ensure performance, Use an Accordion with hide/show logic for all sections rather than switch and reloading pages.
Give border to each input field. Show red border and show alert when input is not validated



Update the loading logic.

Currently, the user stays until the ffmpeg process is finished but it is not necessary since essential info should not require long loading time. Specifically, quickly obtain and validate the VideoMetadata then proceed to frame section. The loading can take place in the background

Use the following variable in #FilmFreameNavigation.tsx for state mangement
// Future store additions needed:
// isLoading: boolean;
// loadProgress: number; // 0-100
// loadStatus: string;
