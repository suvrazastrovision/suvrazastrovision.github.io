// Brain Canvas Interactive Visualization
class BrainCanvas {
  constructor() {
    this.canvas = document.getElementById('brainCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 1000;
    this.connectionDistance = 150;
    this.particleSize = 1.5;
    this.centerX = 0;
    this.centerY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.rotationX = 0;
    this.rotationY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.isExploded = false;

    this.init();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    this.resizeCanvas();
    this.createBrainParticles();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    this.targetX = this.centerX;
    this.targetY = this.centerY;
  }

  createBrainParticles() {
    this.particles = [];
    
    // Create particles in a brain-like shape
    for (let i = 0; i < this.particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 200;
      
      // Brain hemisphere shape using sine waves
      const depth = Math.random() * 100 - 50;
      const x = Math.cos(angle) * radius * (1 + Math.sin(depth / 50) * 0.3);
      const y = Math.sin(angle) * radius * 0.8;
      const z = depth + Math.random() * 50;

      this.particles.push({
        x: x,
        y: y,
        z: z,
        baseX: x,
        baseY: y,
        baseZ: z,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        size: Math.random() * this.particleSize + 0.5,
        color: this.getParticleColor()
      });
    }
  }

  getParticleColor() {
    const colors = [
      '#64b5f6', // Light blue
      '#42a5f5', // Medium blue
      '#2196f3', // Blue
      '#1e88e5', // Darker blue
      '#1976d2', // Deep blue
      '#90caf9', // Very light blue
      '#4fc3f7', // Cyan blue
      '#29b6f6'  // Bright blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  setupEventListeners() {
    document.addEventListener('mousemove', (e) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;
      this.targetRotationX = (e.clientY - this.centerY) * 0.0001;
      this.targetRotationY = (e.clientX - this.centerX) * 0.0001;
    });

    // Touch support
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.targetX = e.touches[0].clientX;
        this.targetY = e.touches[0].clientY;
      }
    });

    // Explosion on click
    document.addEventListener('click', (e) => {
      this.triggerExplosion();
    });

    const textToggle = document.getElementById('heroTextToggle');
    if (textToggle) {
      textToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelector('.hero-top').classList.toggle('hidden');
      });
    }
  }

  triggerExplosion() {
    this.isExploded = true;
    this.particles.forEach(particle => {
      const angle = Math.atan2(particle.y, particle.x);
      const distance = Math.sqrt(particle.x ** 2 + particle.y ** 2);
      particle.vx = Math.cos(angle) * 8;
      particle.vy = Math.sin(angle) * 8;
      particle.vz = (Math.random() - 0.5) * 10;
      particle.opacity *= 0.8;
    });

    // Reset after 3 seconds
    setTimeout(() => {
      this.isExploded = false;
      this.createBrainParticles();
    }, 3000);
  }

  update() {
    // Smooth camera movement
    this.centerX += (this.targetX - this.centerX) * 0.05;
    this.centerY += (this.targetY - this.centerY) * 0.05;
    this.rotationX += (this.targetRotationX - this.rotationX) * 0.1;
    this.rotationY += (this.targetRotationY - this.rotationY) * 0.1;

    this.particles.forEach(particle => {
      if (!this.isExploded) {
        // Gentle floating motion
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        // Return to base position slowly
        particle.x += (particle.baseX - particle.x) * 0.01;
        particle.y += (particle.baseY - particle.y) * 0.01;
        particle.z += (particle.baseZ - particle.z) * 0.01;

        // Add subtle turbulence
        particle.vx += (Math.random() - 0.5) * 0.02;
        particle.vy += (Math.random() - 0.5) * 0.02;
        particle.vz += (Math.random() - 0.5) * 0.02;

        // Damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.vz *= 0.98;
      } else {
        // Explosion motion
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        particle.vx *= 0.95;
        particle.vy *= 0.95;
        particle.vz *= 0.95;
      }

      // Bounds checking
      if (Math.abs(particle.x) > this.canvas.width * 2 || 
          Math.abs(particle.y) > this.canvas.height * 2) {
        particle.opacity *= 0.9;
      }
    });
  }

  draw() {
    // Dark background
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connections
    this.drawConnections();

    // Draw particles
    this.particles.forEach(particle => {
      const screenX = this.centerX + particle.x;
      const screenY = this.centerY + particle.y;

      if (screenX > 0 && screenX < this.canvas.width && 
          screenY > 0 && screenY < this.canvas.height) {
        
        const glow = particle.size * 3;
        const gradient = this.ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glow);
        gradient.addColorStop(0, particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, particle.color + '00');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(screenX - glow, screenY - glow, glow * 2, glow * 2);

        // Particle core
        this.ctx.fillStyle = particle.color + Math.floor(particle.opacity * 180).toString(16).padStart(2, '0');
        this.ctx.fillRect(screenX - particle.size, screenY - particle.size, particle.size * 2, particle.size * 2);
      }
    });

    // Draw background stars
    this.drawStars();
  }

  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.connectionDistance) {
          const opacity = (1 - distance / this.connectionDistance) * 0.3;
          const x1 = this.centerX + this.particles[i].x;
          const y1 = this.centerY + this.particles[i].y;
          const x2 = this.centerX + this.particles[j].x;
          const y2 = this.centerY + this.particles[j].y;

          this.ctx.strokeStyle = `rgba(100, 181, 246, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          this.ctx.stroke();
        }
      }
    }
  }

  drawStars() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 200; i++) {
      const x = (Math.sin(i * 12.9898) * 43758.5453) % this.canvas.width;
      const y = (Math.sin(i * 78.233) * 43758.5453) % this.canvas.height;
      const size = Math.sin(i * 45.164) * 0.5 + 0.5;
      this.ctx.fillRect(x, y, size, size);
    }
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BrainCanvas();
});
