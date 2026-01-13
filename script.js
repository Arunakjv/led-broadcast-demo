// LED Broadcast Demo - Main Application Script
// Updated for GitHub Pages with real video upload

class LEDBroadcastDemo {
    constructor() {
        this.config = {
            appName: 'LED Broadcast Demo',
            version: '1.0.0',
            maxScreens: 1000,
            maxFileSize: 100 * 1024 * 1024, // 100MB
            supportedFormats: ['video/mp4', 'video/webm', 'video/quicktime'],
            defaultScreens: 5,
            autoSave: true,
            saveInterval: 30000 // 30 seconds
        };
        
        this.state = {
            screens: [],
            content: [],
            broadcasts: [],
            selectedContent: null,
            selectedScreens: new Set(),
            logs: [],
            settings: {
                autoConnect: true,
                simulateNetwork: true,
                showNotifications: true
            },
            statistics: {
                totalBroadcasts: 0,
                totalUploads: 0,
                totalScreensAdded: 0,
                uptime: 0
            }
        };
        
        this.videoPlayers = {};
        this.initialized = false;
        this.startTime = Date.now();
    }
    
    // Initialize the application
    async init() {
        console.log('Initializing LED Broadcast Demo...');
        
        // Load saved state
        this.loadState();
        
        // Initialize video.js players
        this.initVideoPlayers();
        
        // Load default content
        await this.loadDefaultContent();
        
        // Add default screens if none exist
        if (this.state.screens.length === 0) {
            this.addDefaultScreens();
        }
        
        // Start simulation
        this.startSimulation();
        
        // Start auto-save
        if (this.config.autoSave) {
            setInterval(() => this.saveState(), this.config.saveInterval);
        }
        
        // Update uptime counter
        setInterval(() => {
            this.state.statistics.uptime = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateUptimeDisplay();
        }, 1000);
        
        this.initialized = true;
        this.log('System initialized successfully', 'success');
        
        // Update UI
        this.updateAllDisplays();
    }
    
    // Initialize video.js players
    initVideoPlayers() {
        // Preview video player
        this.videoPlayers.preview = videojs('preview-video', {
            controls: true,
            autoplay: false,
            preload: 'auto',
            fluid: true,
            responsive: true,
            playbackRates: [0.5, 1, 1.5, 2]
        });
        
        // Player modal video
        this.videoPlayers.modal = videojs('player-video', {
            controls: true,
            autoplay: false,
            preload: 'auto',
            fluid: true,
            responsive: true
        });
    }
    
    // Load default sample videos
    async loadDefaultContent() {
        // These are sample videos that will work on GitHub Pages
        const sampleVideos = [
            {
                id: 'sample1',
                name: 'Demo Advertisement',
                filename: 'demo-ad.mp4',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                duration: 15,
                size: '5.2 MB',
                resolution: '1920x1080',
                format: 'mp4',
                thumbnail: 'https://img.youtube.com/vi/4OiMOHRDs14/0.jpg',
                isSample: true
            },
            {
                id: 'sample2',
                name: 'Product Promo',
                filename: 'promo-video.mp4',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                duration: 30,
                size: '8.7 MB',
                resolution: '1280x720',
                format: 'mp4',
                thumbnail: 'https://img.youtube.com/vi/4OiMOHRDs14/0.jpg',
                isSample: true
            }
        ];
        
        // Only add if they don't already exist
        sampleVideos.forEach(video => {
            if (!this.state.content.find(c => c.id === video.id)) {
                this.state.content.push(video);
            }
        });
        
        this.log('Loaded sample videos', 'info');
    }
    
    // Add default screens
    addDefaultScreens() {
        const locations = [
            'Times Square, NYC',
            'London Piccadilly Circus',
            'Tokyo Shibuya Crossing',
            'Dubai Mall',
            'Las Vegas Strip',
            'Singapore Orchard Road',
            'Paris Champs-Élysées',
            'Hong Kong Tsim Sha Tsui'
        ];
        
        const screenTypes = [
            'LED Video Wall',
            'Digital Billboard',
            'Transit Display',
            'Shopping Mall Screen',
            'Stadium Jumbotron',
            'Airport Display'
        ];
        
        for (let i = 1; i <= this.config.defaultScreens; i++) {
            const screen = {
                id: `SCREEN-${i.toString().padStart(4, '0')}`,
                name: `${screenTypes[i % screenTypes.length]} ${i}`,
                location: locations[i % locations.length],
                status: Math.random() > 0.3 ? 'online' : 'offline',
                type: 'led',
                resolution: '1920x1080',
                ip: `192.168.1.${i}`,
                lastSeen: new Date().toISOString(),
                currentContent: null,
                volume: 80,
                brightness: 100
            };
            
            this.state.screens.push(screen);
        }
        
        this.state.statistics.totalScreensAdded = this.config.defaultScreens;
        this.log(`Added ${this.config.defaultScreens} default screens`, 'success');
    }
    
