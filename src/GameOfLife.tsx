import { useEffect, useRef } from 'react';

const GameOfLife = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const hsla = (h: number, s: number, l: number, a: number) => 
      `hsla(${h}, ${s}%, ${l}%, ${a})`;

    const map = (value: number, in1: number, in2: number, out1: number, out2: number) => {
      return (value - in1) * (out2 - out1) / (in2 - in1) + out1;
    };

    class Board {
      bg: string;
      cells: Cell[];
      colors: any;
      ctx: CanvasRenderingContext2D;
      scale: number;
      dragging: boolean;
      handlers: any;
      cellsLength: number;
      columns: number;
      rows: number;
      w: number;
      h: number;

      metrics: {
        generation: number;
        population: number;
        births: number;
        deaths: number;
        density: number;
      };

      constructor(canvas: HTMLCanvasElement, scale: number, colors: any) {
        this.bg = hsla(...colors.bg);
        this.cells = [];
        this.colors = colors;
        this.ctx = canvas.getContext('2d')!;
        this.scale = scale;
        this.dragging = false;
        this.handlers = {
          handleMouseDown: this.handleMouseDown.bind(this),
          handleMouseMove: this.handleMouseMove.bind(this),
          handleMouseUp: this.handleMouseUp.bind(this),
          raf: 0
        };
        this.metrics = {
          generation: 0,
          population: 0,
          births: 0,
          deaths: 0,
          density: 0
        };
        this.setupCanvas();
        this.setupBoard();
      }

      init() {
        const bg = this.colors.bg.slice(0);
        bg[3] = 1;
        this.setupCells();
        this.setupListeners();
        this.ctx.fillStyle = hsla(...bg);
        this.ctx.fillRect(0, 0, this.w, this.h);
      }

      setupCanvas() {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
        this.w = this.ctx.canvas.width;
        this.h = this.ctx.canvas.height;
      }

      setupBoard() {
        this.cellsLength = Math.floor((this.w / this.scale) * (this.h / this.scale));
        this.columns = Math.floor(this.w / this.scale);
        this.rows = Math.floor(this.h / this.scale);
      }

      setupCells() {
        for (let i = 0; i < this.cellsLength; i++) {
          this.cells.push(new Cell(this, i));
        }
      }

      setupListeners() {
        this.ctx.canvas.addEventListener('mousedown', this.handlers.handleMouseDown);
        this.ctx.canvas.addEventListener('mouseup', this.handlers.handleMouseUp);
        this.ctx.canvas.addEventListener('mousemove', this.handlers.handleMouseMove);
      }

      draw() {
        this.ctx.fillStyle = this.bg;
        this.ctx.fillRect(0, 0, this.w, this.h);
        
        for (let i = 0; i < this.cells.length; i++) {
          this.cells[i].draw();
        }
        
        this.drawMetrics();
      }

      update() {
        let newBirths = 0;
        let newDeaths = 0;
        let totalAlive = 0;

        // First pass: update previous states
        for (let i = 0; i < this.cells.length; i++) {
          this.cells[i].updatePrevious();
        }
        
        // Second pass: update cells and collect metrics
        for (let i = 0; i < this.cells.length; i++) {
          const wasAlive = this.cells[i].previous;
          this.cells[i].update();
          const isAlive = this.cells[i].alive;
          
          if (isAlive) {
            totalAlive++;
            if (!wasAlive) newBirths++;
          } else if (wasAlive) {
            newDeaths++;
          }
        }

        // Update metrics
        this.metrics.generation++;
        this.metrics.population = totalAlive;
        this.metrics.births = newBirths;
        this.metrics.deaths = newDeaths;
        this.metrics.density = totalAlive / this.cells.length;
      }

      start() {
        if (!this.handlers.raf) {
          this.loop();
        }
      }

      loop() {
        this.step();
        this.handlers.raf = requestAnimationFrame(() => this.loop());
      }

      step() {
        this.update();
        this.draw();
      }

      destroy() {
        if (this.handlers.raf) {
          cancelAnimationFrame(this.handlers.raf);
        }
        this.ctx.canvas.removeEventListener('mousedown', this.handlers.handleMouseDown);
        this.ctx.canvas.removeEventListener('mouseup', this.handlers.handleMouseUp);
        this.ctx.canvas.removeEventListener('mousemove', this.handlers.handleMouseMove);
        this.cells = [];
        this.dragging = false;
      }

      handleMouseDown(e: MouseEvent) {
        this.dragging = true;
        const x = Math.floor(e.offsetX / this.scale);
        const y = Math.floor(e.offsetY / this.scale);
        const i = y * this.columns + x;
        if (this.cells[i]) {
          this.cells[i].alive = true;
        }
      }

      handleMouseMove(e: MouseEvent) {
        if (!this.dragging) return;
        const x = Math.floor(e.offsetX / this.scale);
        const y = Math.floor(e.offsetY / this.scale);
        const i = y * this.columns + x;
        if (this.cells[i]) {
          this.cells[i].alive = true;
        }
      }

      handleMouseUp() {
        this.dragging = false;
      }

      drawMetrics() {
        this.ctx.save();
        
        // Calculate card dimensions and position
        const padding = 15;
        const cardHeight = 30;
        const cardY = 15;
        const cardWidth = Math.min(this.w - (padding * 2), 800);
        const cardX = (this.w - cardWidth) / 2;
    
        // Animate glow effect
        const time = performance.now() * 0.001; // Convert to seconds
        const glowIntensity = 0.2 + Math.sin(time * 2) * 0.1; // Pulsating glow
        const borderGlow = 0.3 + Math.sin(time * 1.5) * 0.1; // Border glow intensity

        // Draw futuristic card background with animated gradient
        const bgGradient = this.ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
        const gradientOffset = (Math.sin(time) + 1) * 0.5; // Oscillate between 0 and 1
        
        bgGradient.addColorStop(0, `rgba(20, 20, 20, 0.85)`);
        bgGradient.addColorStop(0.3 + gradientOffset * 0.2, `rgba(30, 30, 30, 0.85)`);
        bgGradient.addColorStop(0.7 - gradientOffset * 0.2, `rgba(25, 25, 25, 0.85)`);
        bgGradient.addColorStop(1, `rgba(20, 20, 20, 0.85)`);
    
        this.ctx.fillStyle = bgGradient;
        
        // Animated glow effect
        this.ctx.shadowColor = `rgba(0, 150, 255, ${glowIntensity})`;
        this.ctx.shadowBlur = 15 + Math.sin(time * 3) * 5;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.beginPath();
        this.ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 8);
        this.ctx.fill();
    
        // Animated border glow with gradient
        const borderGradient = this.ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY);
        const baseHue = (time * 30) % 360; // Base hue that shifts over time
    
        // Create a flowing rainbow effect
        borderGradient.addColorStop(0, `hsla(${baseHue}, 80%, 70%, ${borderGlow})`);
        borderGradient.addColorStop(0.25, `hsla(${(baseHue + 90) % 360}, 80%, 70%, ${borderGlow})`);
        borderGradient.addColorStop(0.5, `hsla(${(baseHue + 180) % 360}, 80%, 70%, ${borderGlow})`);
        borderGradient.addColorStop(0.75, `hsla(${(baseHue + 270) % 360}, 80%, 70%, ${borderGlow})`);
        borderGradient.addColorStop(1, `hsla(${baseHue}, 80%, 70%, ${borderGlow})`);
    
        this.ctx.strokeStyle = borderGradient;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    
        // Reset shadow for text
        this.ctx.shadowColor = `rgba(0, 150, 255, ${glowIntensity * 1.5})`;
        this.ctx.shadowBlur = 3;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    
        this.ctx.font = '600 12px system-ui';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    
        const metrics = [
          { label: 'GEN', value: this.metrics.generation },
          { label: 'POP', value: this.metrics.population },
          { label: 'BIRTHS', value: this.metrics.births },
          { label: 'DEATHS', value: this.metrics.deaths },
          { label: 'DENSITY', value: `${(this.metrics.density * 100).toFixed(1)}%` }
        ];
    
        const metricWidth = cardWidth / metrics.length;
        const textY = cardY + (cardHeight / 2);
    
        // Draw metrics with enhanced animated gradient effects
        metrics.forEach((metric, i) => {
          const textX = cardX + (metricWidth * (i + 0.5));
          
          // Create animated gradients for label and value
          const hueShift = (time * 30 + i * 72) % 360; // Different hue for each metric
          
          // Combined gradient for label and value
          const combinedGradient = this.ctx.createLinearGradient(textX - 25, textY, textX + 25, textY);
          combinedGradient.addColorStop(0, `hsla(${hueShift}, 80%, 75%, 0.8)`);
          combinedGradient.addColorStop(0.5, `hsla(${(hueShift + 30) % 360}, 80%, 75%, 0.9)`);
          combinedGradient.addColorStop(1, `hsla(${(hueShift + 60) % 360}, 80%, 75%, 0.8)`);
          
          // Draw text without scaling
          this.ctx.fillStyle = combinedGradient;
          this.ctx.fillText(`${metric.label} ${metric.value}`, textX, textY);
        });
    
        this.ctx.restore();
      }


    }

    class Cell {
      alive: boolean;
      board: Board;
      i: number;
      x: number;
      y: number;
      col: number;
      row: number;
      previous: boolean;
      neighbors: number[];
      color: string;
      colorTimer: number;
      targetColor: string;

      constructor(board: Board, i: number) {
        this.alive = Math.random() < 0.3;
        this.board = board;
        this.i = i;
        this.x = Math.floor(i % board.columns) * board.scale;
        this.y = Math.floor(i / board.columns) * board.scale;
        this.col = Math.floor(this.x / board.scale);
        this.row = Math.floor(this.y / board.scale);
        this.previous = this.alive;
        this.neighbors = this.getNeighbors();
        this.colorTimer = Math.random();
        this.color = hsla(...board.colors.alive);
        this.targetColor = hsla(...board.colors.alive);
      }

      updateColor() {
        this.colorTimer += 0.01;
        if (this.colorTimer >= 1) {
          this.color = this.targetColor;
          this.targetColor = generateColor();
          this.colorTimer = 0;
        }
      }

      draw() {
        if (this.alive) {
          this.updateColor();
          this.board.ctx.fillStyle = this.color;
          this.board.ctx.fillRect(this.x, this.y, this.board.scale - 1, this.board.scale - 1);
        }
      }

      getNeighbors() {
        const neighbors = [];
        const col = this.col;
        const row = this.row;
        const cols = this.board.columns;
        
        const n = this.i - cols;
        const s = this.i + cols;
        const w = this.i - 1;
        const e = this.i + 1;
        
        const nw = n - 1;
        const ne = n + 1;
        const sw = s - 1;
        const se = s + 1;

        if (row > 0) {
          neighbors.push(n);
          if (col > 0) neighbors.push(nw);
          if (col < cols - 1) neighbors.push(ne);
        }
        
        if (row < this.board.rows - 1) {
          neighbors.push(s);
          if (col > 0) neighbors.push(sw);
          if (col < cols - 1) neighbors.push(se);
        }
        
        if (col > 0) neighbors.push(w);
        if (col < cols - 1) neighbors.push(e);

        return neighbors;
      }

      updatePrevious() {
        this.previous = this.alive;
      }

      update() {
        let liveNeighbors = 0;
        
        for (let i = 0; i < this.neighbors.length; i++) {
          const neighborCell = this.board.cells[this.neighbors[i]];
          if (neighborCell && neighborCell.previous) {
            liveNeighbors++;
          }
        }
        
        if (this.previous) {
          this.alive = liveNeighbors === 2 || liveNeighbors === 3;
        } else {
          this.alive = liveNeighbors === 3;
        }
      }
    }

    function HSVtoRGB(h: number, s: number, v: number) {
      let r, g, b;
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);

      switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
      }
      return { r, g, b };
    }

    function generateColor() {
      // Use golden ratio for more harmonious color distribution
      const goldenRatio = 0.618033988749895;
      let hue = Math.random();
      hue += goldenRatio;
      hue %= 1;
      
      // Use fixed saturation and brightness for more consistent colors
      const saturation = 0.5; // Lower saturation for more subtle colors
      const brightness = 0.8; // Lower brightness for a softer glow
      
      const c = HSVtoRGB(hue, saturation, brightness);
      return `rgba(${c.r * 255}, ${c.g * 255}, ${c.b * 255}, 0.6)`; // Lower opacity for better blending
    }

    // Update the board initialization
    const board = new Board(canvas, 5, {
      bg: [0, 0, 0, 0.2],
      alive: [180, 80, 50, 0.6]  // Changed color to be more visible
    });

    board.init();
    board.start();

    const handleResize = () => {
      board.destroy();
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      board.init();
      board.start();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      board.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas id="gol" ref={canvasRef} />;
};

export default GameOfLife;