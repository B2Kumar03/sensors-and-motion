import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  Vibration,
} from "react-native";
import { useAccelerometer } from "@/hooks/useAccelerometer";

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const BALL_RADIUS = 14;
const WALL_T = 14; // wall thickness
const GRAVITY_SCALE = 3.5;
const FRICTION = 0.88;
const FPS = 60;
const TRAIL_LENGTH = 18;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Vec2 {
  x: number;
  y: number;
}

interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
  id: number;
}

interface Level {
  walls: Wall[];
  coins: Coin[];
  start: Vec2;
  goal: Vec2;
  label: string;
}

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

// ─── Level Builder Helper ──────────────────────────────────────────────────────
const W = SCREEN_W;
const H = SCREEN_H;

function makeWall(x: number, y: number, w: number, h: number): Wall {
  return { x, y, w, h };
}

function makeCoin(x: number, y: number, id: number): Coin {
  return { x, y, collected: false, id };
}

// ─── Levels ───────────────────────────────────────────────────────────────────
const LEVELS: Level[] = [
  // Level 1 — Intro corridor
  {
    label: "Straight & Narrow",
    start: { x: W / 2, y: H * 0.12 },
    goal: { x: W / 2, y: H * 0.82 },
    walls: [
      // outer border
      makeWall(0, 0, W, WALL_T),
      makeWall(0, H - WALL_T, W, WALL_T),
      makeWall(0, 0, WALL_T, H),
      makeWall(W - WALL_T, 0, WALL_T, H),
      // inner walls
      makeWall(WALL_T, H * 0.28, W * 0.55, WALL_T),
      makeWall(W * 0.35, H * 0.48, W * 0.5, WALL_T),
      makeWall(WALL_T, H * 0.66, W * 0.6, WALL_T),
    ],
    coins: [
      makeCoin(W * 0.75, H * 0.35, 1),
      makeCoin(W * 0.2, H * 0.57, 2),
      makeCoin(W * 0.75, H * 0.75, 3),
    ],
  },
  // Level 2 — Zigzag
  {
    label: "Zigzag Rush",
    start: { x: W * 0.15, y: H * 0.1 },
    goal: { x: W * 0.85, y: H * 0.85 },
    walls: [
      makeWall(0, 0, W, WALL_T),
      makeWall(0, H - WALL_T, W, WALL_T),
      makeWall(0, 0, WALL_T, H),
      makeWall(W - WALL_T, 0, WALL_T, H),
      makeWall(WALL_T, H * 0.22, W * 0.7, WALL_T),
      makeWall(W * 0.3, H * 0.38, W * 0.65, WALL_T),
      makeWall(WALL_T, H * 0.54, W * 0.7, WALL_T),
      makeWall(W * 0.3, H * 0.7, W * 0.55, WALL_T),
    ],
    coins: [
      makeCoin(W * 0.85, H * 0.15, 1),
      makeCoin(W * 0.15, H * 0.46, 2),
      makeCoin(W * 0.85, H * 0.62, 3),
      makeCoin(W * 0.15, H * 0.78, 4),
    ],
  },
  // Level 3 — Chambers
  {
    label: "Chamber Run",
    start: { x: W / 2, y: H * 0.08 },
    goal: { x: W / 2, y: H * 0.88 },
    walls: [
      makeWall(0, 0, W, WALL_T),
      makeWall(0, H - WALL_T, W, WALL_T),
      makeWall(0, 0, WALL_T, H),
      makeWall(W - WALL_T, 0, WALL_T, H),
      // chambers
      makeWall(WALL_T, H * 0.2, W * 0.38, WALL_T),
      makeWall(W * 0.62, H * 0.2, W * 0.24, WALL_T),
      makeWall(W * 0.38, H * 0.35, W * 0.48, WALL_T),
      makeWall(WALL_T, H * 0.5, W * 0.45, WALL_T),
      makeWall(W * 0.6, H * 0.5, W * 0.26, WALL_T),
      makeWall(W * 0.3, H * 0.65, W * 0.55, WALL_T),
      makeWall(WALL_T, H * 0.78, W * 0.35, WALL_T),
      makeWall(W * 0.7, H * 0.78, W * 0.16, WALL_T),
    ],
    coins: [
      makeCoin(W * 0.75, H * 0.28, 1),
      makeCoin(W * 0.2, H * 0.42, 2),
      makeCoin(W * 0.8, H * 0.58, 3),
      makeCoin(W * 0.18, H * 0.7, 4),
      makeCoin(W * 0.55, H * 0.84, 5),
    ],
  },
];

