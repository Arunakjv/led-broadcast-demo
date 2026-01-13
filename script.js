// Updated handleVideoUpload method
async handleVideoUpload(files) {
    const uploadArea = document.getElementById('upload-area');
    const progressContainer = document.getElementById('upload-progress');
    
    // Show drag over effect
    uploadArea.classList.add('drag-over');
    
    // Process each file
    for (const file of files) {
        if (!this.config.supportedFormats.includes(file.type)) {
            this.log(`Unsupported format: ${file.type}`, 'error');
            continue;
        }
        
        if (file.size > this.config.maxFileSize) {
            this.log(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max 100MB`, 'error');
            continue;
        }
        
        // Create progress item
        const progressId = `progress-${Date.now()}`;
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `
            <div class="progress-header">
                <span>${file.name}</span>
                <span>0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        `;
        progressContainer.appendChild(progressItem);
        
        try {
            // Upload and process video
            const videoData = await this.processVideoFile(file, progressItem);
            
            this.state.content.push(videoData);
            this.state.statistics.totalUploads++;
            
            // Update displays
            this.updateContentGrid();
            this.updateBroadcastContentSelect();
            
            this.log(`Video uploaded: ${file.name}`, 'success');
            
            // Test playback immediately
            setTimeout(() => this.testVideoPlayback(videoData.id), 1000);
            
        } catch (error) {
            this.log(`Upload failed: ${error.message}`, 'error');
            progressItem.remove();
            continue;
        }
        
        // Remove progress item after delay
        setTimeout(() => {
            if (progressItem.parentElement) {
                progressItem.remove();
            }
        }, 3000);
    }
    
    // Remove drag over effect
    uploadArea.classList.remove('drag-over');
    
    // Save state
    this.saveState();
}

// NEW: Process video file with proper handling
async processVideoFile(file, progressItem) {
    return new Promise((resolve, reject) => {
        // Create video element to check compatibility
        const video = document.createElement('video');
        const videoUrl = URL.createObjectURL(file);
        
        let videoChecked = false;
        
        // Update progress
        const updateProgress = (percent, message = '') => {
            if (progressItem) {
                const progressFill = progressItem.querySelector('.progress-fill');
                const progressText = progressItem.querySelector('.progress-header span:last-child');
                
                if (progressFill) progressFill.style.width = `${percent}%`;
                if (progressText) progressText.textContent = `${Math.round(percent)}% ${message}`;
            }
        };
        
        updateProgress(10, 'Checking video...');
        
        // Set up video event listeners
        video.addEventListener('loadedmetadata', () => {
            updateProgress(30, 'Processing...');
            
            // Check if video is playable
            videoChecked = true;
            
            // Get video properties
            const duration = Math.round(video.duration) || Math.floor(Math.random() * 120) + 10;
            const resolution = video.videoWidth && video.videoHeight ? 
                `${video.videoWidth}x${video.videoHeight}` : '1920x1080';
            
            // Generate thumbnail
            this.generateThumbnailFromVideo(video).then(thumbnail => {
                updateProgress(70, 'Creating thumbnail...');
                
                // Create video data object
                const videoData = {
                    id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: file.name.replace(/\.[^/.]+$/, ""),
                    filename: file.name,
                    fileObject: file, // Store the file object for later use
                    url: videoUrl, // Keep Object URL
                    duration: duration,
                    size: this.formatFileSize(file.size),
                    resolution: resolution,
                    format: file.type.split('/')[1] || 'mp4',
                    thumbnail: thumbnail,
                    uploaded: new Date().toISOString(),
                    isSample: false,
                    mimeType: file.type,
                    codec: this.getVideoCodec(video),
                    playable: true // Mark as playable
                };
                
                updateProgress(100, 'Complete!');
                
                // Clean up
                setTimeout(() => URL.revokeObjectURL(videoUrl), 5000);
                
                resolve(videoData);
            }).catch(error => {
                reject(new Error('Thumbnail generation failed'));
            });
        });
        
        video.addEventListener('error', () => {
            if (!videoChecked) {
                reject(new Error('Video format not supported or corrupted'));
                URL.revokeObjectURL(videoUrl);
            }
        });
        
        // Set video source and load
        video.src = videoUrl;
        video.load();
        
        // Timeout after 30 seconds
        setTimeout(() => {
            if (!videoChecked) {
                reject(new Error('Video processing timeout'));
                URL.revokeObjectURL(videoUrl);
            }
        }, 30000);
    });
}

// NEW: Test video playback
async testVideoPlayback(videoId) {
    const videoData = this.state.content.find(c => c.id === videoId);
    if (!videoData || !videoData.playable) return;
    
    const testVideo = document.createElement('video');
    testVideo.muted = true; // Mute for testing
    testVideo.preload = 'metadata';
    
    return new Promise((resolve) => {
        testVideo.addEventListener('loadeddata', () => {
            this.log(`✓ Video "${videoData.name}" is playable`, 'success');
            testVideo.remove();
            resolve(true);
        });
        
        testVideo.addEventListener('error', (e) => {
            console.error('Video playback error:', e);
            videoData.playable = false;
            this.log(`✗ Video "${videoData.name}" has playback issues`, 'warning');
            testVideo.remove();
            resolve(false);
        });
        
        // Use Object URL if available, otherwise create new one
        if (videoData.url && videoData.url.startsWith('blob:')) {
            testVideo.src = videoData.url;
        } else if (videoData.fileObject) {
            testVideo.src = URL.createObjectURL(videoData.fileObject);
        } else {
            resolve(false);
        }
    });
}

// NEW: Generate thumbnail from video element
async generateThumbnailFromVideo(video) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Seek to a good frame (25% or 2 seconds)
        const seekTime = Math.min(video.duration * 0.25, 2);
        video.currentTime = seekTime;
        
        const onSeeked = () => {
            // Draw video frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Add play button overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(150, 100, 30, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(140, 85);
            ctx.lineTo(160, 100);
            ctx.lineTo(140, 115);
            ctx.closePath();
            ctx.fill();
            
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            // Clean up
            video.removeEventListener('seeked', onSeeked);
            canvas.remove();
            
            resolve(thumbnailUrl);
        };
        
        video.addEventListener('seeked', onSeeked);
        
        // Fallback after 3 seconds
        setTimeout(() => {
            if (canvas.parentElement) {
                const fallback = this.createFallbackThumbnail({
                    name: 'video',
                    type: video.src.includes('mp4') ? 'video/mp4' : 'video/webm'
                });
                resolve(fallback);
            }
        }, 3000);
    });
}

// NEW: Get video codec information
getVideoCodec(video) {
    // This is a simplified check - actual codec detection is complex
    try {
        // Try to play to detect codec support
        video.play().then(() => {
            video.pause();
        }).catch(() => {
            // Play failed, likely codec issue
        });
        
        // Return best guess based on file type
        if (video.src.includes('.mp4')) return 'h264';
        if (video.src.includes('.webm')) return 'vp8/vp9';
        return 'unknown';
    } catch {
        return 'unknown';
    }
}

// NEW: Create fallback thumbnail
createFallbackThumbnail(file) {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Color based on file type
    const colors = {
        'mp4': ['#667eea', '#764ba2'],
        'webm': ['#f093fb', '#f5576c'],
        'mov': ['#4facfe', '#00f2fe'],
        'avi': ['#43e97b', '#38f9d7'],
        'default': ['#667eea', '#764ba2']
    };
    
    const ext = file.name.split('.').pop().toLowerCase() || 'default';
    const colorPair = colors[ext] || colors.default;
    
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
    
    // File info
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(ext.toUpperCase(), 150, 170);
    
    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
    canvas.remove();
    
    return thumbnailUrl;
}
