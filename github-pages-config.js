// GitHub Pages Configuration
// This file handles GitHub Pages specific settings

const GitHubPagesConfig = {
    // App configuration for GitHub Pages
    config: {
        repository: 'led-broadcast-demo',
        branch: 'main',
        baseUrl: '/led-broadcast-demo', // Change this to your repo name
        isGitHubPages: true,
        
        // Demo settings
        demoLimits: {
            maxScreens: 100,
            maxVideos: 20,
            maxVideoSizeMB: 100,
            maxStorageMB: 500
        },
        
        // Sample videos from external sources (for demo)
        sampleVideos: [
            {
                id: 'sample_bunny',
                name: 'Big Buck Bunny',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                duration: 596,
                thumbnail: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
                credits: 'Blender Foundation'
            },
            {
                id: 'sample_joyrides',
                name: 'For Bigger Joyrides',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                duration: 15,
                thumbnail: 'https://img.youtube.com/vi/4OiMOHRDs14/0.jpg',
                credits: 'Google'
            },
            {
                id: 'sample_escape',
                name: 'For Bigger Escape',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                duration: 15,
                thumbnail: 'https://img.youtube.com/vi/4OiMOHRDs14/0.jpg',
                credits: 'Google'
            }
        ]
    },
    
    // Initialize GitHub Pages specific features
    init() {
        console.log('GitHub Pages Demo Initialized');
        
        // Update UI for GitHub Pages
        this.updateUIForGitHub();
        
        // Add GitHub badge
        this.addGitHubBadge();
        
        // Load sample videos if needed
        this.loadSampleVideos();
        
        // Set up storage warning
        this.setupStorageWarning();
    },
    
    // Update UI for GitHub Pages
    updateUIForGitHub() {
        // Update page title
        document.title = 'LED Broadcast Demo (GitHub Pages)';
        
        // Update header subtitle
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.textContent = 'GitHub Pages Demo • No Server Required';
        }
        
        // Add GitHub info to footer
        const footer = document.querySelector('.footer-left');
        if (footer) {
            const ghInfo = document.createElement('p');
            ghInfo.className = 'github-info';
            ghInfo.innerHTML = `
                <i class="fab fa-github"></i> 
                <a href="https://github.com/yourusername/led-broadcast-demo" target="_blank">
                    View on GitHub
                </a> • 
                <a href="https://pages.github.com" target="_blank">Powered by GitHub Pages</a>
            `;
            footer.appendChild(ghInfo);
        }
    },
    
    // Add GitHub badge
    addGitHubBadge() {
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            const githubBadge = document.createElement('a');
            githubBadge.href = 'https://github.com/yourusername/led-broadcast-demo';
            githubBadge.target = '_blank';
            githubBadge.className = 'github-badge';
            githubBadge.innerHTML = `
                <i class="fab fa-github"></i>
                <span>GitHub</span>
                <i class="fas fa-external-link-alt"></i>
            `;
            headerControls.insertBefore(githubBadge, headerControls.firstChild);
        }
    },
    
    // Load sample videos
    loadSampleVideos() {
        // This would be called by the main app to add sample videos
        console.log('Sample videos available for demo');
    },
    
    // Setup storage warning for GitHub Pages limitations
    setupStorageWarning() {
        // GitHub Pages is static hosting, so warn about localStorage limits
        const checkStorage = () => {
            try {
                // Check if localStorage is available and has space
                const testKey = 'storage_test';
                const testValue = 'x'.repeat(1024 * 1024); // 1MB test
                
                localStorage.setItem(testKey, testValue);
                localStorage.removeItem(testKey);
                
                return true;
            } catch (e) {
                console.warn('LocalStorage may be full or unavailable:', e);
                return false;
            }
        };
        
        // Check on load
        if (!checkStorage()) {
            this.showStorageWarning();
        }
        
        // Check periodically
        setInterval(() => {
            if (!checkStorage()) {
                this.showStorageWarning();
            }
        }, 30000);
    },
    
    // Show storage warning
    showStorageWarning() {
        // Don't show multiple warnings
        if (document.getElementById('storage-warning')) return;
        
        const warning = document.createElement('div');
        warning.id = 'storage-warning';
        warning.className = 'storage-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Storage Warning</strong>
                    <p>GitHub Pages has limited local storage. Consider exporting your data regularly.</p>
                </div>
                <button class="btn btn-sm" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('storage-warning-styles')) {
            const styles = document.createElement('style');
            styles.id = 'storage-warning-styles';
            styles.textContent = `
                .storage-warning {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #fbbf24;
                    color: #78350f;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                    z-index: 1000;
                    max-width: 500px;
                    width: 90%;
                    border: 2px solid #f59e0b;
                }
                .warning-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .warning-content i {
                    font-size: 1.5rem;
                }
                .warning-content strong {
                    display: block;
                    margin-bottom: 5px;
                }
                .warning-content p {
                    margin: 0;
                    font-size: 0.9rem;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(warning);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    },
    
    // Get GitHub repository URL
    getRepoUrl() {
        return `https://github.com/yourusername/${this.config.repository}`;
    },
    
    // Get live demo URL
    getDemoUrl() {
        return `https://yourusername.github.io/${this.config.repository}`;
    },
    
    // Export configuration
    exportConfig() {
        return {
            ...this.config,
            repoUrl: this.getRepoUrl(),
            demoUrl: this.getDemoUrl(),
            timestamp: new Date().toISOString()
        };
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    GitHubPagesConfig.init();
});

// Make available globally
window.GitHubPagesConfig = GitHubPagesConfig;