import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameState, RunStats, DebugConfig, HoldGravityTelemetry } from './game/types';
import { TitleScreen } from './components/TitleScreen';
import { HudOverlay } from './components/HudOverlay';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { TipsModal } from './components/TipsModal';
import { DebugMenu } from './components/DebugMenu';
import { sound } from './game/SoundSystem';
import gameConfigJson from './game/game-config.json';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('title');
  const [scoreYears, setScoreYears] = useState<number>(0);
  const [bestScoreYears, setBestScoreYears] = useState<number>(0);
  const [eraName, setEraName] = useState<string>('QUATERNARY SHIFT');
  const [dinoAlert, setDinoAlert] = useState<string | null>(null);
  const [warpAlert, setWarpAlert] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastRunStats, setLastRunStats] = useState<RunStats | null>(null);
  const [showTips, setShowTips] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [holdTelemetry, setHoldTelemetry] = useState<HoldGravityTelemetry | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(180);
  const [isPortrait, setIsPortrait] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < window.innerHeight);

  // Check if debug features are allowed: enabled in development, or with ?debug=1 URL parameter
  const isDebugAllowed = import.meta.env.DEV || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1');

  // Load configuration from game-config.json
  const [debugConfig, setDebugConfigState] = useState<DebugConfig>(() => ({
    corridorBaseHeight: gameConfigJson.corridorBaseHeight ?? 330,
    corridorMinHeight: gameConfigJson.corridorMinHeight ?? 230,
    fluctuationAmplitude: gameConfigJson.fluctuationAmplitude ?? 75,
    fluctuationFrequency: gameConfigJson.fluctuationFrequency ?? 0.0032,
    scrollSpeed: gameConfigJson.scrollSpeed ?? 180,
    gravity: gameConfigJson.gravity ?? 820,
    upwardImpulse: gameConfigJson.upwardImpulse ?? -340,
    godMode: false,
    wormholeSpawnChance: gameConfigJson.wormholeSpawnChance ?? 0.40,
    blackholeSpawnChance: gameConfigJson.blackholeSpawnChance ?? 0.35,
    variableGravityOnHold: gameConfigJson.variableGravityOnHold ?? true,
    holdGravityMode: (gameConfigJson.holdGravityMode as DebugConfig['holdGravityMode']) ?? 'progressive_float',
    holdMaxDuration: gameConfigJson.holdMaxDuration ?? 0.45,
    holdGravityMultiplier: gameConfigJson.holdGravityMultiplier ?? 0.22,
    holdThrustPower: gameConfigJson.holdThrustPower ?? 650
  }));

  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warpTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    setIsMuted(sound.getMuted());

    const engine = new GameEngine(canvasRef.current, {
      onStateChange: (state: GameState) => {
        setGameState(state);
      },
      onScoreUpdate: (score: number, best: number, era: string, speed?: number) => {
        setScoreYears(score);
        setBestScoreYears(best);
        setEraName(era);
        if (speed !== undefined) {
          setCurrentSpeed(speed);
        }
      },
      onGameOver: (stats: RunStats) => {
        setLastRunStats(stats);
      },
      onDinoAlert: (name: string) => {
        setDinoAlert(name);
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = setTimeout(() => {
          setDinoAlert(null);
        }, 2600);
      },
      onWarpAlert: (msg: string) => {
        setWarpAlert(msg);
        if (warpTimeoutRef.current) clearTimeout(warpTimeoutRef.current);
        warpTimeoutRef.current = setTimeout(() => {
          setWarpAlert(null);
        }, 2200);
      },
      onHoldGravityTelemetry: (telemetry) => {
        setHoldTelemetry(telemetry);
      }
    });

    engineRef.current = engine;
    setBestScoreYears(engine.getBestScore());
    setDebugConfigState(engine.getDebugConfig());

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      engine.startGame();
    }

    const handleResize = () => {
      setIsPortrait(window.innerWidth < window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      engine.destroy();
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      if (warpTimeoutRef.current) clearTimeout(warpTimeoutRef.current);
    };
  }, []);

  const handleStartGame = useCallback(() => {
    setShowTips(false);
    engineRef.current?.startGame();
  }, []);

  const handlePause = useCallback(() => {
    engineRef.current?.pauseGame();
  }, []);

  const handleResume = useCallback(() => {
    engineRef.current?.resumeGame();
  }, []);

  const handleReturnToTitle = useCallback(() => {
    engineRef.current?.returnToTitle();
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleDebugChange = useCallback((partial: Partial<DebugConfig>) => {
    if (!engineRef.current) return;
    engineRef.current.setDebugConfig(partial);
    setDebugConfigState(engineRef.current.getDebugConfig());
  }, []);

  const handleDebugReset = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.resetDebugConfig();
    setDebugConfigState(engineRef.current.getDebugConfig());
  }, []);

  const handleSpawnWormhole = useCallback(() => {
    engineRef.current?.spawnWormholeNow();
  }, []);

  const handleSpawnBlackHole = useCallback((spin: 'clockwise' | 'counter_clockwise') => {
    engineRef.current?.spawnBlackHoleNow(spin);
  }, []);

  return (
    <main
      className="fixed inset-0 w-full h-full overflow-hidden bg-[#05070f] flex items-center justify-center touch-none select-none"
      data-testid="game-container"
    >
      {/* Isolated Canvas Viewport */}
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className="w-full h-full block cursor-pointer touch-none"
      />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          bestScore={bestScoreYears}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStart={handleStartGame}
          onOpenTips={() => setShowTips(true)}
          onToggleDebug={isDebugAllowed ? () => setShowDebug(prev => !prev) : undefined}
          isDebugOpen={isDebugAllowed && showDebug}
          isPortrait={isPortrait}
        />
      )}

      {/* Playing HUD Overlay */}
      {gameState === 'playing' && (
        <HudOverlay
          scoreYears={scoreYears}
          bestScoreYears={bestScoreYears}
          eraName={eraName}
          isMuted={isMuted}
          dinoAlert={dinoAlert}
          warpAlert={warpAlert}
          godMode={debugConfig.godMode}
          isDebugOpen={isDebugAllowed && showDebug}
          variableGravityOnHold={debugConfig.variableGravityOnHold}
          holdTelemetry={holdTelemetry}
          currentSpeed={currentSpeed}
          onPause={handlePause}
          onToggleMute={handleToggleMute}
          onToggleDebug={isDebugAllowed ? () => setShowDebug(prev => !prev) : undefined}
        />
      )}

      {/* Paused Modal */}
      {gameState === 'paused' && (
        <PauseModal
          scoreYears={scoreYears}
          onResume={handleResume}
          onRestart={handleStartGame}
          onTitle={handleReturnToTitle}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          stats={lastRunStats}
          onRestart={handleStartGame}
          onTitle={handleReturnToTitle}
        />
      )}

      {/* Time Warp Tips Modal */}
      {showTips && (
        <TipsModal onClose={() => setShowTips(false)} />
      )}

      {/* Live Cave & Physics Debug Tuning Menu (Hidden in production) */}
      {isDebugAllowed && showDebug && (
        <DebugMenu
          config={debugConfig}
          onChange={handleDebugChange}
          onReset={handleDebugReset}
          onSpawnWormhole={handleSpawnWormhole}
          onSpawnBlackHole={handleSpawnBlackHole}
          onClose={() => setShowDebug(false)}
          telemetry={holdTelemetry}
        />
      )}
    </main>
  );
}
