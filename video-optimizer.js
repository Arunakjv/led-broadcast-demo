// Video Optimizer for GitHub Pages
// Provides client-side video optimization suggestions

class VideoOptimizer {
    constructor() {
        this.optimalSettings = {
            maxSizeMB: 50,
            preferredFormats: ['video/mp4', 'video/webm'],
            maxDuration: 300, // 5 minutes
            maxResolution: '3840x2160', // 4K
            bitrateRanges: {
                '720p': { min: 2500, max: 5000 }, // kbps
                '1080p': { min: 5000, max: 10000 },
                '4K': { min: 15000, max: 50000 }
            }
        };
    }
    
    // Analyze video and provide optimization tips
    async analyzeVideo(file) {
        const analysis = {
            file: file,
            name: file.name,
            size: file.size,
            sizeMB: (file.size / 1024 / 1024).toFixed(2),
            format: file.type,
            issues: [],
            suggestions: [],
            score: 100, // Start with perfect score
            optimized: false
        };
        
        // Check file size
        if (file.size > this.optimalSettings.maxSizeMB * 1024 * 1024) {
            analysis.score -= 30;
            analysis.issues.push({
                type: 'size',
                message: `File size (${analysis.sizeMB}MB) exceeds ${this.optimalSettings.maxSizeMB}MB limit`,
                severity: 'high'
            });
            analysis.suggestions.push('Compress video to reduce file size');
        } else if (file.size > 20 * 1024 * 1024) {
            analysis.score -= 10;
            analysis.issues.push({
                type: 'size',
                message: `File size (${analysis.sizeMB}MB) is large`,
                severity: 'medium'
            });
        }
        
        // Check format
        if (!this.optimalSettings.preferredFormats.includes(file.type)) {
            analysis.score -= 20;
            analysis.issues.push({
                type: 'format',
                message: `Format ${file.type.split('/')[1]} is not optimal`,
                severity: 'medium'
            });
            analysis.suggestions.push('Convert to MP4 with H.264 codec');
        }
        
        // Try to get video metadata
        try {
            const videoInfo = await this.getVideoInfo(file);
            Object.assign(analysis, videoInfo);
            
            // Check duration
            if (videoInfo.duration > this.optimalSettings.maxDuration) {
                analysis.score -= 20;
                analysis.issues.push({
                    type: 'duration',
                    message: `Duration (${videoInfo.duration}s) is too long`,
                    severity: 'medium'
                });
                analysis.suggestions.push('Trim video to under 5 minutes');
            }
            
            // Check resolution
            const [width, height] = videoInfo.resolution.split('x').map(Number);
            const [maxWidth, maxHeight] = this.optimalSettings.maxResolution.split('x').map(Number);
            
            if (width > maxWidth || height > maxHeight) {
                analysis.score -= 15;
                analysis.issues.push({
                    type: 'resolution',
                    message: `Resolution ${videoInfo.resolution} is higher than 4K`,
                    severity: 'medium'
                });
                analysis.suggestions.push('Downscale to 1080p or 720p');
            }
            
            // Check bitrate
            if (videoInfo.bitrate) {
                const resolution = width >= 3840 ? '4K' : width >= 1920 ? '1080p' : '720p';
                const bitrateRange = this.optimalSettings.bitrateRanges[resolution];
                
                if (bitrateRange && videoInfo.bitrate > bitrateRange.max) {
                    analysis.score -= 10;
                    analysis.issues.push({
                        type: 'bitrate',
                        message: `Bitrate (${videoInfo.bitrate}kbps) is high for ${resolution}`,
                        severity: 'low'
                    });
                    analysis.suggestions.push('Reduce bitrate for better streaming');
                }
            }
            
        } catch (error) {
            analysis.issues.push({
                type: 'metadata',
                message: 'Could not read video metadata',
                severity: 'high'
            });
            analysis.score -= 25;
        }
        
        // Determine if optimization is needed
        analysis.needsOptimization = analysis.score < 80;
        analysis.optimizationUrgency = analysis.score < 60 ? 'high' : 
                                      analysis.score < 80 ? 'medium' : 'low';
        
        return analysis;
    }
    
    // Get video information
    async getVideoInfo(file) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const videoUrl = URL.createObjectURL(file);
            
            video.addEventListener('loadedmetadata', () => {
                const info = {
                    duration: Math.round(video.duration),
                    width: video.videoWidth,
                    height: video.videoHeight,
                    resolution: `${video.videoWidth}x${video.videoHeight}`,
                    aspectRatio: (video.videoWidth / video.videoHeight).toFixed(2),
                    bitrate: Math.round((file.size * 8) / video.duration / 1000), // kbps
                    playable: true,
                    metadataLoaded: true
                };
                
                URL.revokeObjectURL(videoUrl);
                video.remove();
                resolve(info);
            });
            
            video.addEventListener('error', () => {
                URL.revokeObjectURL(videoUrl);
                video.remove();
                reject(new Error('Could not load video metadata'));
            });
            
