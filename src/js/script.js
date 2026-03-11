// ========== DESIGN CONFIGURATOR ========== 

class DesignConfigurator {
    constructor() {
        this.config = {
            room: 'kitchen',
            style: 'minimalistic',
            size: 20,
            wallType: 'painted',
            wallColor: 'white',
            floorType: 'laminate',
            comments: ''
        };

        this.priceMultipliers = {
            room: {
                kitchen: 1.0,
                'living-room': 0.8,
                bedroom: 0.7,
                office: 0.9
            },
            style: {
                minimalistic: 1.0,
                modern: 1.2,
                classic: 1.4,
                scandinavian: 1.3,
                industrial: 1.1
            },
            wallType: {
                painted: 0,
                wallpaper: 50,
                brick: 100,
                concrete: 80
            },
            floorType: {
                laminate: 0,
                wood: 150,
                tile: 120,
                concrete: 100
            }
        };

        this.basePrice = 50; // Base price per m²
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updatePrice();
        this.updateLayersPreview();
    }

    attachEventListeners() {
        // Room type buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleRoomChange(e));
        });

        // Style select
        document.getElementById('styleSelect').addEventListener('change', (e) => {
            this.config.style = e.target.value;
            this.updatePrice();
            this.updateLayersPreview();
        });

        // Size input
        document.getElementById('sizeInput').addEventListener('input', (e) => {
            this.config.size = parseFloat(e.target.value) || 20;
            this.updatePrice();
            this.updateLayersPreview();
        });

        // Wall type carousel
        this.setupCarousel('wall', '.carousel-container:nth-of-type(1)');

        // Wall color carousel
        this.setupCarousel('color', '.carousel-container:nth-of-type(2)');

        // Floor type carousel
        this.setupCarousel('floor', '.carousel-container:nth-of-type(3)');

        // Comments input
        document.getElementById('commentsInput').addEventListener('input', (e) => {
            this.config.comments = e.target.value;
        });

        // Action buttons
        document.getElementById('sendBtn').addEventListener('click', () => this.sendRequest());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveDesign());
        document.getElementById('deleteBtn').addEventListener('click', () => this.deleteDesign());
    }

    handleRoomChange(e) {
        // Remove active class from all buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        e.target.classList.add('active');

        this.config.room = e.target.dataset.room;
        this.updatePrice();
        this.updateLayersPreview();
    }

    setupCarousel(type, containerSelector) {
        const container = document.querySelectorAll('.carousel-container')[
            type === 'wall' ? 0 : type === 'color' ? 1 : 2
        ];

        const itemsContainer = container.querySelector('.carousel-items');
        const items = container.querySelectorAll('.carousel-item');
        const prevBtn = container.querySelector('.prev');
        const nextBtn = container.querySelector('.next');

        let currentIndex = 0;

        // Handle item selection
        items.forEach((item, index) => {
            if (item.classList.contains('active')) {
                currentIndex = index;
            }
            
            item.addEventListener('click', () => {
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                currentIndex = index;

                if (type === 'wall') {
                    this.config.wallType = item.dataset.wall;
                } else if (type === 'color') {
                    this.config.wallColor = item.dataset.color;
                } else if (type === 'floor') {
                    this.config.floorType = item.dataset.floor;
                }

                this.updatePrice();
                this.updateLayersPreview();
            });
        });

        // Handle carousel navigation - click arrows to select next/prev item
        prevBtn.addEventListener('click', () => {
            currentIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            items[currentIndex].click();
            
            // Scroll to make item visible
            const item = items[currentIndex];
            const itemLeft = item.offsetLeft;
            const itemRight = itemLeft + item.offsetWidth;
            const containerScrollLeft = itemsContainer.scrollLeft;
            const containerWidth = itemsContainer.clientWidth;
            
            if (itemLeft < containerScrollLeft) {
                itemsContainer.scrollLeft = itemLeft;
            } else if (itemRight > containerScrollLeft + containerWidth) {
                itemsContainer.scrollLeft = itemRight - containerWidth;
            }
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            items[currentIndex].click();
            
            // Scroll to make item visible
            const item = items[currentIndex];
            const itemLeft = item.offsetLeft;
            const itemRight = itemLeft + item.offsetWidth;
            const containerScrollLeft = itemsContainer.scrollLeft;
            const containerWidth = itemsContainer.clientWidth;
            
            if (itemLeft < containerScrollLeft) {
                itemsContainer.scrollLeft = itemLeft;
            } else if (itemRight > containerScrollLeft + containerWidth) {
                itemsContainer.scrollLeft = itemRight - containerWidth;
            }
        });
    }

    updatePrice() {
        // Base calculation
        let price = this.config.size * this.basePrice;

        // Apply room type multiplier
        price *= this.priceMultipliers.room[this.config.room];

        // Apply style multiplier
        price *= this.priceMultipliers.style[this.config.style];

        // Add wall type cost
        price += this.priceMultipliers.wallType[this.config.wallType];

        // Add floor type cost
        price += this.priceMultipliers.floorType[this.config.floorType];

        // Round to nearest 100
        price = Math.round(price / 100) * 100;

        // Update display
        document.getElementById('priceValue').textContent = price;

        const roomLabel = this.config.room.replace('-', ' ');
        document.getElementById('priceNote').textContent = 
            `Based on ${this.config.size} m² ${this.config.style} ${roomLabel}`;

        this.currentPrice = price;
    }

    updateLayersPreview() {
        // Trigger morph animation
        const canvas = document.querySelector('.image-canvas');
        canvas.classList.remove('morphing');
        
        // Force reflow to restart animation
        void canvas.offsetWidth;
        canvas.classList.add('morphing');

        // Update wall color
        const wallsLayer = document.getElementById('wallsLayer');
        const colorMap = {
            white: '#FFFFFF',
            'light-gray': '#E8E8E8',
            'warm-beige': '#E9D5C3',
            'soft-blue': '#B8D4E8',
            'sage-green': '#A8B89E'
        };
        wallsLayer.style.backgroundColor = colorMap[this.config.wallColor];

        // Update floor based on floor type
        const flooringLayer = document.getElementById('flooringLayer');
        const floorPatterns = {
            laminate: 'linear-gradient(90deg, #c19a6b 0%, #d4a574 50%, #c19a6b 100%)',
            wood: 'repeating-linear-gradient(90deg, #8B4513 0px, #A0522D 2px, #8B4513 4px, #654321 6px, #8B4513 8px)',
            tile: 'repeating-conic-gradient(#f0f0f3 0% 25%, #e8e8eb 0% 50%) 0 0 / 20px 20px',
            concrete: '#a0a0a0'
        };
        flooringLayer.style.background = floorPatterns[this.config.floorType];
        flooringLayer.style.opacity = 0.4;

        // Update wall texture based on wall type
        const baseLayer = document.getElementById('baseLayer');
        const wallTextures = {
            painted: '#fafafa',
            wallpaper: 'repeating-linear-gradient(45deg, #e8e8eb, #e8e8eb 10px, #f0f0f3 10px, #f0f0f3 20px)',
            brick: 'repeating-linear-gradient(90deg, #a0593f 0px, #a0593f 80px, #8b4726 80px, #8b4726 82px, #a0593f 82px, #a0593f 160px, #8b4726 160px, #8b4726 162px)',
            concrete: 'repeating-linear-gradient(90deg, #808080 0px, #808080 1px, #888888 1px, #888888 3px, #808080 3px, #808080 5px)'
        };
        baseLayer.style.background = wallTextures[this.config.wallType];

        // Update furniture layer based on style and room
        const furnitureLayer = document.getElementById('furnitureLayer');
        const styleIcons = {
            minimalistic: '⬜',
            modern: '⬛',
            classic: '◆',
            scandinavian: '△',
            industrial: '◻'
        };
        furnitureLayer.textContent = styleIcons[this.config.style];
        furnitureLayer.style.opacity = 0.3;
        furnitureLayer.style.fontSize = '60px';
    }

    saveDesign() {
        const design = {
            timestamp: new Date().toISOString(),
            config: this.config,
            price: this.currentPrice
        };

        // Save to localStorage
        let designs = JSON.parse(localStorage.getItem('designs') || '[]');
        designs.push(design);
        localStorage.setItem('designs', JSON.stringify(designs));

        alert(`✓ Design saved! Total saved designs: ${designs.length}`);
    }

    deleteDesign() {
        // Reset to defaults
        this.config = {
            room: 'kitchen',
            style: 'minimalistic',
            size: 20,
            wallType: 'painted',
            wallColor: 'white',
            floorType: 'laminate',
            comments: ''
        };

        // Reset UI
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.toggle-btn[data-room="kitchen"]').classList.add('active');

        document.getElementById('styleSelect').value = 'minimalistic';
        document.getElementById('sizeInput').value = 20;
        document.getElementById('commentsInput').value = '';

        // Reset carousels
        document.querySelectorAll('.carousel-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector('[data-wall="painted"]').classList.add('active');
        document.querySelector('[data-color="white"]').classList.add('active');
        document.querySelector('[data-floor="laminate"]').classList.add('active');

        this.updatePrice();
        this.updateLayersPreview();

        alert('✓ Design cleared');
    }

    sendRequest() {
        if (!this.config.comments.trim()) {
            alert('Please add your requests or wishes before sending');
            return;
        }

        const requestData = {
            room: this.config.room.replace('-', ' '),
            style: this.config.style,
            size: this.config.size,
            wallType: this.config.wallType,
            wallColor: this.config.wallColor,
            floorType: this.config.floorType,
            comments: this.config.comments,
            estimatedPrice: this.currentPrice,
            timestamp: new Date().toISOString()
        };

        // Send to CRM API
        this.sendToCRM(requestData);
    }

    sendToCRM(data) {
        // Replace with your actual CRM API endpoint
        const crmEndpoint = 'https://your-crm-api.com/api/requests';

        fetch(crmEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any authentication headers needed
                // 'Authorization': 'Bearer YOUR_TOKEN'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                alert('✓ Request sent to CRM successfully! We will contact you soon.');
                this.deleteDesign(); // Clear form after successful send
            } else {
                throw new Error('Failed to send request');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback: Show data in console and simulate send
            console.log('Design Request Data:', data);
            alert('✓ Request prepared: ' + JSON.stringify(data, null, 2) + '\n\nNote: Connect your CRM API endpoint in the code.');
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DesignConfigurator();
});
