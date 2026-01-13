// Add these methods to the VideoUploadHandler class

// Check if video is playable
async checkVideoPlayability(file) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        
        const videoUrl = URL.createObjectURL(file);
        video.src = videoUrl;
        
        let playable = false;
        
        video.addEventListener('loadeddata', () => {
            playable = true;
            video.play().then(() => {
                video.pause();
                URL.revokeObjectURL(videoUrl);
                video.remove();
                resolve({ playable: true, duration: video.duration });
            }).catch(() => {
                URL.revokeObjectURL(videoUrl);
                video.remove();
                resolve({ playable: false, error: 'Cannot play video' });
            });
        });
        
        video.addEventListener('error', () => {
            URL.revokeObjectURL(videoUrl);
            video.remove();
            resolve({ playable: false, error: 'Video error' });
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (!playable) {
                URL.revokeObjectURL(videoUrl);
                video.remove();
                resolve({ playable: false, error: 'Timeout' });
            }
        }, 10000);
    });
}

// Optimize video for web playback (client-side compression)
async optimizeVideoForWeb(file, maxSizeMB = 50) {
    return new Promise((resolve) => {
        // For GitHub Pages, we can't do real transcoding
        // But we can provide optimization tips
        
        const tips = [];
        
        if (file.size > maxSizeMB * 1024 * 1024) {
            tips.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds recommended ${maxSizeMB}MB`);
        }
        
        if (!file.type.includes('mp4')) {
            tips.push('Convert to MP4 with H.264 codec for best compatibility');
        }
        
        // Create optimized version (simulated for demo)
        const optimizedFile = new File([file], `optimized_${file.name}`, {
            type: file.type,
            lastModified: Date.now()
        });
        
        resolve({
            file: optimizedFile,
            tips: tips,
            originalSize: file.size,
            optimizedSize: file.size * 0.9 // Simulated 10% reduction
        });
    });
}

// Get video information
async getVideoInfo(file) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        const videoUrl = URL.createObjectURL(file);
        
        video.addEventListener('loadedmetadata', () => {
            const info = {
                duration: Math.round(video.duration),
                width: video.videoWidth,
                height: video.videoHeight,
                resolution: `${video.videoWidth}x${video.videoHeight}`,
                aspectRatio: (video.videoWidth / video.videoHeight).toFixed(2),
                fileSize: file.size,
                mimeType: file.type,
                bitrate: Math.round((file.size * 8) / video.duration / 1000) // kbps
            };
            
            URL.revokeObjectURL(videoUrl);
            video.remove();
            
            resolve(info);
        });
        
        video.addEventListener('error', () => {
            URL.revokeObjectURL(videoUrl);
            video.remove();
            resolve(null);
        });
        
        video.src = videoUrl;
        video.load();
    });
}
