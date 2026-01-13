// Video Upload Handler for GitHub Pages
// Handles video uploads, processing, and thumbnail generation

class VideoUploadHandler {
    constructor() {
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
        this.supportedFormats = [
            'video/mp4',
            'video/webm',
            'video/ogg',
            'video/quicktime',
            'video/x-msvideo',
            'video/x-matroska'
        ];
        
        this.videoExtensions = {
            'video/mp4': '.mp4',
            'video/webm': '.webm',
            'video/ogg': '.ogv',
            'video/quicktime': '.mov',
            'video/x-msvideo': '.avi',
            'video/x-matroska': '.mkv'
        };
    }
    
    // Validate video file
    validateVideo(file) {
        // Check file type
        if (!this.supportedFormats.includes(file.type)) {
            throw new Error(`Unsupported video format: ${file.type}. Please use MP4, WebM, or MOV.`);
        }
        
        // Check file size
        if (file.size > this.maxFileSize) {
            throw new Error(`File too large: ${this.formatFileSize(file.size)}. Maximum size is 100MB.`);
        }
        
        // Check file name
        if (!file.name.match(/\.(mp4|webm|mov|avi|mkv|ogv)$/i)) {
            throw new Error('Invalid file extension. Please use .mp4, .webm, or .mov files.');
        }
        
        return true;
    }
    
    // Generate thumbnail from video
    async generateThumbnail(videoFile) {
        return new Promise((resolve) => {
            // Create video element
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions
            canvas.width = 300;
            canvas.height = 200;
            
            // Create object URL for video
            const videoUrl = URL.createObjectURL(videoFile);
            
            // Set video source
            video.src = videoUrl;
            
            // When video metadata is loaded
            video.addEventListener('loadedmetadata', () => {
                // Seek to 25% of duration or 2 seconds, whichever is smaller
                const seekTime = Math.min(video.duration * 0.25, 2);
                video.currentTime = seekTime;
            });
            
            // When video seeks to time
            video.addEventListener('seeked', () => {
                // Draw video frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Create gradient overlay for better text visibility
                const gradient = ctx.createLinearGradient(0, canvas.height - 50, 0, canvas.height);
                gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
                
                // Add play button icon
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.moveTo(135, 85);
                ctx.lineTo(165, 100);
                ctx.lineTo(135, 115);
                ctx.closePath();
                ctx.fill();
                
                // Add file type text
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(this.getFormatName(videoFile.type).toUpperCase(), 150, 185);
                
                // Get data URL
                const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                // Clean up
                URL.revokeObjectURL(videoUrl);
                video.remove();
                canvas.remove();
                
                resolve(thumbnailUrl);
            });
            
            // Error handling
            video.addEventListener('error', () => {
                // Fallback to colored thumbnail
                resolve(this.createFallbackThumbnail(videoFile));
                URL.revokeObjectURL(videoUrl);
            });
            
            // Load video
            video.load();
        });
    }
    
    // Create fallback thumbnail
    createFallbackThumbnail(file) {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Generate color based on file name
        const colors = [
            ['#667eea', '#764ba2'],
            ['#f093fb', '#f5576c'],
            ['#4facfe', '#00f2fe'],
            ['#43e97b', '#38f9d7'],
            ['#fa709a', '#fee140']
        ];
        
        const colorPair = colors[Math.floor(Math.random() * colors.length)];
        const gradient = ctx.createLinearGradient(0, 0, 300, 200);
        gradient.addColorStop(0, colorPair[0]);
        gradient.addColorStop(1, colorPair[1]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 300, 200);
        
        // Play icon
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.moveTo(120, 70);
        ctx.lineTo(180, 100);
        ctx.lineTo(120, 130);
        ctx.closePath();
        ctx.fill();
        
        // File name
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.getFormatName(file.type).toUpperCase(), 150, 170);
        
        return canvas.toDataURL();
    }
    
    // Get video duration (simulated for GitHub Pages)
    async getVideoDuration(file) {
        return new Promise((resolve) => {
            // For GitHub Pages demo, simulate duration
            const video = document.createElement('video');
            const videoUrl = URL.createObjectURL(file);
            
            video.src = videoUrl;
            video.addEventListener('loadedmetadata', () => {
                const duration = Math.round(video.duration);
                URL.revokeObjectURL(videoUrl);
                video.remove();
                resolve(duration || Math.floor(Math.random() * 120) + 10);
            });
            
            video.addEventListener('error', () => {
                URL.revokeObjectURL(videoUrl);
                video.remove();
                resolve(Math.floor(Math.random() * 120) + 10); // 10-130 seconds
            });
            
            video.load();
        });
    }
    
    // Get video resolution (simulated)
    async getVideoResolution(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const videoUrl = URL.createObjectURL(file);
            
            video.src = videoUrl;
            video.addEventListener('loadedmetadata', () => {
                const resolution = `${video.videoWidth}x${video.videoHeight}`;
                URL.revokeObjectURL(videoUrl);
                video.remove();
                resolve(resolution || '1920x1080');
            });
            
            video.addEventListener('error', () => {
                URL.revokeObjectURL(videoUrl);
                video.remove();
                resolve('1920x1080'); // Default to 1080p
            });
            
            video.load();
        });
    }
    
    // Get format name from MIME type
    getFormatName(mimeType) {
        const formatMap = {
            'video/mp4': 'MP4',
            'video/webm': 'WebM',
            'video/ogg': 'OGG',
            'video/quicktime': 'MOV',
            'video/x-msvideo': 'AVI',
            'video/x-matroska': 'MKV'
        };
        
        return formatMap[mimeType] || mimeType.split('/')[1] || 'Video';
    }
    
    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Create video data object
    async createVideoData(file) {
        try {
            // Validate file
            this.validateVideo(file);
            
            // Get video properties
            const duration = await this.getVideoDuration(file);
            const resolution = await this.getVideoResolution(file);
            const thumbnail = await this.generateThumbnail(file);
            
            // Create video data object
            const videoData = {
                id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                filename: file.name,
                url: URL.createObjectURL(file),
                duration: duration,
                size: this.formatFileSize(file.size),
                resolution: resolution,
                format: this.getFormatName(file.type),
                thumbnail: thumbnail,
                uploaded: new Date().toISOString(),
                isSample: false,
                mimeType: file.type
            };
            
            return videoData;
            
        } catch (error) {
            console.error('Error creating video data:', error);
            throw error;
        }
    }
    
    // Clean up object URLs
    cleanupObjectURLs(videoDataArray) {
        videoDataArray.forEach(videoData => {
            if (videoData.url && !videoData.isSample) {
                URL.revokeObjectURL(videoData.url);
            }
        });
    }
}

// Create global instance
const videoUploader = new VideoUploadHandler();

// Make available globally
window.videoUploader = videoUploader;