            video.src = videoUrl;
            video.load();
        });
    }
    
    // Simulate optimization (for demo purposes)
    async simulateOptimization(file, analysis) {
        return new Promise((resolve) => {
            // In a real app, this would use FFmpeg.js or similar
            // For GitHub Pages demo, we'll simulate optimization
            
            setTimeout(() => {
                const optimizedFile = new File([file], `optimized_${file.name}`, {
                    type: 'video/mp4',
                    lastModified: Date.now()
                });
                
                // Simulate size reduction
                const simulatedReduction = 0.7; // 30% reduction
                const simulatedSize = file.size * simulatedReduction;
                
                resolve({
                    file: optimizedFile,
                    originalSize: file.size,
                    optimizedSize: simulatedSize,
                    reduction: ((1 - simulatedReduction) * 100).toFixed(1),
                    issuesFixed: analysis.issues.filter(issue => 
                        issue.type !== 'format' && issue.type !== 'metadata'
                    ).length,
                    analysis: analysis
                });
            }, 2000);
        });
    }
    
    // Create optimization report HTML
    createReportHTML(analysis) {
        const scoreColor = analysis.score >= 80 ? 'success' : 
                          analysis.score >= 60 ? 'warning' : 'danger';
        
        return `
            <div class="optimization-report">
                <div class="report-header">
                    <h3>Video Analysis Report</h3>
                    <div class="score-badge ${scoreColor}">
                        ${analysis.score}/100
                    </div>
                </div>
                
                <div class="report-details">
                    <div class="detail-item">
                        <span>File Name:</span>
                        <span>${analysis.name}</span>
                    </div>
                    <div class="detail-item">
                        <span>File Size:</span>
                        <span>${analysis.sizeMB} MB</span>
                    </div>
                    <div class="detail-item">
                        <span>Format:</span>
                        <span class="format-badge">${analysis.format.split('/')[1]?.toUpperCase() || 'Unknown'}</span>
                    </div>
                    ${analysis.duration ? `
                    <div class="detail-item">
                        <span>Duration:</span>
                        <span>${analysis.duration} seconds</span>
                    </div>
                    ` : ''}
                    ${analysis.resolution ? `
                    <div class="detail-item">
                        <span>Resolution:</span>
                        <span>${analysis.resolution}</span>
                    </div>
                    ` : ''}
                </div>
                
                ${analysis.issues.length > 0 ? `
                <div class="report-issues">
                    <h4><i class="fas fa-exclamation-triangle"></i> Issues Found:</h4>
                    <ul>
                        ${analysis.issues.map(issue => `
                            <li class="${issue.severity}">
                                <i class="fas fa-${issue.severity === 'high' ? 'times-circle' : 
                                                  issue.severity === 'medium' ? 'exclamation-triangle' : 
                                                  'info-circle'}"></i>
                                ${issue.message}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : `
                <div class="report-success">
                    <i class="fas fa-check-circle"></i>
                    <p>Video meets optimization standards!</p>
                </div>
                `}
                
                ${analysis.suggestions.length > 0 ? `
                <div class="report-suggestions">
                    <h4><i class="fas fa-lightbulb"></i> Suggestions:</h4>
                    <ul>
                        ${analysis.suggestions.map(suggestion => `
                            <li>${suggestion}</li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div class="report-actions">
                    ${analysis.needsOptimization ? `
                    <button class="btn btn-primary" onclick="optimizeVideoNow()">
                        <i class="fas fa-magic"></i> Optimize Now
                    </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="uploadAnyway()">
                        Upload As Is
                    </button>
                </div>
            </div>
        `;
    }
}

// Global instance
const videoOptimizer = new VideoOptimizer();

// Global functions for modals
function showOptimizeModal(file) {
    const modal = document.getElementById('optimize-modal');
    const currentSize = document.getElementById('current-size');
    
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    currentSize.textContent = `${sizeMB} MB`;
    
    modal.classList.add('show');
}

function closeOptimizeModal() {
    document.getElementById('optimize-modal').classList.remove('show');
}

function showVideoErrorModal(videoName) {
    const modal = document.getElementById('video-error-modal');
    const videoNameEl = document.getElementById('error-video-name');
    
    videoNameEl.textContent = videoName;
    modal.classList.add('show');
}

function closeVideoErrorModal() {
    document.getElementById('video-error-modal').classList.remove('show');
}

function tryFixVideo() {
    // Simulate fix attempt
    alert('Attempting to fix video... (This is a demo)');
    closeVideoErrorModal();
}

function removeProblemVideo() {
    if (confirm('Remove this video from the library?')) {
        // Remove logic would go here
        closeVideoErrorModal();
    }
}

// Make available globally
window.videoOptimizer = videoOptimizer;
window.showOptimizeModal = showOptimizeModal;
window.closeOptimizeModal = closeOptimizeModal;
window.showVideoErrorModal = showVideoErrorModal;
window.closeVideoErrorModal = closeVideoErrorModal;
window.tryFixVideo = tryFixVideo;
window.removeProblemVideo = removeProblemVideo;
