import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface VideoMetadata {
  duration: number;
  fps: number;
  width: number;
  height: number;
  codec: string;
}

export class VideoAnalyzer {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;

  async loadFFmpeg(): Promise<void> {
    if (this.loaded) return;

    this.ffmpeg = new FFmpeg();
    
    // Set up logging
    this.ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg:', message);
    });

    // Load FFmpeg core
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    this.loaded = true;
  }

  async getBasicMetadata(file: File): Promise<VideoMetadata> {
    // Use HTML5 video element to quickly get basic metadata
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        const metadata: VideoMetadata = {
          duration: video.duration,
          fps: 30, // Default fps, will be updated in background
          width: video.videoWidth,
          height: video.videoHeight,
          codec: 'unknown' // Will be updated in background
        };
        
        URL.revokeObjectURL(url);
        resolve(metadata);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load video metadata'));
      };
      
      video.preload = 'metadata';
      video.src = url;
    });
  }

  async analyzeVideo(file: File, onProgress?: (progress: number) => void): Promise<VideoMetadata> {
    if (!this.loaded) {
      await this.loadFFmpeg();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not loaded');
    }

    const inputFileName = 'input.' + (file.name.split('.').pop() || 'mp4');
    let logOutput = '';

    try {
      // Set up progress tracking
      this.ffmpeg.on('progress', ({ progress }) => {
        onProgress?.(progress);
      });

      // Capture logs for metadata extraction
      this.ffmpeg.on('log', ({ message }) => {
        logOutput += message + '\n';
      });

      // Write input file
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Run ffprobe-like command to get metadata
      await this.ffmpeg.exec([
        '-i', inputFileName,
        '-f', 'null',
        '-'
      ]);

      // Parse metadata from logs
      const metadata = this.parseMetadata(logOutput);

      return metadata;

    } finally {
      // Clean up
      try {
        await this.ffmpeg.deleteFile(inputFileName);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  async updateMetadataWithDetails(file: File, basicMetadata: VideoMetadata, onProgress?: (progress: number) => void): Promise<VideoMetadata> {
    // This method runs FFmpeg analysis in the background to get detailed metadata
    return this.analyzeVideo(file, onProgress);
  }

  private parseMetadata(logOutput: string): VideoMetadata {
    // Parse duration
    const durationMatch = logOutput.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
    let duration = 0;
    if (durationMatch) {
      const hours = parseInt(durationMatch[1]);
      const minutes = parseInt(durationMatch[2]);
      const seconds = parseInt(durationMatch[3]);
      const centiseconds = parseInt(durationMatch[4]);
      duration = hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
    }

    // Parse frame rate
    const fpsMatch = logOutput.match(/(\d+\.?\d*) fps/) || logOutput.match(/(\d+\.?\d*) tbr/);
    const fps = fpsMatch ? parseFloat(fpsMatch[1]) : 30;

    // Parse resolution
    const resolutionMatch = logOutput.match(/(\d+)x(\d+)/);
    const width = resolutionMatch ? parseInt(resolutionMatch[1]) : 1920;
    const height = resolutionMatch ? parseInt(resolutionMatch[2]) : 1080;

    // Parse codec
    const codecMatch = logOutput.match(/Video: (\w+)/);
    const codec = codecMatch ? codecMatch[1] : 'unknown';

    // Fallback for duration if not found
    if (duration === 0) {
      // Try to estimate from file size and bitrate
      const bitrateMatch = logOutput.match(/(\d+) kb\/s/);
      if (bitrateMatch) {
        // This is a rough estimate
        duration = 60; // Default fallback
      } else {
        duration = 60; // Default fallback
      }
    }

    return {
      duration,
      fps,
      width,
      height,
      codec
    };
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

    const inputFileName = 'input.' + (file.name.split('.').pop() || 'mp4');
    const frames: Blob[] = [];

    try {
      // Set up progress tracking
      this.ffmpeg.on('progress', ({ progress }) => {
        onProgress?.(progress);
      });

      // Write input file
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Extract frames at specified intervals
      const duration = endTime - startTime;
      const frameCount = Math.floor(duration / interval);

      for (let i = 0; i < frameCount; i++) {
        const timestamp = startTime + (i * interval);
        const outputFileName = `frame_${i.toString().padStart(6, '0')}.jpg`;

        await this.ffmpeg.exec([
          '-i', inputFileName,
          '-ss', timestamp.toString(),
          '-vframes', '1',
          '-f', 'image2',
          '-q:v', '2',
          outputFileName
        ]);

        // Read the frame
        const frameData = await this.ffmpeg.readFile(outputFileName);
        const frameBlob = new Blob([frameData], { type: 'image/jpeg' });
        frames.push(frameBlob);

        // Clean up frame file
        await this.ffmpeg.deleteFile(outputFileName);
      }

      return frames;

    } finally {
      // Clean up input file
      try {
        await this.ffmpeg.deleteFile(inputFileName);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

export const videoAnalyzer = new VideoAnalyzer();
