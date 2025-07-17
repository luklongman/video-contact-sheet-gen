Product Requirements Document: Video Contact Sheet Generator (v3.0 - React/Next.js)
1. Introduction

This document details the requirements for a Single Page Application (SPA) that generates visual contact sheets from user-provided video files. All processing will occur client-side within the browser, leveraging WebAssembly to ensure user privacy and eliminate server-side costs. The application will be built with Next.js and styled with DaisyUI, focusing on performance, a highly responsive UI, and granular user control over the output.
2. Core Goals

    Privacy & Performance: Guarantee user privacy and deliver a fast, responsive experience by performing all video processing on the client's machine using FFmpeg.js within a Web Worker.

    Deep Customization: Provide users with a comprehensive and intuitive set of tools to control frame selection, grid layout, and visual styling.

    Exceptional User Experience: Offer a clean, minimalist interface with immediate visual feedback (e.g., a live layout preview) to make the creation process transparent and intuitive.

    Accessibility: Adhere to WCAG 2.1 AA standards, leveraging DaisyUI's accessible component classes, to ensure the application is usable by people with a wide range of disabilities.

3. Target Audience

    Video Professionals: Editors, social media managers, and content creators needing quick visual summaries of video assets for storyboarding, logging, or sharing.

    Researchers & Analysts: Professionals reviewing footage for specific events, patterns, or evidence.

    Archivists: Individuals and organizations creating visual indexes for large video libraries.

    General Users: Anyone seeking to create a unique visual artifact from a personal video.

4. User Flow & Features

This section outlines the user's journey from loading a video to downloading the final contact sheet.
Phase 1: Video Load & Analysis

    File Selection: The user is prompted to load a video file via a "Choose File" button or a drag-and-drop zone.

    Initial Validation: The application accepts standard video formats supported by FFmpeg (MP4, WebM, MOV, etc.).

    Metadata Extraction (Required):

        Upon file selection, the application immediately uses FFmpeg.js (in a Web Worker) to probe the video file.

        A loading indicator will show that the video is being analyzed.

        The application extracts and stores critical metadata: Duration, Frames Per Second (FPS), Resolution, and Codec.

        This metadata is displayed to the user. The settings panel is only activated upon successful completion.

        Error Handling: If the file is unsupported or corrupted, a clear, user-friendly error message is displayed using a toast or alert component.

Phase 2: Settings Configuration

The settings panel is split into logical sections, with a live "Skeleton Preview" pane that updates in real-time to reflect changes.
2.1. Frame Selection

    Time/Frame Range:

        Two input fields for Start and End points, which can be toggled between Time (HH:MM:SS.ms) and Frame Number.

        These inputs are bidirectionally reactive. Changing the time will instantly update the corresponding frame number based on the video's probed FPS, and vice-versa.

        A visual range slider is provided for quick selection.

    Extraction Interval:

        The user must explicitly choose an interval mode:

            [o] Every X frames (integer input)

            [o] Every X seconds (decimal input)

    Frame Limit: An optional checkbox [ ] Limit to first N frames with a numeric input.

    Derived Readout (UI): A prominent, non-editable text display shows the "Total frames to be extracted", which updates instantly based on the settings above.

2.2. Layout & Styling

    Layout Mode: The user selects one of two modes for defining the output dimensions:

        [o] Dynamic Canvas:

            User sets Number of Columns and Thumbnail Width (in pixels).

            The number of rows and the final canvas dimensions are calculated automatically.

        [o] Fixed Canvas:

            User sets Canvas Dimensions (Width & Height in pixels), Number of Columns, and Number of Rows.

            The thumbnail size is calculated automatically to fit the grid. The "Thumbnail Width" input is disabled in this mode.

    Styling Controls:

        Padding: A numeric input for the space (in pixels) between thumbnails.

        Border: A toggle to enable/disable borders, with inputs for thickness (px) and a color picker.

        Background Color: A color picker for the contact sheet's background.

        Timestamp Overlay: A toggle to [ ] Display timestamp on each frame. If enabled, options for font size, position (e.g., Bottom Center), and color appear.

    Live Skeleton Preview: A simple visual grid of gray boxes updates in real-time to show how the final layout will look based on the current settings.

2.3. Output Settings

    Image Format: Radio buttons to select the final output format: JPEG, PNG.

    Image Quality (JPEG only): A slider (1-100) to control JPEG compression quality.

    Presets: A dropdown menu with [Save current settings as preset...] and a list of pre-defined and user-saved presets (e.g., "Standard 4x5 Grid," "High-Quality 1080p").

    Shareable Link: A "Copy Link" button that generates a URL with the current settings encoded as query parameters.

Phase 3: Generation & Download

    Initiate Generation: The user clicks a "Generate Contact Sheet" button.

    Processing:

        A progress bar with a percentage and text status (e.g., "Extracting frame 50 of 200...") is displayed.

        All FFmpeg processing occurs in the Web Worker to keep the UI responsive.

    Preview & Download:

        Upon completion, a high-fidelity preview of the final contact sheet is displayed.

        A "Download" button appears, allowing the user to save the image. The default filename will be [original_video_name]_contact_sheet.[format].

        Error Handling: If processing fails, a specific error message is shown (e.g., "Processing failed: Not enough memory.").

5. Technical Implementation Requirements

    Framework: Next.js (App Router)

    UI Components: DaisyUI

    Styling: Tailwind CSS (as a dependency for DaisyUI)

    Video Processing: FFmpeg.js (@ffmpeg/ffmpeg, @ffmpeg/core)

    Icons: lucide-react

    State Management:

        Local component state must be managed with React Hooks (useState, useCallback, useEffect).

        Derived or memoized values must use useMemo to prevent unnecessary recalculations.

        For shared global state (e.g., settings shared between the settings panel and preview panel), a lightweight state manager like Zustand is recommended.

    Critical Performance Mandates:

        Web Worker: All FFmpeg commands (probe and transcode) must be executed in a Web Worker to prevent freezing the main UI thread. Custom hooks can be used to manage the worker's lifecycle and communication.

        Memory Management: The implementation must use FFmpeg's virtual file system (FS.createLazyFile or similar) to handle video files, preventing the entire file from being loaded into browser memory at once. This is critical for stability with large files.

    Image Compositing:

        Extracted frames will be drawn onto an offscreen HTML5 <canvas> element to create the final contact sheet. This logic should be encapsulated in a pure utility function.

        The canvas.toDataURL() or canvas.toBlob() method will be used to generate the downloadable image file.

6. Post-Launch Roadmap (Out of Scope for v3.0)

    Advanced Frame Selection: Options to extract frames based on scene detection or only I-frames (keyframes).

    Batch Processing: Support for loading and processing multiple videos in a queue.

    PDF Export: Implement a PDF output option using a library like pdf-lib.

    Dark Mode: DaisyUI provides theme support; this can be implemented with a simple theme-switching toggle.