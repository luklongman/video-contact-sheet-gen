import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface VideoMetadata {
  duration: number;
  fps: number;
  width: number;
  height: number;
  codec: string;
}

export interface ContactSheetOptions {
  startTime: number;
  endTime: number;
  frameCount: number;
  gridCols: number;
  gridRows: number;
  thumbnailWidth: number;
  thumbnailHeight: number;
  showTimestamps: boolean;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  padding: number;
}

export class VideoAnalyzer {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;
  private loadingPromise: Promise<void> | null = null;

  async loadFFmpeg(): Promise<void> {
    if (this.loaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this.initializeFFmpeg();
    await this.loadingPromise;
    this.loadingPromise = null;
  }

  private async initializeFFmpeg(): Promise<void> {
    this.ffmpeg = new FFmpeg();
    
    // Set up logging for debugging
    this.ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg:', message);
    });

    // Load FFmpeg core with proper CORS handling
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    try {
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      throw new Error('Failed to initialize FFmpeg. Please check your internet connection and try again.');
    }
  }

  async getBasicMetadata(file: File, onProgress?: (progress: number) => void): Promise<VideoMetadata> {
    if (!this.loaded) {
      await this.loadFFmpeg();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not loaded');
    }

    const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
    const allowedExts = ['mp4', 'mov', 'mkv', 'avi', 'webm', 'flv', 'wmv', 'm4v', 'ogv', '3gp', 'ts', 'mts', 'mxf'];
    const inputFileName = 'input.' + (allowedExts.includes(ext) ? ext : 'mp4');
    let logOutput = '';

    try {
      // Set up progress tracking
      if (onProgress) {
        this.ffmpeg.on('progress', ({ progress }) => {
          onProgress(progress);
        });
      }

      // Capture logs for metadata extraction
      this.ffmpeg.on('log', ({ message }) => {
        logOutput += message + '\n';
      });

      // Write input file to FFmpeg virtual file system
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Use ffprobe-like command to get metadata without transcoding
      // This is much faster than full transcoding
      await this.ffmpeg.exec([
        '-i', inputFileName,
        '-f', 'null',
        '-'
      ]);

      // Parse metadata from logs
      const metadata = this.parseMetadata(logOutput);
      
      // Validate the parsed metadata
      if (!this.isValidMetadata(metadata)) {
        // Try alternative approach with basic info extraction
        console.log('Trying alternative metadata extraction...');
        logOutput = '';
        
        // Reset log capture
        this.ffmpeg.on('log', ({ message }) => {
          logOutput += message + '\n';
        });

        // Simple probe command with more verbose output
        await this.ffmpeg.exec([
          '-i', inputFileName,
          '-v', 'verbose',
          '-f', 'null',
          '-'
        ]);

        const altMetadata = this.parseMetadata(logOutput);
        
        if (!this.isValidMetadata(altMetadata)) {
          throw new Error('Invalid video metadata extracted');
        }
        
        return altMetadata;
      }

      return metadata;

    } catch (error) {
      console.error('FFmpeg metadata extraction failed:', error);
      
      // Provide more specific error messages based on the error
      if (error instanceof Error) {
        if (error.message.includes('Invalid data found')) {
          throw new Error('This video file appears to be corrupted or in an unsupported format');
        } else if (error.message.includes('Permission denied')) {
          throw new Error('Unable to process video file due to permissions');
        } else if (error.message.includes('No such file')) {
          throw new Error('Video file could not be processed');
        }
      }
      
      throw new Error('Failed to extract video metadata. Please try a different video file.');
    } finally {
      // Clean up
      try {
        await this.ffmpeg.deleteFile(inputFileName);
      } catch (e) {
        // Ignore cleanup errors
        console.warn('Failed to cleanup temp file:', e);
      }
    }
  }

  private isValidMetadata(metadata: VideoMetadata): boolean {
    // More lenient validation - we need width/height and at least some duration/fps
    const hasBasicVideoInfo = metadata.width > 0 && metadata.height > 0;
    const hasTimeInfo = metadata.duration > 0 || metadata.fps > 0;
    
    const isValid = hasBasicVideoInfo && hasTimeInfo;

    if (!isValid) {
      console.error('Invalid metadata detected:', {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        fps: metadata.fps,
        codec: metadata.codec,
        hasBasicVideoInfo,
        hasTimeInfo
      });
    }

    return isValid;
  }

  async generateContactSheet(
    file: File,
    options: ContactSheetOptions,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    if (!this.loaded) {
      await this.loadFFmpeg();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not loaded');
    }

    const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
    const allowedExts = ['mp4', 'mov', 'mkv', 'avi', 'webm', 'flv', 'wmv', 'm4v', 'ogv', '3gp', 'ts', 'mts', 'mxf'];
    const inputFileName = 'input.' + (allowedExts.includes(ext) ? ext : 'mp4');
    const outputFileName = 'contact_sheet.png';

    try {
      // Set up progress tracking
      if (onProgress) {
        this.ffmpeg.on('progress', ({ progress }) => {
          onProgress(progress);
        });
      }

      // Write input file
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Calculate frame extraction parameters
      const duration = options.endTime - options.startTime;
      const frameInterval = duration / Math.max(1, options.frameCount - 1);
      const totalFrames = options.gridCols * options.gridRows;
      const framesToUse = Math.min(totalFrames, options.frameCount);

      // Generate individual frame files first
      const frameFiles: string[] = [];
      for (let i = 0; i < framesToUse; i++) {
        const timestamp = options.startTime + (i * frameInterval);
        const frameFileName = `frame_${i.toString().padStart(3, '0')}.png`;
        frameFiles.push(frameFileName);

        // Extract frame at specific timestamp
        await this.ffmpeg.exec([
          '-i', inputFileName,
          '-ss', timestamp.toFixed(2),
          '-vframes', '1',
          '-vf', `scale=${options.thumbnailWidth}:${options.thumbnailHeight}`,
          '-y',
          frameFileName
        ]);
      }

      // Create contact sheet by tiling the frames
      const tileFilter = `tile=${options.gridCols}x${options.gridRows}`;
      const inputArgs: string[] = [];
      
      // Add all frame files as inputs
      for (const frameFile of frameFiles) {
        inputArgs.push('-i', frameFile);
      }

      // Build the complex filter for tiling
      let filterComplex = '';
      for (let i = 0; i < frameFiles.length; i++) {
        filterComplex += `[${i}:v]`;
      }
      filterComplex += `concat=n=${frameFiles.length}:v=1:a=0[v];[v]${tileFilter}`;

      // Add padding if specified
      if (options.padding > 0) {
        filterComplex += `,pad=${options.thumbnailWidth * options.gridCols + options.padding * 2}:${options.thumbnailHeight * options.gridRows + options.padding * 2}:${options.padding}:${options.padding}:${options.backgroundColor}`;
      }

      // Add timestamp overlay if requested
      if (options.showTimestamps) {
        const timestampFilter = this.buildTimestampOverlay(options, frameInterval, framesToUse);
        if (timestampFilter) {
          filterComplex += `,${timestampFilter}`;
        }
      }

      // Generate the contact sheet
      const ffmpegArgs = [
        ...inputArgs,
        '-filter_complex', filterComplex,
        '-y',
        outputFileName
      ];

      console.log('Executing FFmpeg command:', ffmpegArgs.join(' '));
      await this.ffmpeg.exec(ffmpegArgs);

      // Read the generated contact sheet
      const contactSheetData = await this.ffmpeg.readFile(outputFileName);
      const contactSheetBlob = new Blob([contactSheetData], { type: 'image/png' });

      // Clean up frame files
      for (const frameFile of frameFiles) {
        try {
          await this.ffmpeg.deleteFile(frameFile);
        } catch (e) {
          console.warn('Failed to cleanup frame file:', frameFile, e);
        }
      }

      // Clean up output file
      await this.ffmpeg.deleteFile(outputFileName);

      return contactSheetBlob;

    } catch (error) {
      console.error('Contact sheet generation failed:', error);
      throw new Error('Failed to generate contact sheet from video');
    } finally {
      // Clean up input file
      try {
        await this.ffmpeg.deleteFile(inputFileName);
      } catch (e) {
        console.warn('Failed to cleanup input file:', e);
      }
    }
  }

  private buildContactSheetFilter(options: ContactSheetOptions, timestamps: string[]): string {
    const {
      gridCols,
      gridRows,
      thumbnailWidth,
      thumbnailHeight,
      showTimestamps,
      backgroundColor,
      textColor,
      fontSize,
      padding
    } = options;

    // Calculate total frames needed
    const totalFrames = gridCols * gridRows;
    const framesToUse = Math.min(totalFrames, timestamps.length);

    // For contact sheet generation, we need to use the select filter to extract frames
    // at specific timestamps, then tile them together
    
    // First, extract frames at specific timestamps using select filter
    // We'll use the fps filter to extract frames at the right times
    let filterChain = '';
    
    // Scale to thumbnail size first
    filterChain += `scale=${thumbnailWidth}:${thumbnailHeight}`;
    
    // Add background padding
    if (padding > 0) {
      filterChain += `,pad=${thumbnailWidth + padding * 2}:${thumbnailHeight + padding * 2}:${padding}:${padding}:${backgroundColor}`;
    }
    
    // Use tile filter to arrange frames in a grid
    filterChain += `,tile=${gridCols}x${gridRows}`;

    // Add timestamp overlay if requested
    if (showTimestamps) {
      const timestampFilter = this.buildTimestampFilter(options, timestamps, framesToUse);
      if (timestampFilter) {
        filterChain += `,${timestampFilter}`;
      }
    }

    return filterChain;
  }

  private buildTimestampOverlay(options: ContactSheetOptions, frameInterval: number, frameCount: number): string {
    const { gridCols, thumbnailWidth, thumbnailHeight, textColor, fontSize, padding } = options;
    
    // Create drawtext filters for each timestamp
    const drawTextFilters: string[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      const row = Math.floor(i / gridCols);
      const col = i % gridCols;
      
      // Calculate position for timestamp
      const x = col * thumbnailWidth + padding + 5;
      const y = row * thumbnailHeight + thumbnailHeight - fontSize - 5 + padding;
      
      // Calculate timestamp
      const timestamp = options.startTime + (i * frameInterval);
      const minutes = Math.floor(timestamp / 60);
      const seconds = Math.floor(timestamp % 60);
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      drawTextFilters.push(`drawtext=text='${formattedTime}':x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=${textColor}:box=1:boxcolor=black@0.5:boxborderw=2`);
    }
    
    return drawTextFilters.join(',');
  }

  private buildTimestampFilter(options: ContactSheetOptions, timestamps: string[], frameCount: number): string {
    const { gridCols, thumbnailWidth, thumbnailHeight, textColor, fontSize, padding } = options;
    
    // Create drawtext filters for each timestamp
    const drawTextFilters: string[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      const row = Math.floor(i / gridCols);
      const col = i % gridCols;
      
      // Calculate position for timestamp
      const x = col * (thumbnailWidth + padding * 2) + padding;
      const y = row * (thumbnailHeight + padding * 2) + thumbnailHeight + padding - fontSize - 5;
      
      // Format timestamp as MM:SS
      const timestamp = parseFloat(timestamps[i]);
      const minutes = Math.floor(timestamp / 60);
      const seconds = Math.floor(timestamp % 60);
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      drawTextFilters.push(`drawtext=text='${formattedTime}':x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=${textColor}:box=1:boxcolor=black@0.5`);
    }
    
    return drawTextFilters.join(',');
  }

  // Keep this method for future use with FFmpeg if needed
  async analyzeVideo(file: File, onProgress?: (progress: number) => void): Promise<VideoMetadata> {
    // For the simplified approach, this is the same as getBasicMetadata
    return this.getBasicMetadata(file, onProgress);
  }

  async extractFrames(
    file: File,
    startTime: number,
    endTime: number,
    interval: number,
    onProgress?: (progress: number) => void
  ): Promise<Blob[]> {
    if (!this.loaded) {
      await this.loadFFmpeg();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not loaded');
    }

    const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
    const allowedExts = ['mp4', 'mov', 'mkv', 'avi', 'webm', 'flv', 'wmv', 'm4v', 'ogv', '3gp', 'ts', 'mts', 'mxf'];
    const inputFileName = 'input.' + (allowedExts.includes(ext) ? ext : 'mp4');
    const frames: Blob[] = [];

    try {
      // Set up progress tracking
      if (onProgress) {
        this.ffmpeg.on('progress', ({ progress }) => {
          onProgress(progress);
        });
      }

      // Write input file
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Extract frames at specified intervals
      const duration = endTime - startTime;
      const frameCount = Math.floor(duration / interval);
      const framesToExtract = Math.max(1, frameCount);

      for (let i = 0; i < framesToExtract; i++) {
        const timestamp = startTime + (i * interval);
        const outputFileName = `frame_${i.toString().padStart(6, '0')}.jpg`;

        // Use more efficient frame extraction
        await this.ffmpeg.exec([
          '-i', inputFileName,
          '-ss', timestamp.toString(),
          '-vframes', '1',
          '-q:v', '2',
          '-f', 'image2',
          outputFileName
        ]);

        // Read the frame
        const frameData = await this.ffmpeg.readFile(outputFileName);
        const frameBlob = new Blob([frameData], { type: 'image/jpeg' });
        frames.push(frameBlob);

        // Clean up frame file immediately to save memory
        await this.ffmpeg.deleteFile(outputFileName);
      }

      return frames;

    } catch (error) {
      console.error('Frame extraction failed:', error);
      throw new Error('Failed to extract frames from video');
    } finally {
      // Clean up input file
      try {
        await this.ffmpeg.deleteFile(inputFileName);
      } catch (e) {
        console.warn('Failed to cleanup input file:', e);
      }
    }
  }

  // Utility method to check if FFmpeg is loaded
  isLoaded(): boolean {
    return this.loaded && this.ffmpeg !== null;
  }

  // Utility method to get FFmpeg version info
  async getFFmpegInfo(): Promise<string> {
    if (!this.loaded) {
      await this.loadFFmpeg();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not loaded');
    }

    try {
      let versionInfo = '';
      
      // Capture version output
      this.ffmpeg.on('log', ({ message }) => {
        versionInfo += message + '\n';
      });

      await this.ffmpeg.exec(['-version']);
      
      return versionInfo;
    } catch (error) {
      console.error('Failed to get FFmpeg version:', error);
      return 'FFmpeg version information not available';
    }
  }

  // This method is no longer used in the simplified flow
  async updateMetadataWithDetails(file: File, basicMetadata: VideoMetadata, onProgress?: (progress: number) => void): Promise<VideoMetadata> {
    // For the simplified approach, we just return the metadata we already have
    return basicMetadata;
  }

  private parseMetadata(logOutput: string): VideoMetadata {
    console.log('Parsing FFmpeg logs for metadata...');
    console.log('Log output:', logOutput);
    
    // Parse duration - more robust regex patterns
    const durationMatch = logOutput.match(/Duration:\s*(\d+):(\d+):(\d+)\.(\d+)/) ||
                         logOutput.match(/Duration:\s*(\d+):(\d+):(\d+)/);
    let duration = 0;
    if (durationMatch) {
      const hours = parseInt(durationMatch[1], 10);
      const minutes = parseInt(durationMatch[2], 10);
      const seconds = parseInt(durationMatch[3], 10);
      const centiseconds = durationMatch[4] ? parseInt(durationMatch[4], 10) : 0;
      duration = hours * 3600 + minutes * 60 + seconds + (centiseconds / 100);
    }

    // Parse frame rate - handle the specific format from your log
    // Example: "1280x720 [SAR 1:1 DAR 16:9], q=2-31, 200 kb/s, 24 fps, 24 tbn"
    const fpsMatch = logOutput.match(/,\s*(\d+\.?\d*)\s*fps/) || 
                     logOutput.match(/(\d+\.?\d*)\s*fps/) ||
                     logOutput.match(/(\d+\.?\d*)\s*tbr/) ||
                     logOutput.match(/(\d+\.?\d*)\s*tb\(r\)/) ||
                     logOutput.match(/r_frame_rate=(\d+)\/(\d+)/);
    
    let fps = 30; // default fallback
    if (fpsMatch) {
      if (fpsMatch[2]) {
        // Handle fraction format like "30/1"
        fps = parseInt(fpsMatch[1], 10) / parseInt(fpsMatch[2], 10);
      } else {
        fps = parseFloat(fpsMatch[1]);
      }
    }

    // Parse resolution - handle the specific format from your log
    // Example: "wrapped_avframe, yuv422p10le(tv, bt709, progressive), 1280x720 [SAR 1:1 DAR 16:9]"
    const resolutionMatch = logOutput.match(/(\d+)x(\d+)\s*\[/) || // Format with brackets
                           logOutput.match(/(\d+)x(\d+)\s*,/) ||    // Format with comma
                           logOutput.match(/(\d+)x(\d+)/) ||        // Basic format
                           logOutput.match(/Video:.*?(\d+)x(\d+)/) ||
                           logOutput.match(/Stream.*?(\d+)x(\d+)/);
    
    let width = 0;
    let height = 0;
    if (resolutionMatch) {
      width = parseInt(resolutionMatch[1], 10);
      height = parseInt(resolutionMatch[2], 10);
    }

    // Parse codec - handle the specific format from your log
    // Example: "Video: wrapped_avframe, yuv422p10le"
    const codecMatch = logOutput.match(/Video:\s*([a-zA-Z0-9_]+)/) ||
                      logOutput.match(/Codec:\s*([a-zA-Z0-9_]+)/) ||
                      logOutput.match(/Stream.*?Video:\s*([a-zA-Z0-9_]+)/);
    const codec = codecMatch ? codecMatch[1] : 'h264'; // default fallback

    // Additional validation and fallbacks
    if (duration === 0) {
      // Try alternative duration parsing
      const altDurationMatch = logOutput.match(/time=(\d+):(\d+):(\d+)\.(\d+)/);
      if (altDurationMatch) {
        const hours = parseInt(altDurationMatch[1], 10);
        const minutes = parseInt(altDurationMatch[2], 10);
        const seconds = parseInt(altDurationMatch[3], 10);
        const centiseconds = parseInt(altDurationMatch[4], 10);
        duration = hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
      }
    }

    const metadata = {
      duration,
      fps,
      width,
      height,
      codec
    };

    console.log('Parsed metadata:', metadata);
    return metadata;
  }
}

export const videoAnalyzer = new VideoAnalyzer();
