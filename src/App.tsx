import { useState, useCallback } from 'react'
import './App.css'
import SplashCursor from './SplashCursor'
import GameOfLife from './GameOfLife'

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  const createParticles = useCallback((e: React.MouseEvent) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const size = Math.random() * 3 + 2;
      const destinationX = (Math.random() - 0.5) * 300;
      const destinationY = (Math.random() - 0.5) * 300;
      const rotation = Math.random() * 520;
      const delay = Math.random() * 200;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x + rect.left}px`;
      particle.style.top = `${y + rect.top}px`;
      
      document.body.appendChild(particle);
    
      particle.animate([
        {
          transform: `translate(0, 0) rotate(0deg)`,
          opacity: 1
        },
        {
          transform: `translate(${destinationX}px, ${destinationY}px) rotate(${rotation}deg)`,
          opacity: 0
        }
      ], {
        duration: 1000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        delay: delay
      }).onfinish = () => {
        particle.remove();
        if (i === 29) { // After last particle animation
          setGameStarted(true);
        }
      };
    }
  }, []);

  return (
    <>
      {!gameStarted ? (
        <div className="game-container">
          <SplashCursor />
          <h1 className="game-title">The Game Of Life</h1>
          <button className="start-button" onClick={createParticles}>
            Start Game
          </button>
        </div>
      ) : (
        <div className="game-scene">
          <GameOfLife />
        </div>
      )}
    </>
  );
}

export default App