    // Add a new screen
    addScreen(customData = null) {
        const screenId = `SCREEN-${(this.state.screens.length + 1).toString().padStart(4, '0')}`;
        
        const screen = customData || {
            id: screenId,
            name: `LED Display ${this.state.screens.length + 1}`,
            location: 'Location not set',
            status: 'online',
            type: 'led',
            resolution: '1920x1080',
            ip: `192.168.1.${this.state.screens.length + 100}`,
            lastSeen: new Date().toISOString(),
            currentContent: null,
            volume: 80,
            brightness: 100
        };
        
        this.state.screens.push(screen);
        this.state.statistics.totalScreensAdded++;
        
        this.updateScreenList();
        this.updateScreenSelect();
        this.log(`Screen added: ${screen.name}`, 'success');
        
        return screen;
    }
    
    // Bulk add screens
    bulkAddScreens(count) {
        count = Math.min(count, this.config.maxScreens - this.state.screens.length);
        
        if (count <= 0) {
            this.log('Maximum screen limit reached', 'warning');
            return;
        }
        
        for (let i = 0; i < count; i++) {
            this.addScreen();
        }
        
        this.log(`Added ${count} screens in bulk`, 'success');
    }
    
    // Handle video upload
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
                this.log(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`, 'error');
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
            
            // Simulate upload progress
            await this.simulateUpload(file, progressItem);
            
            // Create video object
            const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const videoUrl = URL.createObjectURL(file);
            
            // Get video duration (simulated for demo)
            const duration = Math.floor(Math.random() * 120) + 10; // 10-130 seconds
            
            const videoData = {
                id: videoId,
                name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                filename: file.name,
                url: videoUrl,
                duration: duration,
                size: this.formatFileSize(file.size),
                resolution: '1920x1080',
                format: file.type.split('/')[1] || 'mp4',
                thumbnail: this.generateThumbnail(file),
                uploaded: new Date().toISOString(),
                isSample: false
            };
            
            this.state.content.push(videoData);
            this.state.statistics.totalUploads++;
            
            // Update displays
            this.updateContentGrid();
            this.updateBroadcastContentSelect();
            
            this.log(`Video uploaded: ${file.name}`, 'success');
            
            // Remove progress item after delay
            setTimeout(() => {
                progressItem.remove();
            }, 2000);
        }
        
        // Remove drag over effect
        uploadArea.classList.remove('drag-over');
        
        // Save state
        this.saveState();
    }
    
    // Simulate upload with progress
    simulateUpload(file, progressItem) {
        return new Promise(resolve => {
            let progress = 0;
            const progressFill = progressItem.querySelector('.progress-fill');
            const progressText = progressItem.querySelector('.progress-header span:last-child');
            
            const interval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(resolve, 500);
                }
                
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}%`;
            }, 100);
        });
    }
    
    // Generate thumbnail for video
    generateThumbnail(file) {
        // For demo purposes, return a placeholder
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create a data URL for a colored square
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 300, 200);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.lightenColor(color, 30));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 300, 200);
        
        // Play icon
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(120, 70);
        ctx.lineTo(180, 100);
        ctx.lineTo(120, 130);
        ctx.closePath();
        ctx.fill();
        
        // File type text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(file.type.split('/')[1].toUpperCase(), 150, 170);
        
        return canvas.toDataURL();
    }
    
    // Lighten a color
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
    
    // Start broadcast
    startBroadcast() {
        const contentSelect = document.getElementById('broadcast-content');
        const selectedContentId = contentSelect.value;
        
        if (!selectedContentId) {
            this.log('Please select content first', 'error');
            return;
        }
        
        if (this.state.selectedScreens.size === 0) {
            this.log('Please select at least one screen', 'error');
            return;
        }
        
        const content = this.state.content.find(c => c.id === selectedContentId);
        if (!content) {
            this.log('Selected content not found', 'error');
            return;
        }
        
        // Get schedule type
        const scheduleType = document.querySelector('input[name="schedule"]:checked').value;
        let scheduleTime = null;
        
        if (scheduleType === 'scheduled') {
            scheduleTime = document.getElementById('schedule-time').value;
            if (!scheduleTime) {
                this.log('Please select schedule time', 'error');
                return;
            }
        }
        
        // Create broadcast
        const broadcastId = `BROADCAST-${Date.now()}`;
        const broadcast = {
            id: broadcastId,
            content: content,
            screenIds: Array.from(this.state.selectedScreens),
            scheduleType: scheduleType,
            scheduleTime: scheduleTime,
            status: scheduleType === 'immediate' ? 'broadcasting' : 'scheduled',
            startTime: new Date().toISOString(),
            progress: 0
        };
        
        this.state.broadcasts.push(broadcast);
        this.state.statistics.totalBroadcasts++;
        
        // Update screen status if immediate broadcast
        if (scheduleType === 'immediate') {
            this.state.screens.forEach(screen => {
                if (this.state.selectedScreens.has(screen.id)) {
                    screen.status = 'playing';
                    screen.currentContent = content.name;
                    screen.lastSeen = new Date().toISOString();
                }
            });
            
            // Play in preview
            this.videoPlayers.preview.src({ src: content.url, type: 'video/mp4' });
            this.videoPlayers.preview.play();
            
            // Update broadcast status
            document.getElementById('broadcast-status').textContent = 'BROADCASTING';
            document.getElementById('broadcast-btn').disabled = true;
            
            // Simulate broadcast completion
            setTimeout(() => {
                this.completeBroadcast(broadcastId);
            }, content.duration * 1000);
        }
        
        this.log(`Broadcast started: ${content.name} to ${this.state.selectedScreens.size} screens`, 'success');
        
        // Update displays
        this.updateScreenList();
        this.updateBroadcastStatus();
        
        // Save state
        this.saveState();
    }
    
    // Complete broadcast
    completeBroadcast(broadcastId) {
        const broadcastIndex = this.state.broadcasts.findIndex(b => b.id === broadcastId);
        if (broadcastIndex === -1) return;
        
        this.state.broadcasts[broadcastIndex].status = 'completed';
        this.state.broadcasts[broadcastIndex].progress = 100;
        
        // Reset screen status
        this.state.screens.forEach(screen => {
            if (this.state.broadcasts[broadcastIndex].screenIds.includes(screen.id)) {
                screen.status = 'online';
                screen.currentContent = null;
            }
        });
        
        // Reset broadcast UI
        document.getElementById('broadcast-status').textContent = 'IDLE';
        document.getElementById('broadcast-btn').disabled = false;
        
        this.log('Broadcast completed successfully', 'success');
        this.updateScreenList();
        this.updateBroadcastStatus();
    }
    
    // Update all displays
    updateAllDisplays() {
        this.updateStats();
        this.updateScreenList();
        this.updateContentGrid();
        this.updateScreenSelect();
        this.updateBroadcastContentSelect();
        this.updateBroadcastStatus();
        this.updateLogDisplay();
    }
    
    // Update statistics
    updateStats() {
        document.getElementById('total-screens').textContent = this.state.screens.length;
        
        const onlineScreens = this.state.screens.filter(s => s.status === 'online' || s.status === 'playing').length;
        document.getElementById('online-screens').textContent = onlineScreens;
        
        document.getElementById('total-content').textContent = this.state.content.length;
        
        // Calculate storage used (simulated)
        const storageUsed = this.state.content.reduce((total, content) => {
            if (content.size) {
                const size = parseFloat(content.size);
                return total + (isNaN(size) ? 0 : size);
            }
            return total;
        }, 0);
        document.getElementById('storage-used').textContent = `${Math.round(storageUsed)}MB`;
    }
    
    // Update screen list display
    updateScreenList() {
        const screenList = document.getElementById('screen-list');
        const noScreens = document.getElementById('no-screens');
        
        if (this.state.screens.length === 0) {
            screenList.style.display = 'none';
            noScreens.style.display = 'block';
            return;
        }
        
        screenList.style.display = 'block';
        noScreens.style.display = 'none';
        
        screenList.innerHTML = this.state.screens.map(screen => `
            <div class="screen-item" data-id="${screen.id}">
                <div class="screen-info">
                    <h4>${screen.name}</h4>
                    <div class="screen-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${screen.location}</span>
                        <span><i class="fas fa-network-wired"></i> ${screen.ip}</span>
                        <span><i class="fas fa-hashtag"></i> ${screen.id}</span>
                    </div>
                </div>
                <div class="screen-status">
                    <div class="status-indicator ${screen.status}"></div>
                    <span class="status-text">${screen.status.toUpperCase()}</span>
                    <div class="screen-actions">
                        <button class="btn btn-sm" onclick="app.toggleScreenStatus('${screen.id}')">
                            <i class="fas fa-power-off"></i>
                        </button>
                        <button class="btn btn-sm" onclick="app.previewScreen('${screen.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.removeScreen('${screen.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.updateStats();
    }
    
    // Update content grid
    updateContentGrid() {
        const contentGrid = document.getElementById('content-grid');
        const noContent = document.getElementById('no-content');
        
        if (this.state.content.length === 0) {
            contentGrid.style.display = 'none';
            noContent.style.display = 'block';
            return;
        }
        
        contentGrid.style.display = 'grid';
        noContent.style.display = 'none';
        
        contentGrid.innerHTML = this.state.content.map(content => `
            <div class="content-item">
                <div class="content-thumb">
                    <img src="${content.thumbnail}" alt="${content.name}">
                    <div class="content-thumb-overlay">
                        <button class="btn" onclick="app.previewContent('${content.id}')">
                            <i class="fas fa-play"></i> Preview
                        </button>
                    </div>
                </div>
                <div class="content-info">
                    <h4>${content.name}</h4>
                    <div class="content-meta">
                        <span>${content.duration}s</span>
                        <span>${content.resolution}</span>
                        <span>${content.format}</span>
                    </div>
                    <div class="content-actions">
                        <button class="btn btn-sm" onclick="app.selectContent('${content.id}')">
                            <i class="fas fa-check"></i> Select
                        </button>
                        <button class="btn btn-sm" onclick="app.downloadContent('${content.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        ${!content.isSample ? `
                        <button class="btn btn-sm btn-danger" onclick="app.deleteContent('${content.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('upload-count').textContent = `${this.state.content.length} videos`;
    }
    
    // Update screen selection checkboxes
    updateScreenSelect() {
        const screenSelection = document.getElementById('screen-selection');
        
        screenSelection.innerHTML = this.state.screens.map(screen => `
            <label class="screen-checkbox">
                <input type="checkbox" value="${screen.id}" 
                       ${screen.status === 'offline' ? 'disabled' : ''}
                       onchange="app.updateSelectedScreens(this)">
                ${screen.name}
                <span class="status-indicator ${screen.status}"></span>
            </label>
        `).join('');
        
        // Update selected count
        this.updateSelectedCount();
    }
    
    // Update selected screens
    updateSelectedScreens(checkbox) {
        if (checkbox.checked) {
            this.state.selectedScreens.add(checkbox.value);
        } else {
            this.state.selectedScreens.delete(checkbox.value);
        }
        
        this.updateSelectedCount();
    }
    
    // Update selected count display
    updateSelectedCount() {
        document.getElementById('selected-count').textContent = this.state.selectedScreens.size;
    }
    
    // Update broadcast content select
    updateBroadcastContentSelect() {
        const select = document.getElementById('broadcast-content');
        
        select.innerHTML = '<option value="">Choose a video...</option>' +
            this.state.content.map(content => `
                <option value="${content.id}" ${this.state.selectedContent === content.id ? 'selected' : ''}>
                    ${content.name} (${content.duration}s)
                </option>
            `).join('');
    }
    
    // Update broadcast status
    updateBroadcastStatus() {
        const activeBroadcasts = this.state.broadcasts.filter(b => b.status === 'broadcasting').length;
        const statusElement = document.getElementById('broadcast-status');
        
        if (activeBroadcasts > 0) {
            statusElement.textContent = 'BROADCASTING';
            statusElement.classList.add('live');
        } else {
            statusElement.textContent = 'IDLE';
            statusElement.classList.remove('live');
        }
    }
    
    // Update log display
    updateLogDisplay() {
        const logWindow = document.getElementById('log-window');
        
        logWindow.innerHTML = this.state.logs.slice(-50).map(log => `
            <div class="log-entry">
                <span class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
                <span class="log-message ${log.type}">${log.message}</span>
            </div>
        `).join('');
        
        // Auto-scroll to bottom
        logWindow.scrollTop = logWindow.scrollHeight;
    }
    
    // Update uptime display
    updateUptimeDisplay() {
        const uptime = this.state.statistics.uptime;
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        
        document.getElementById('uptime').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Select all screens
    selectAllScreens() {
        this.state.screens.forEach(screen => {
            if (screen.status !== 'offline') {
                this.state.selectedScreens.add(screen.id);
            }
        });
        
        // Update checkboxes
        document.querySelectorAll('.screen-checkbox input:not(:disabled)').forEach(checkbox => {
            checkbox.checked = true;
        });
        
        this.updateSelectedCount();
        this.log('All online screens selected', 'info');
    }
    
    // Clear selection
    clearSelection() {
        this.state.selectedScreens.clear();
        
        // Update checkboxes
        document.querySelectorAll('.screen-checkbox input').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.updateSelectedCount();
        this.log('Selection cleared', 'info');
    }
    
    // Toggle screen status
    toggleScreenStatus(screenId) {
        const screen = this.state.screens.find(s => s.id === screenId);
        if (!screen) return;
        
        screen.status = screen.status === 'online' ? 'offline' : 'online';
        screen.lastSeen = new Date().toISOString();
        
        // Remove from selection if going offline
        if (screen.status === 'offline') {
            this.state.selectedScreens.delete(screenId);
        }
        
        this.updateScreenList();
        this.updateScreenSelect();
        
        this.log(`Screen ${screenId} is now ${screen.status}`, 
                screen.status === 'online' ? 'success' : 'warning');
    }
    
    // Remove screen
    removeScreen(screenId) {
        if (!confirm('Are you sure you want to remove this screen?')) return;
        
        const index = this.state.screens.findIndex(s => s.id === screenId);
        if (index !== -1) {
            this.state.screens.splice(index, 1);
            this.state.selectedScreens.delete(screenId);
            
            this.updateScreenList();
            this.updateScreenSelect();
            
            this.log(`Screen ${screenId} removed`, 'warning');
        }
    }
    
    // Select content for broadcast
    selectContent(contentId) {
        this.state.selectedContent = contentId;
        document.getElementById('broadcast-content').value = contentId;
        this.log(`Content selected: ${contentId}`, 'info');
    }
    
    // Preview content
    previewContent(contentId) {
        const content = this.state.content.find(c => c.id === contentId);
        if (!content) return;
        
        this.videoPlayers.preview.src({ src: content.url, type: 'video/mp4' });
        this.videoPlayers.preview.play();
        
        // Update preview info
        document.querySelector('.preview-title').textContent = content.name;
        document.querySelector('.preview-meta').textContent = 
            `${content.duration}s • ${content.resolution} • ${content.format}`;
        
        this.log(`Previewing: ${content.name}`, 'info');
    }
    
    // Preview screen
    previewScreen(screenId) {
        const screen = this.state.screens.find(s => s.id === screenId);
        if (!screen) return;
        
        // Update player modal
        document.getElementById('player-screen-id').textContent = screen.id;
        document.getElementById('player-status').textContent = screen.status.toUpperCase();
        document.getElementById('player-status').className = `status-badge ${screen.status}`;
        document.getElementById('player-content').textContent = screen.currentContent || 'None';
        document.getElementById('player-location').textContent = screen.location;
        
        // Show player modal
        this.togglePlayer(true);
        
        this.log(`Previewing screen: ${screen.name}`, 'info');
    }
    
    // Download content
    downloadContent(contentId) {
        const content = this.state.content.find(c => c.id === contentId);
        if (!content) return;
        
        if (content.isSample) {
            // For sample videos, open in new tab
            window.open(content.url, '_blank');
            this.log(`Opening sample video: ${content.name}`, 'info');
        } else {
            // For uploaded videos, create download link
            const a = document.createElement('a');
            a.href = content.url;
            a.download = content.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            this.log(`Downloading: ${content.name}`, 'info');
        }
    }
    
    // Delete content
    deleteContent(contentId) {
        if (!confirm('Are you sure you want to delete this content?')) return;
        
        const index = this.state.content.findIndex(c => c.id === contentId);
        if (index !== -1) {
            // Revoke object URL to free memory
            const content = this.state.content[index];
            if (content.url && !content.isSample) {
                URL.revokeObjectURL(content.url);
            }
            
            this.state.content.splice(index, 1);
            
            // Update selected content if this was selected
            if (this.state.selectedContent === contentId) {
                this.state.selectedContent = null;
            }
            
            this.updateContentGrid();
            this.updateBroadcastContentSelect();
            
            this.log(`Content deleted: ${contentId}`, 'warning');
        }
    }
    
    // Start simulation
    startSimulation() {
        if (!this.state.settings.simulateNetwork) return;
        
        // Random screen status changes
        setInterval(() => {
            if (this.state.screens.length === 0) return;
            
            const randomIndex = Math.floor(Math.random() * this.state.screens.length);
            const screen = this.state.screens[randomIndex];
            
            // Only change if not currently broadcasting
            const isBroadcasting = this.state.broadcasts.some(b => 
                b.status === 'broadcasting' && b.screenIds.includes(screen.id));
            
            if (!isBroadcasting && Math.random() > 0.7) {
                const oldStatus = screen.status;
                
                if (screen.status === 'online' && Math.random() > 0.5) {
                    screen.status = 'playing';
                    // Find random content to "play"
                    const randomContent = this.state.content[Math.floor(Math.random() * this.state.content.length)];
                    if (randomContent) {
                        screen.currentContent = randomContent.name;
                    }
                } else if (screen.status === 'playing' && Math.random() > 0.3) {
                    screen.status = 'online';
                    screen.currentContent = null;
                } else if (Math.random() > 0.9) {
                    screen.status = 'offline';
                }
                
                screen.lastSeen = new Date().toISOString();
                
                if (oldStatus !== screen.status) {
                    this.updateScreenList();
                    this.updateScreenSelect();
                    
                    if (Math.random() > 0.5) {
                        this.log(`Screen ${screen.id} status changed to ${screen.status}`, 
                               screen.status === 'offline' ? 'warning' : 'info');
                    }
                }
            }
        }, 10000);
        
        // Simulate API status
        setInterval(() => {
            const apiStatus = document.getElementById('api-status');
            const streamStatus = document.getElementById('stream-status');
            const dbStatus = document.getElementById('db-status');
            const storageStatus = document.getElementById('storage-status');
            
            // Randomly "fail" API sometimes
            if (Math.random() > 0.05) {
                apiStatus.classList.add('active');
            } else {
                apiStatus.classList.remove('active');
                setTimeout(() => apiStatus.classList.add('active'), 3000);
            }
            
            // Update stream status based on active broadcasts
            const activeBroadcasts = this.state.broadcasts.filter(b => b.status === 'broadcasting').length;
            if (activeBroadcasts > 0) {
                streamStatus.classList.add('active');
            } else {
                streamStatus.classList.remove('active');
            }
            
            // Always show DB and storage as active
            dbStatus.classList.add('active');
            storageStatus.classList.add('active');
        }, 5000);
        
        // Simulate resource usage
        setInterval(() => {
            const cpuUsage = document.getElementById('cpu-usage');
            const memoryUsage = document.getElementById('memory-usage');
            const bandwidthUsage = document.getElementById('bandwidth-usage');
            
            // Random but realistic values
            const activeScreens = this.state.screens.filter(s => s.status !== 'offline').length;
            const cpu = 20 + (activeScreens * 0.5) + (Math.random() * 10);
            const memory = 30 + (activeScreens * 0.3) + (Math.random() * 15);
            const bandwidth = 10 + (activeScreens * 0.2) + (Math.random() * 5);
            
            cpuUsage.style.width = `${Math.min(cpu, 95)}%`;
            memoryUsage.style.width = `${Math.min(memory, 95)}%`;
            bandwidthUsage.style.width = `${Math.min(bandwidth, 95)}%`;
            
            cpuUsage.nextElementSibling.textContent = `${Math.round(cpu)}%`;
            memoryUsage.nextElementSibling.textContent = `${Math.round(memory)}%`;
            bandwidthUsage.nextElementSibling.textContent = `${Math.round(bandwidth)}%`;
        }, 3000);
    }
    
    // Simulate network event
    simulateNetwork(event) {
        if (event === 'disconnect') {
            // Randomly disconnect 30% of screens
            this.state.screens.forEach(screen => {
                if (Math.random() < 0.3 && screen.status !== 'offline') {
                    screen.status = 'offline';
                    this.state.selectedScreens.delete(screen.id);
                }
            });
            
            this.updateScreenList();
            this.updateScreenSelect();
            this.log('Simulated network disruption', 'warning');
        }
    }
    
    // Simulate screen event in player
    simulateScreenEvent(event) {
        const screenId = document.getElementById('player-screen-id').textContent;
        const screen = this.state.screens.find(s => s.id === screenId);
        
        if (!screen) return;
        
        switch(event) {
            case 'connect':
                screen.status = 'online';
                break;
            case 'disconnect':
                screen.status = 'offline';
                break;
            case 'play':
                screen.status = 'playing';
                // Play random content in player
                const randomContent = this.state.content[Math.floor(Math.random() * this.state.content.length)];
                if (randomContent) {
                    this.videoPlayers.modal.src({ src: randomContent.url, type: 'video/mp4' });
                    this.videoPlayers.modal.play();
                    screen.currentContent = randomContent.name;
                    document.getElementById('player-content').textContent = randomContent.name;
                }
                break;
            case 'stop':
                screen.status = 'online';
                this.videoPlayers.modal.pause();
                screen.currentContent = null;
                document.getElementById('player-content').textContent = 'None';
                break;
        }
        
        document.getElementById('player-status').textContent = screen.status.toUpperCase();
        document.getElementById('player-status').className = `status-badge ${screen.status}`;
        
        this.updateScreenList();
        this.log(`Screen ${screenId}: ${event}`, 'info');
    }
    
    // Toggle player modal
    togglePlayer(show) {
        const playerModal = document.getElementById('player-modal');
        if (show !== undefined) {
            playerModal.classList.toggle('show', show);
        } else {
            playerModal.classList.toggle('show');
        }
    }
    
    // Show help modal
    showHelp() {
        document.getElementById('help-modal').classList.add('show');
    }
    
    // Close help modal
    closeHelp() {
        document.getElementById('help-modal').classList.remove('show');
    }
    
    // Toggle fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    // Export demo data
    exportDemo() {
        const exportData = {
            app: this.config.appName,
            version: this.config.version,
            exportDate: new Date().toISOString(),
            state: this.state
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `led-broadcast-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.log('Demo data exported', 'success');
    }
    
    // Reset demo
    resetDemo() {
        if (!confirm('Are you sure you want to reset the demo? All data will be lost.')) return;
        
        // Clear state
        this.state = {
            screens: [],
            content: [],
            broadcasts: [],
            selectedContent: null,
            selectedScreens: new Set(),
            logs: [],
            settings: {
                autoConnect: true,
                simulateNetwork: true,
                showNotifications: true
            },
            statistics: {
                totalBroadcasts: 0,
                totalUploads: 0,
                totalScreensAdded: 0,
                uptime: 0
            }
        };
        
        // Clear localStorage
        localStorage.removeItem('ledBroadcastDemo');
        
        // Reload default content and screens
        this.loadDefaultContent();
        this.addDefaultScreens();
        
        // Update displays
        this.updateAllDisplays();
        
        this.log('Demo reset complete', 'success');
    }
    
    // Clear logs
    clearLogs() {
        this.state.logs = [];
        this.updateLogDisplay();
        this.log('Logs cleared', 'warning');
    }
    
    // Filter logs
    filterLogs(type) {
        const logWindow = document.getElementById('log-window');
        const allLogs = this.state.logs.slice(-50);
        
        if (type === 'all') {
            logWindow.innerHTML = allLogs.map(log => `
                <div class="log-entry">
                    <span class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span class="log-message ${log.type}">${log.message}</span>
                </div>
            `).join('');
        } else {
            const filteredLogs = allLogs.filter(log => log.type === type);
            logWindow.innerHTML = filteredLogs.map(log => `
                <div class="log-entry">
                    <span class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span class="log-message ${log.type}">${log.message}</span>
                </div>
            `).join('');
        }
        
        // Update filter tags
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.classList.remove('active');
        });
        event.target.classList.add('active');
    }
    
    // Add log entry
    log(message, type = 'info') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            message: message,
            type: type
        };
        
        this.state.logs.push(logEntry);
        
        // Keep only last 1000 logs in memory
        if (this.state.logs.length > 1000) {
            this.state.logs = this.state.logs.slice(-1000);
        }
        
        // Update display if initialized
        if (this.initialized) {
            this.updateLogDisplay();
        }
        
        // Show notification if enabled
        if (this.state.settings.showNotifications && type === 'error') {
            this.showNotification(message, type);
        }
        
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    // Show notification
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                               type === 'warning' ? 'exclamation-triangle' : 
                               type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Save state to localStorage
    saveState() {
        try {
            // Don't save video URLs (they're Object URLs)
            const stateToSave = {
                ...this.state,
                content: this.state.content.map(content => ({
                    ...content,
                    url: content.isSample ? content.url : null // Don't save Object URLs
                }))
            };
            
            localStorage.setItem('ledBroadcastDemo', JSON.stringify(stateToSave));
            console.log('State saved to localStorage');
        } catch (e) {
            console.warn('Could not save state:', e);
        }
    }
    
    // Load state from localStorage
    loadState() {
        try {
            const saved = localStorage.getItem('ledBroadcastDemo');
            if (saved) {
                const parsed = JSON.parse(saved);
                
                // Restore Object URLs for uploaded videos
                parsed.content = parsed.content.map(content => {
                    if (!content.isSample && !content.url) {
                        // For uploaded videos without URL, create a placeholder
                        content.url = this.generateThumbnail({ name: content.filename, type: `video/${content.format}` });
                    }
                    return content;
                });
                
                this.state = { ...this.state, ...parsed };
                console.log('State loaded from localStorage');
            }
        } catch (e) {
            console.warn('Could not load state:', e);
        }
    }
}

// Create global app instance
const app = new LEDBroadcastDemo();

// Initialize when page loads
function initDemo() {
    app.init();
    
    // Setup file upload
    const videoUpload = document.getElementById('video-upload');
    const uploadArea = document.getElementById('upload-area');
    
    // Click to upload
    videoUpload.addEventListener('change', (e) => {
        app.handleVideoUpload(Array.from(e.target.files));
        e.target.value = ''; // Reset input
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            app.handleVideoUpload(Array.from(e.dataTransfer.files));
        }
    });
    
    // Schedule type change
    document.querySelectorAll('input[name="schedule"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const scheduleDetails = document.getElementById('schedule-details');
            const recurringOptions = document.querySelector('.recurring-options');
            
            if (this.value === 'scheduled') {
                scheduleDetails.style.display = 'block';
                recurringOptions.style.display = 'none';
            } else if (this.value === 'recurring') {
                scheduleDetails.style.display = 'block';
                recurringOptions.style.display = 'block';
            } else {
                scheduleDetails.style.display = 'none';
            }
        });
    });
    
    // Screen search
    document.getElementById('screen-search').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const screenItems = document.querySelectorAll('.screen-item');
        
        screenItems.forEach(item => {
            const screenName = item.querySelector('h4').textContent.toLowerCase();
            const screenLocation = item.querySelector('.screen-meta').textContent.toLowerCase();
            
            if (screenName.includes(searchTerm) || screenLocation.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Set initial schedule time to now
    const now = new Date();
    const timeString = now.toISOString().slice(0, 16);
    document.getElementById('schedule-time').value = timeString;
    document.getElementById('schedule-time').min = timeString;
    
    // Log initial message
    app.log('Welcome to LED Broadcast System Demo!', 'success');
    app.log('Drag & drop videos to upload, or use the upload button', 'info');
    app.log('Select screens and content, then click "Start Broadcast"', 'info');
}

// Make functions available globally
window.app = app;
window.initDemo = initDemo;
window.togglePlayer = (show) => app.togglePlayer(show);
window.showHelp = () => app.showHelp();
window.closeHelp = () => app.closeHelp();
window.toggleFullscreen = () => app.toggleFullscreen();
window.resetDemo = () => app.resetDemo();
window.clearLogs = () => app.clearLogs();
window.filterLogs = (type) => app.filterLogs(type);
window.addScreen = () => app.addScreen();
window.bulkAddScreens = (count = 10) => app.bulkAddScreens(count);
window.resetScreens = () => {
    app.state.screens = [];
    app.updateAllDisplays();
    app.log('All screens removed', 'warning');
};
window.simulateNetwork = (event) => app.simulateNetwork(event);
window.selectAllScreens = () => app.selectAllScreens();
window.clearSelection = () => app.clearSelection();
window.startBroadcast = () => app.startBroadcast();