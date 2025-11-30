import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useSounds } from '../contexts/SoundContext';
import { useSettings } from '../contexts/SettingsContext';

interface NeonDiceFlashProps {
  dice1: number;
  dice2: number;
  isRolling: boolean;
}

export function NeonDiceFlash({ dice1, dice2, isRolling }: NeonDiceFlashProps) {
  const [showResult, setShowResult] = useState(false);
  const [targetDice1, setTargetDice1] = useState(dice1);
  const [targetDice2, setTargetDice2] = useState(dice2);
  const [dice1Position, setDice1Position] = useState({ x: -80, y: 0 });
  const [dice2Position, setDice2Position] = useState({ x: 80, y: 0 });
  const [dice1Rotation, setDice1Rotation] = useState({ x: 0, y: 0, z: 0 });
  const [dice2Rotation, setDice2Rotation] = useState({ x: 0, y: 0, z: 0 });
  const [collisionFlashes, setCollisionFlashes] = useState<Array<{ id: number; x: number; y: number; time: number }>>([]);
  const { playDiceRoll, playDieLock } = useSounds();
  const { settings } = useSettings();

  // Get final rotation for each dice value - CORRECTED FOR PERFECT DISPLAY!
  const getFinalRotation = (value: number) => {
    const rotations: { [key: number]: { x: number; y: number; z: number } } = {
      1: { x: 0, y: 0, z: 0 },        // Front face (1 dot center)
      2: { x: 0, y: 90, z: 0 },       // Right face (2 dots diagonal)
      3: { x: 0, y: 0, z: 90 },       // Top face (3 dots diagonal)
      4: { x: 0, y: 0, z: -90 },      // Bottom face (4 dots corners)
      5: { x: 0, y: -90, z: 0 },      // Left face (5 dots)
      6: { x: 0, y: 180, z: 0 },      // Back face (6 dots)
    };
    return rotations[value] || rotations[1];
  };

  // Add collision flash effect
  const addCollisionFlash = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    setCollisionFlashes(prev => [...prev, { id, x, y, time: Date.now() }]);
    setTimeout(() => {
      setCollisionFlashes(prev => prev.filter(f => f.id !== id));
    }, 300);
  };

  useEffect(() => {
    if (isRolling) {
      console.log('🎲🎲🎲 DICE ROLLING STARTED! 🎲🎲🎲');
      console.log('🎯 TRUE DICE VALUES:', { dice1, dice2, total: dice1 + dice2 });
      
      setTargetDice1(dice1);
      setTargetDice2(dice2);
      setShowResult(false);
      setCollisionFlashes([]);
      
      // SINGLE DICE SOUND SYNCED WITH ROLL!
      console.log('🎲 Playing dice sound - ONCE!');
      playDiceRoll();
      
      // REALISTIC PHYSICS SIMULATION
      const startTime = Date.now();
      const duration = 4800;
      
      const bounds = {
        left: -200,
        right: 200,
        top: -130,
        bottom: 110,
      };
      
      let dice1Vel = {
        x: (Math.random() - 0.5) * 6,
        y: -5 - Math.random() * 3,
      };
      let dice2Vel = {
        x: (Math.random() - 0.5) * 6,
        y: -5 - Math.random() * 3,
      };
      
      let pos1 = { x: -80, y: 20 };
      let pos2 = { x: 80, y: 20 };
      
      let rot1 = { x: 0, y: 0, z: 0 };
      let rot2 = { x: 0, y: 0, z: 0 };
      let rotSpeed1 = { 
        x: (Math.random() - 0.5) * 30, 
        y: (Math.random() - 0.5) * 30, 
        z: (Math.random() - 0.5) * 30 
      };
      let rotSpeed2 = { 
        x: (Math.random() - 0.5) * 30, 
        y: (Math.random() - 0.5) * 30, 
        z: (Math.random() - 0.5) * 30 
      };
      
      const gravity = 0.25;
      const damping = 0.75;
      const minVelocity = 0.5;
      
      let lastTime = Date.now();
      
      const physicsInterval = setInterval(() => {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 16;
        lastTime = currentTime;
        
        const elapsed = currentTime - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
          clearInterval(physicsInterval);
          
          setDice1Position({ x: -80, y: 20 });
          setDice2Position({ x: 80, y: 20 });
          setDice1Rotation(getFinalRotation(targetDice1));
          setDice2Rotation(getFinalRotation(targetDice2));
          
          if (settings.soundEffects) {
            playDieLock();
            setTimeout(() => playDieLock(), 150);
          }
          
          setTimeout(() => {
            setShowResult(true);
            console.log('🎲 SHOWING FINAL TRUE RESULT:', { dice1: targetDice1, dice2: targetDice2 });
          }, 200);
          
          return;
        }
        
        let speedMultiplier = 1;
        if (progress > 0.65) {
          speedMultiplier = 1 - ((progress - 0.65) / 0.35) * 0.7;
        }
        
        dice1Vel.y += gravity * deltaTime;
        dice2Vel.y += gravity * deltaTime;
        
        pos1.x += dice1Vel.x * speedMultiplier * deltaTime;
        pos1.y += dice1Vel.y * speedMultiplier * deltaTime;
        pos2.x += dice2Vel.x * speedMultiplier * deltaTime;
        pos2.y += dice2Vel.y * speedMultiplier * deltaTime;
        
        // Collisions
        if (pos1.x <= bounds.left) {
          dice1Vel.x = Math.abs(dice1Vel.x) * damping;
          pos1.x = bounds.left;
          addCollisionFlash(bounds.left, pos1.y);
        }
        if (pos1.x >= bounds.right) {
          dice1Vel.x = -Math.abs(dice1Vel.x) * damping;
          pos1.x = bounds.right;
          addCollisionFlash(bounds.right, pos1.y);
        }
        if (pos1.y <= bounds.top) {
          dice1Vel.y = Math.abs(dice1Vel.y) * damping;
          pos1.y = bounds.top;
          addCollisionFlash(pos1.x, bounds.top);
        }
        if (pos1.y >= bounds.bottom) {
          if (Math.abs(dice1Vel.y) > minVelocity) {
            dice1Vel.y = -Math.abs(dice1Vel.y) * damping;
          } else {
            dice1Vel.y = 0;
          }
          pos1.y = bounds.bottom;
          addCollisionFlash(pos1.x, bounds.bottom);
        }
        
        if (pos2.x <= bounds.left) {
          dice2Vel.x = Math.abs(dice2Vel.x) * damping;
          pos2.x = bounds.left;
          addCollisionFlash(bounds.left, pos2.y);
        }
        if (pos2.x >= bounds.right) {
          dice2Vel.x = -Math.abs(dice2Vel.x) * damping;
          pos2.x = bounds.right;
          addCollisionFlash(bounds.right, pos2.y);
        }
        if (pos2.y <= bounds.top) {
          dice2Vel.y = Math.abs(dice2Vel.y) * damping;
          pos2.y = bounds.top;
          addCollisionFlash(pos2.x, bounds.top);
        }
        if (pos2.y >= bounds.bottom) {
          if (Math.abs(dice2Vel.y) > minVelocity) {
            dice2Vel.y = -Math.abs(dice2Vel.y) * damping;
          } else {
            dice2Vel.y = 0;
          }
          pos2.y = bounds.bottom;
          addCollisionFlash(pos2.x, bounds.bottom);
        }
        
        const distance = Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
        if (distance < 80) {
          const temp = { ...dice1Vel };
          dice1Vel.x = dice2Vel.x * 0.8;
          dice1Vel.y = dice2Vel.y * 0.8;
          dice2Vel.x = temp.x * 0.8;
          dice2Vel.y = temp.y * 0.8;
          
          const angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
          pos1.x -= Math.cos(angle) * 2;
          pos1.y -= Math.sin(angle) * 2;
          pos2.x += Math.cos(angle) * 2;
          pos2.y += Math.sin(angle) * 2;
          
          addCollisionFlash((pos1.x + pos2.x) / 2, (pos1.y + pos2.y) / 2);
        }
        
        rot1.x += rotSpeed1.x * speedMultiplier * deltaTime;
        rot1.y += rotSpeed1.y * speedMultiplier * deltaTime;
        rot1.z += rotSpeed1.z * speedMultiplier * deltaTime;
        rot2.x += rotSpeed2.x * speedMultiplier * deltaTime;
        rot2.y += rotSpeed2.y * speedMultiplier * deltaTime;
        rot2.z += rotSpeed2.z * speedMultiplier * deltaTime;
        
        rotSpeed1.x *= 0.98;
        rotSpeed1.y *= 0.98;
        rotSpeed1.z *= 0.98;
        rotSpeed2.x *= 0.98;
        rotSpeed2.y *= 0.98;
        rotSpeed2.z *= 0.98;
        
        dice1Vel.x *= 0.99;
        dice2Vel.x *= 0.99;
        
        setDice1Position({ ...pos1 });
        setDice2Position({ ...pos2 });
        setDice1Rotation({ ...rot1 });
        setDice2Rotation({ ...rot2 });
        
      }, 16);

      return () => clearInterval(physicsInterval);
    }
  }, [isRolling, dice1, dice2, settings.soundEffects, playDiceRoll, playDieLock]);

  if (!isRolling && !showResult) {
    return null;
  }

  // PERFECT DICE DOTS - Casino style
  const getDots = (value: number) => {
    const dotConfigs: { [key: number]: Array<{ x: number; y: number }> } = {
      1: [{ x: 50, y: 50 }],
      2: [{ x: 30, y: 30 }, { x: 70, y: 70 }],
      3: [{ x: 30, y: 30 }, { x: 50, y: 50 }, { x: 70, y: 70 }],
      4: [{ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 30, y: 70 }, { x: 70, y: 70 }],
      5: [{ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 50, y: 50 }, { x: 30, y: 70 }, { x: 70, y: 70 }],
      6: [{ x: 30, y: 25 }, { x: 70, y: 25 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 75 }, { x: 70, y: 75 }],
    };
    
    return dotConfigs[value].map((pos, i) => (
      <div
        key={i}
        className="absolute bg-black rounded-full"
        style={{
          width: '28px', // BIGGER DOTS for 180px dice!
          height: '28px',
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
        }}
      />
    ));
  };

  // PERFECT 3D DICE CUBE - ALL SIDES GLUED TOGETHER!
  const createDiceCube = (topValue: number) => {
    const size = 180; // HUGE DICE - was 100!
    const half = size / 2;
    
    // Standard dice: opposite sides add up to 7
    const oppositeFace = (n: number) => 7 - n;
    
    return (
      <div 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* FRONT FACE - Shows topValue */}
        <div style={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
          border: '3px solid #ddd',
          borderRadius: '10px',
          transform: `translateZ(${half}px)`,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
          backfaceVisibility: 'visible',
        }}>
          {getDots(topValue)}
        </div>
        
        {/* BACK FACE - Opposite of front (7 - topValue) */}
        <div style={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
          border: '3px solid #ddd',
          borderRadius: '10px',
          transform: `translateZ(-${half}px) rotateY(180deg)`,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
          backfaceVisibility: 'visible',
        }}>
          {getDots(oppositeFace(topValue))}
        </div>
        
        {/* RIGHT FACE - Value 2 (if topValue is 1), etc */}
        <div style={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
          border: '3px solid #ddd',
          borderRadius: '10px',
          transform: `rotateY(90deg) translateZ(${half}px)`,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
          backfaceVisibility: 'visible',
        }}>
          {getDots(topValue === 1 ? 2 : topValue === 2 ? 1 : topValue === 3 ? 2 : topValue === 4 ? 5 : topValue === 5 ? 4 : 3)}
        </div>
        
        {/* LEFT FACE - Opposite of right */}
        <div style={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
          border: '3px solid #ddd',
          borderRadius: '10px',
          transform: `rotateY(-90deg) translateZ(${half}px)`,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
          backfaceVisibility: 'visible',
        }}>
          {getDots(topValue === 1 ? 5 : topValue === 2 ? 6 : topValue === 3 ? 5 : topValue === 4 ? 2 : topValue === 5 ? 1 : 4)}
        </div>
        
        {/* TOP FACE - Value 3 (if topValue is 1), etc */}
        <div style={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
          border: '3px solid #ddd',
          borderRadius: '10px',
          transform: `rotateX(90deg) translateZ(${half}px)`,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
          backfaceVisibility: 'visible',
        }}>
          {getDots(topValue === 1 ? 3 : topValue === 2 ? 3 : topValue === 3 ? 6 : topValue === 4 ? 1 : topValue === 5 ? 3 : 2)}
        </div>
        
        {/* BOTTOM FACE - Opposite of top */}
        <div style={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
          border: '3px solid #ddd',
          borderRadius: '10px',
          transform: `rotateX(-90deg) translateZ(${half}px)`,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
          backfaceVisibility: 'visible',
        }}>
          {getDots(topValue === 1 ? 4 : topValue === 2 ? 4 : topValue === 3 ? 1 : topValue === 4 ? 6 : topValue === 5 ? 4 : 5)}
        </div>
      </div>
    );
  };

  const total = targetDice1 + targetDice2;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 40 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isRolling ? 0.95 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black"
      />

      <div className="relative" style={{ perspective: '2000px' }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}
          className="relative"
          style={{
            width: '800px',
            height: '600px',
          }}
        >
          {/* Machine Frame */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)',
              boxShadow: '0 10px 50px rgba(0,0,0,0.8), inset 0 2px 10px rgba(255,255,255,0.1), inset 0 -2px 10px rgba(0,0,0,0.5)',
              padding: '30px',
              border: '4px solid #1a252f',
            }}
          >
            {/* OVAL GLASS BUBBLE */}
            <div 
              className="absolute inset-0 m-7 overflow-hidden"
              style={{
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                border: '5px solid rgba(255,255,255,0.4)',
                boxShadow: `
                  0 15px 60px rgba(0,0,0,0.6),
                  inset 0 0 40px rgba(255,255,255,0.15),
                  inset 0 5px 20px rgba(255,255,255,0.2),
                  inset 0 -5px 20px rgba(0,0,0,0.3)
                `,
                backdropFilter: 'blur(2px)',
              }}
            >
              {/* Green felt floor */}
              <div 
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: '90px',
                  background: 'linear-gradient(180deg, #1a5e1a 0%, #0d4d0d 100%)',
                  boxShadow: 'inset 0 3px 15px rgba(0,0,0,0.6)',
                  borderRadius: '0 0 50% 50% / 0 0 30% 30%',
                }}
              />
              
              {/* 3D Dice Container */}
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ 
                  transformStyle: 'preserve-3d',
                  perspective: '2000px',
                }}
              >
                {/* DICE 1 - PERFECT 3D CUBE */}
                <motion.div
                  style={{
                    position: 'absolute',
                    x: dice1Position.x,
                    y: dice1Position.y,
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${dice1Rotation.x}deg) rotateY(${dice1Rotation.y}deg) rotateZ(${dice1Rotation.z}deg)`,
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                  }}
                  transition={{ duration: 0 }}
                >
                  {createDiceCube(targetDice1)}
                </motion.div>

                {/* DICE 2 - PERFECT 3D CUBE */}
                <motion.div
                  style={{
                    position: 'absolute',
                    x: dice2Position.x,
                    y: dice2Position.y,
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${dice2Rotation.x}deg) rotateY(${dice2Rotation.y}deg) rotateZ(${dice2Rotation.z}deg)`,
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                  }}
                  transition={{ duration: 0 }}
                >
                  {createDiceCube(targetDice2)}
                </motion.div>

                {/* Collision Flashes */}
                {collisionFlashes.map(flash => (
                  <motion.div
                    key={flash.id}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: 'absolute',
                      left: flash.x,
                      top: flash.y,
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,220,100,0.6) 50%, transparent 100%)',
                      pointerEvents: 'none',
                    }}
                  />
                ))}
              </div>

              {/* Glass reflections */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)',
                  borderRadius: '50%',
                }}
              />
              
              <div 
                className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center top, rgba(255,255,255,0.25) 0%, transparent 60%)',
                  borderRadius: '50% 50% 0 0',
                }}
              />
            </div>

            {/* LED indicators */}
            <div className="absolute top-8 right-8 flex gap-2">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-green-400"
                style={{ boxShadow: '0 0 10px #4ade80' }}
              />
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-blue-400"
                style={{ boxShadow: '0 0 10px #60a5fa' }}
              />
            </div>
          </div>

          {/* "ROLLING..." text */}
          {isRolling && !showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-20 left-1/2 -translate-x-1/2"
            >
              <div
                className="text-white text-4xl font-bold tracking-widest"
                style={{
                  textShadow: '0 0 30px #fff, 0 0 60px #667eea, 0 0 90px #f093fb',
                }}
              >
                ROLLING...
              </div>
              {/* DEBUG: Show rotation values */}
              <div className="text-white text-xs mt-4 font-mono">
                D1: X:{dice1Rotation.x.toFixed(0)}° Y:{dice1Rotation.y.toFixed(0)}° Z:{dice1Rotation.z.toFixed(0)}°
                <br />
                D2: X:{dice2Rotation.x.toFixed(0)}° Y:{dice2Rotation.y.toFixed(0)}° Z:{dice2Rotation.z.toFixed(0)}°
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Result Display */}
        {showResult && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="absolute -bottom-32 left-1/2 -translate-x-1/2"
          >
            <div
              className="px-10 py-6 rounded-3xl flex items-center gap-6"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                boxShadow: `0 0 60px #fbbf24, 0 0 120px #f59e0b`,
                border: '3px solid #fff',
              }}
            >
              <div className="text-center">
                <div className="text-white text-sm font-bold tracking-widest mb-2">TOTAL</div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 0.3 }}
                  className="text-white text-7xl font-bold"
                  style={{
                    textShadow: '0 0 30px #fff, 0 0 60px #fff',
                  }}
                >
                  {total}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sparkles */}
        {showResult && (
          <>
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  x: Math.cos((i / 16) * Math.PI * 2) * 200,
                  y: Math.sin((i / 16) * Math.PI * 2) * 200,
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 1.5, delay: 0.2 + (i * 0.02), ease: 'easeOut' }}
                className="absolute w-4 h-4 rounded-full bg-white"
                style={{
                  left: '50%',
                  top: '50%',
                  boxShadow: '0 0 15px #fff, 0 0 30px #fbbf24',
                }}
              />
            ))}
          </>
        )}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2.5, duration: 0.6 }}
          onAnimationComplete={() => setShowResult(false)}
          className="absolute inset-0"
        />
      )}
    </div>
  );
}