// ─── Collision helper ─────────────────────────────────────────────────────────
function resolveWallCollision(
  pos: Vec2,
  vel: Vec2,
  wall: Wall
): { pos: Vec2; vel: Vec2; hit: boolean } {
  const nearX = Math.max(wall.x, Math.min(pos.x, wall.x + wall.w));
  const nearY = Math.max(wall.y, Math.min(pos.y, wall.y + wall.h));
  const dx = pos.x - nearX;
  const dy = pos.y - nearY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < BALL_RADIUS) {
    const overlap = BALL_RADIUS - dist;
    const nx = dist === 0 ? 1 : dx / dist;
    const ny = dist === 0 ? 0 : dy / dist;
    const dot = vel.x * nx + vel.y * ny;
    return {
      pos: { x: pos.x + nx * overlap, y: pos.y + ny * overlap },
      vel: {
        x: (vel.x - 2 * dot * nx) * 0.5,
        y: (vel.y - 2 * dot * ny) * 0.5,
      },
      hit: true,
    };
  }
  return { pos, vel, hit: false };
}

// ─── Particle component ───────────────────────────────────────────────────────
interface ParticleProps {
  x: number;
  y: number;
  onDone: () => void;
}
const Particle: React.FC<ParticleProps> = ({ x, y, onDone }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 2.5, duration: 500, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x - 20,
          top: y - 20,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

// ─── Main Game Component ──────────────────────────────────────────────────────
type GameState = "menu" | "playing" | "paused" | "win" | "levelclear";

const AccelerometerGame: React.FC = () => {
  const { available, x: ax, y: ay } = useAccelerometer();

  const [gameState, setGameState] = useState<GameState>("menu");
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [timer, setTimer] = useState(0);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [, forceRender] = useState(0);

  // Mutable game state refs (avoid re-render on every physics tick)
  const ballPos = useRef<Vec2>({ x: W / 2, y: H * 0.12 });
  const ballVel = useRef<Vec2>({ x: 0, y: 0 });
  const coinsRef = useRef<Coin[]>([]);
  const scoreRef = useRef(0);
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const particleId = useRef(0);
  const accelRef = useRef({ x: 0, y: 0 });
  const gameStateRef = useRef<GameState>("menu");

  // Keep accel ref up to date (accelerometer updates on its own cadence)
  useEffect(() => {
    accelRef.current = { x: ax, y: ay };
  }, [ax, ay]);

  const loadLevel = useCallback((idx: number) => {
    const lvl = LEVELS[idx];
    ballPos.current = { ...lvl.start };
    ballVel.current = { x: 0, y: 0 };
    coinsRef.current = lvl.coins.map((c) => ({ ...c, collected: false }));
    setTrail([]);
    setTimer(0);
    setScore(scoreRef.current);
  }, []);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setTotalCoins(0);
    setLevelIndex(0);
    loadLevel(0);
    setGameState("playing");
    gameStateRef.current = "playing";
  }, [loadLevel]);

  const nextLevel = useCallback(() => {
    const next = levelIndex + 1;
    if (next >= LEVELS.length) {
      setGameState("win");
      gameStateRef.current = "win";
    } else {
      setLevelIndex(next);
      loadLevel(next);
      setGameState("playing");
      gameStateRef.current = "playing";
    }
  }, [levelIndex, loadLevel]);

  // ── Physics loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== "playing") {
      if (loopRef.current) clearInterval(loopRef.current);
      return;
    }

    const lvl = LEVELS[levelIndex];

    loopRef.current = setInterval(() => {
      if (gameStateRef.current !== "playing") return;

      const { x: gx, y: gy } = accelRef.current;
      let vx = ballVel.current.x + gx * GRAVITY_SCALE;
      let vy = ballVel.current.y - gy * GRAVITY_SCALE;
      vx *= FRICTION;
      vy *= FRICTION;

      let px = ballPos.current.x + vx;
      let py = ballPos.current.y + vy;

      // Wall collisions
      for (const wall of lvl.walls) {
        const r = resolveWallCollision({ x: px, y: py }, { x: vx, y: vy }, wall);
        if (r.hit) {
          px = r.pos.x;
          py = r.pos.y;
          vx = r.vel.x;
          vy = r.vel.y;
        }
      }

      ballPos.current = { x: px, y: py };
      ballVel.current = { x: vx, y: vy };

      // Trail update
      setTrail((prev) => {
        const next = [{ x: px, y: py, age: 0 }, ...prev.map((p) => ({ ...p, age: p.age + 1 }))];
        return next.slice(0, TRAIL_LENGTH);
      });

      // Coin collection
      let coinCollected = false;
      coinsRef.current = coinsRef.current.map((c) => {
        if (c.collected) return c;
        const dx = px - c.x;
        const dy = py - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < BALL_RADIUS + 12) {
          coinCollected = true;
          scoreRef.current += 100;
          setScore(scoreRef.current);
          setTotalCoins((t) => t + 1);
          particleId.current += 1;
          const pid = particleId.current;
          setParticles((prev) => [...prev, { id: pid, x: c.x, y: c.y }]);
          Vibration.vibrate(40);
          return { ...c, collected: true };
        }
        return c;
      });

      // Goal check
      const goal = lvl.goal;
      const gdx = px - goal.x;
      const gdy = py - goal.y;
      if (Math.sqrt(gdx * gdx + gdy * gdy) < BALL_RADIUS + 18) {
        Vibration.vibrate([0, 60, 80, 60]);
        scoreRef.current += 500;
        setScore(scoreRef.current);
        gameStateRef.current = "levelclear";
        setGameState("levelclear");
      }

      forceRender((n) => n + 1);
    }, 1000 / FPS);

    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [gameState, levelIndex]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== "playing") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const lvl = LEVELS[levelIndex];
  const bp = ballPos.current;

  // ── Render helpers ───────────────────────────────────────────────────────
  const renderTrail = () =>
    trail.map((p, i) => {
      const alpha = 1 - i / TRAIL_LENGTH;
      const size = BALL_RADIUS * 2 * (1 - i / TRAIL_LENGTH) * 0.85;
      return (
        <View
          key={i}
          style={{
            position: "absolute",
            left: p.x - size / 2,
            top: p.y - size / 2,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: `rgba(120,220,255,${alpha * 0.4})`,
          }}
        />
      );
    });

  const renderWalls = () =>
    lvl.walls.map((w, i) => (
      <View
        key={i}
        style={[
          styles.wall,
          { left: w.x, top: w.y, width: w.w, height: w.h },
        ]}
      />
    ));

  const renderCoins = () =>
    coinsRef.current.map((c) =>
      c.collected ? null : (
        <View
          key={c.id}
          style={[styles.coin, { left: c.x - 10, top: c.y - 10 }]}
        >
          <Text style={styles.coinText}>◉</Text>
        </View>
      )
    );

  const renderGoal = () => (
    <View
      style={[
        styles.goal,
        { left: lvl.goal.x - 22, top: lvl.goal.y - 22 },
      ]}
    >
      <Text style={styles.goalText}>★</Text>
    </View>
  );

  const renderBall = () => (
    <View
      style={[
        styles.ball,
        {
          left: bp.x - BALL_RADIUS,
          top: bp.y - BALL_RADIUS,
        },
      ]}
    >
      <View style={styles.ballSheen} />
    </View>
  );

  const renderParticles = () =>
    particles.map((p) => (
      <Particle
        key={p.id}
        x={p.x}
        y={p.y}
        onDone={() =>
          setParticles((prev) => prev.filter((pp) => pp.id !== p.id))
        }
      />
    ));

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── Menu ─────────────────────────────────────────────────────────────────
  if (gameState === "menu") {
    return (
      <View style={styles.overlay}>
        <StatusBar hidden />
        <View style={styles.menuCard}>
          <Text style={styles.menuTitle}>⬤ GRAVITY{"\n"}MAZE</Text>
          <Text style={styles.menuSub}>Tilt to roll • Collect coins • Reach the star</Text>
          <View style={styles.menuDivider} />
          <Text style={styles.menuLevels}>{LEVELS.length} levels · {LEVELS.reduce((s, l) => s + l.coins.length, 0)} coins</Text>
          {!available && (
            <Text style={styles.warningText}>⚠ Accelerometer unavailable</Text>
          )}
          <TouchableOpacity style={styles.primaryBtn} onPress={startGame} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>PLAY</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Win Screen ────────────────────────────────────────────────────────────
  if (gameState === "win") {
    return (
      <View style={styles.overlay}>
        <StatusBar hidden />
        <View style={styles.menuCard}>
          <Text style={styles.winEmoji}>★</Text>
          <Text style={styles.winTitle}>YOU WON!</Text>
          <Text style={styles.winScore}>Score: {scoreRef.current}</Text>
          <Text style={styles.winCoins}>Coins: {totalCoins}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={startGame} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Level Clear ───────────────────────────────────────────────────────────
  if (gameState === "levelclear") {
    return (
      <View style={styles.overlay}>
        <StatusBar hidden />
        <View style={styles.menuCard}>
          <Text style={styles.winEmoji}>✦</Text>
          <Text style={styles.winTitle}>LEVEL CLEAR</Text>
          <Text style={styles.winScore}>+500 pts · Time: {formatTime(timer)}</Text>
          <Text style={styles.winCoins}>Score: {scoreRef.current}</Text>
          {levelIndex + 1 < LEVELS.length && (
            <Text style={styles.nextLevelLabel}>Next: {LEVELS[levelIndex + 1].label}</Text>
          )}
          <TouchableOpacity style={styles.primaryBtn} onPress={nextLevel} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>
              {levelIndex + 1 < LEVELS.length ? "NEXT LEVEL" : "FINISH"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Game ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.gameRoot}>
      <StatusBar hidden />

      {/* Background grid */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.gridBg} />
      </View>

      {/* Game objects */}
      {renderTrail()}
      {renderWalls()}
      {renderCoins()}
      {renderGoal()}
      {renderBall()}
      {renderParticles()}

      {/* HUD */}
      <View style={styles.hud} pointerEvents="none">
        <View style={styles.hudLeft}>
          <Text style={styles.hudLabel}>SCORE</Text>
          <Text style={styles.hudValue}>{score}</Text>
        </View>
        <View style={styles.hudCenter}>
          <Text style={styles.hudLevelLabel}>
            {levelIndex + 1}/{LEVELS.length} · {lvl.label}
          </Text>
        </View>
        <View style={styles.hudRight}>
          <Text style={styles.hudLabel}>TIME</Text>
          <Text style={styles.hudValue}>{formatTime(timer)}</Text>
        </View>
      </View>

      {/* Pause button */}
      <TouchableOpacity
        style={styles.pauseBtn}
        onPress={() => {
          gameStateRef.current = "paused";
          setGameState("paused");
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.pauseIcon}>⏸</Text>
      </TouchableOpacity>

      {/* Pause overlay */}
      {gameState === "paused" && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>PAUSED</Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                gameStateRef.current = "playing";
                setGameState("playing");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={startGame} activeOpacity={0.8}>
              <Text style={styles.ghostBtnText}>RESTART</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default AccelerometerGame;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  gameRoot: {
    flex: 1,
    backgroundColor: "#0a0e1a",
  },
  gridBg: {
    flex: 1,
    opacity: 0.06,
    backgroundColor: "transparent",
  },

  // ── Walls ──
  wall: {
    position: "absolute",
    backgroundColor: "#1e3a5f",
    borderWidth: 0.5,
    borderColor: "#2a5a9f",
    borderRadius: 3,
  },

  // ── Ball ──
  ball: {
    position: "absolute",
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    backgroundColor: "#78dcff",
    shadowColor: "#78dcff",
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  ballSheen: {
    position: "absolute",
    top: 3,
    left: 4,
    width: BALL_RADIUS * 0.7,
    height: BALL_RADIUS * 0.5,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.45)",
  },

  // ── Coin ──
  coin: {
    position: "absolute",
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  coinText: {
    color: "#f5c518",
    fontSize: 18,
    lineHeight: 20,
    textShadowColor: "#f5c518",
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },

  // ── Goal ──
  goal: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#a8ff78",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(168,255,120,0.08)",
  },
  goalText: {
    color: "#a8ff78",
    fontSize: 22,
    textShadowColor: "#a8ff78",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },

  // ── Particle ──
  particle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(245,197,24,0.6)",
  },

  // ── HUD ──
  hud: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  hudLeft: { alignItems: "flex-start" },
  hudRight: { alignItems: "flex-end" },
  hudCenter: { alignItems: "center", flex: 1, paddingHorizontal: 8 },
  hudLabel: {
    color: "rgba(120,220,255,0.5)",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "600",
  },
  hudValue: {
    color: "#78dcff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1,
  },
  hudLevelLabel: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 6,
  },

  // ── Pause ──
  pauseBtn: {
    position: "absolute",
    top: 44,
    right: 16,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseIcon: { color: "rgba(255,255,255,0.3)", fontSize: 20 },

  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  pauseCard: {
    backgroundColor: "#0f1a2e",
    borderRadius: 20,
    padding: 32,
    borderWidth: 0.5,
    borderColor: "rgba(120,220,255,0.2)",
    alignItems: "center",
    width: 240,
  },
  pauseTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 24,
  },

  // ── Overlay screens ──
  overlay: {
    flex: 1,
    backgroundColor: "#080c17",
    alignItems: "center",
    justifyContent: "center",
  },
  menuCard: {
    backgroundColor: "#0f1a2e",
    borderRadius: 24,
    padding: 36,
    borderWidth: 0.5,
    borderColor: "rgba(120,220,255,0.18)",
    alignItems: "center",
    width: W * 0.82,
  },
  menuTitle: {
    color: "#78dcff",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: 4,
    textAlign: "center",
    lineHeight: 44,
    marginBottom: 12,
    textShadowColor: "#78dcff",
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  menuSub: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  menuDivider: {
    width: 48,
    height: 0.5,
    backgroundColor: "rgba(120,220,255,0.25)",
    marginBottom: 16,
  },
  menuLevels: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 28,
  },
  warningText: {
    color: "#f5c518",
    fontSize: 12,
    marginBottom: 12,
  },

  // ── Win ──
  winEmoji: {
    fontSize: 52,
    color: "#a8ff78",
    marginBottom: 8,
    textShadowColor: "#a8ff78",
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  winTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 4,
    marginBottom: 12,
  },
  winScore: {
    color: "#78dcff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  winCoins: {
    color: "#f5c518",
    fontSize: 14,
    marginBottom: 24,
  },
  nextLevelLabel: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 20,
  },

  // ── Buttons ──
  primaryBtn: {
    backgroundColor: "#78dcff",
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 14,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#0a0e1a",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 3,
  },
  ghostBtn: {
    borderWidth: 0.5,
    borderColor: "rgba(120,220,255,0.3)",
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  ghostBtnText: {
    color: "rgba(120,220,255,0.6)",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 3,
  },
});