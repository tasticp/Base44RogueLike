import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Map,
  Compass,
  Eye,
  Gem,
  Skull,
  BookOpen,
  EyeOff,
  Zap,
  Heart,
  Shield,
  Star,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export const ExplorationSystem = ({ gameState, onExplorationAction, disabled = false }) => {
  const [discoveredAreas, setDiscoveredAreas] = useState([
    { id: "entrance_hall", name: "Entrance Hall", explored: 100, loot: 80, danger: 10 },
    { id: "trap_corridor", name: "Trap Corridor", explored: 45, loot: 60, danger: 40 },
    { id: "treasury", name: "Treasury", explored: 20, loot: 95, danger: 25 },
    { id: "boss_chamber", name: "Boss Chamber", explored: 10, loot: 50, danger: 90 },
    { id: "secret_passage", name: "Secret Passage", explored: 5, loot: 70, danger: 30 },
    { id: "dungeon_depths", name: "Dungeon Depths", explored: 0, loot: 100, danger: 100 },
    { id: "ancient_vault", name: "Ancient Vault", explored: 0, loot: 100, danger: 80 },
    { id: "crystal_caverns", name: "Crystal Caverns", explored: 0, loot: 85, danger: 60 }
  ]);

  const [currentArea, setCurrentArea] = useState("entrance_hall");
  const [explorationProgress, setExplorationProgress] = useState(0);
  const [discoveries, setDiscoveries] = useState([]);
  const [hiddenRooms, setHiddenRooms] = useState([
    { id: "hidden_armory", name: "Hidden Armory", x: 8, y: 3, discovered: false, requires: "trap_setter" },
    { id: "alchemy_lab", name: "Alchemy Lab", x: 15, y: 12, discovered: false, requires: "healer" },
    { id: "summoning_circle", name: "Summoning Circle", x: 3, y: 14, discovered: false, requires: "monster_summoner" },
    { id: "boss_throne", name: "Boss Throne", x: 18, y: 8, discovered: false, requires: "boss_reviver" },
    { id: "merchant_stall", name: "Merchant Stall", x: 10, y: 6, discovered: false, requires: "store_keeper" }
  ]);

  const areaTypes = [
    {
      id: "combat",
      name: "Combat Zone",
      icon: Skull,
      color: "#ef4444",
      description: "High danger, moderate rewards",
      rewards: ["combat_experience", "enemy_materials", "trophies"]
    },
    {
      id: "treasure",
      name: "Treasure Room",
      icon: Gem,
      color: "#fbbf24",
      description: "Moderate danger, high rewards",
      rewards: ["gold", "rare_items", "ancient_artifacts"]
    },
    {
      id: "mystery",
      name: "Mystery Chamber",
      icon: Eye,
      color: "#8b5cf6",
      description: "Unknown danger, unknown rewards",
      rewards: ["knowledge", "rare_spells", "secret_techniques"]
    },
    {
      id: "sanctuary",
      name: "Sanctuary",
      icon: Heart,
      color: "#10b981",
      description: "Low danger, recovery benefits",
      rewards: ["healing", "blessings", "restoration"]
    }
  ];

  const discoveryEvents = [
    {
      id: "ancient_scroll",
      name: "Ancient Scroll",
      description: "A scroll containing forgotten dungeon knowledge",
      icon: BookOpen,
      rarity: "rare",
      effect: "unlock_ability",
      requires: { exploration: 30 }
    },
    {
      id: "crystal_shard",
      name: "Crystal Shard",
      description: "A magical crystal pulsing with energy",
      icon: Zap,
      rarity: "uncommon",
      effect: "mana_boost",
      requires: { exploration: 20 }
    },
    {
      id: "hero_relic",
      name: "Hero's Relic",
      description: "An item left behind by a fallen hero",
      icon: Star,
      rarity: "legendary",
      effect: "power_boost",
      requires: { exploration: 50 }
    },
    {
      id: "dungeon_map",
      name: "Dungeon Map",
      description: "Reveals unexplored areas of the dungeon",
      icon: Map,
      rarity: "common",
      effect: "reveal_areas",
      requires: { exploration: 10 }
    }
  ];

  const exploreArea = async (areaId) => {
    const area = discoveredAreas.find(a => a.id === areaId);
    if (!area || area.explored >= 100 || disabled) return;

    try {
      const result = await onExplorationAction({
        action: "explore",
        areaId,
        currentProgress: area.explored,
        danger: area.danger
      });

      if (result.success) {
        const progressIncrement = Math.floor(Math.random() * 15) + 5;
        const newProgress = Math.min(100, area.explored + progressIncrement);
        
        setDiscoveredAreas(prev => prev.map(a => 
          a.id === areaId ? { ...a, explored: newProgress } : a
        ));

        setExplorationProgress(prev => prev + progressIncrement);

        // Check for discoveries
        if (Math.random() > 0.7 && result.discovery) {
          setDiscoveries(prev => [...prev, {
            ...result.discovery,
            timestamp: new Date(),
            areaId
          }]);
        }

        // Check for hidden rooms
        if (newProgress >= 25) {
          setHiddenRooms(prev => prev.map(room => 
            room.x <= 20 && room.y <= 15 && Math.random() > 0.8 
              ? { ...room, discovered: true }
              : room
          ));
        }

        return result;
      }
      
      return { success: false, error: "Exploration failed" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const unlockHiddenRoom = async (roomId) => {
    const room = hiddenRooms.find(r => r.id === roomId);
    if (!room || room.discovered || disabled) return;

    const role = gameState.session?.npc_role;
    if (room.requires && room.requires !== role) {
      return { success: false, error: "Requires specific role" };
    }

    try {
      const result = await onExplorationAction({
        action: "unlock_room",
        roomId
      });

      if (result.success) {
        setHiddenRooms(prev => prev.map(r => 
          r.id === roomId ? { ...r, discovered: true } : r
        ));
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getExplorationStatusColor = (explored) => {
    if (explored >= 75) return "bg-green-500";
    if (explored >= 50) return "bg-yellow-500";
    if (explored >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "legendary": return "bg-yellow-500 text-yellow-900";
      case "rare": return "bg-purple-500 text-purple-900";
      case "uncommon": return "bg-blue-500 text-blue-900";
      default: return "bg-gray-500 text-gray-900";
    }
  };

  return (
    <div className="space-y-4">
      {/* Exploration Overview */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Compass className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            Dungeon Exploration
            <Badge variant="outline">{explorationProgress}% Complete</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Progress value={explorationProgress} className="h-2 mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {discoveredAreas.map(area => {
              const isLocked = area.explored === 0;
              const isComplete = area.explored >= 100;
              
              return (
                <motion.div
                  key={area.id}
                  whileHover={{ scale: isLocked ? 1 : 1.02 }}
                  className={`p-3 rounded-lg border ${isComplete ? 'border-green-500/30 bg-green-500/10' : isLocked ? 'border-gray-600/30 bg-gray-600/10' : 'border-blue-500/30 bg-blue-500/10'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {area.name}
                    </h5>
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Unlock className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Exploration
                      </span>
                      <span className="text-xs font-medium">{area.explored}%</span>
                    </div>
                    <Progress value={area.explored} className="h-1" />
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Gem className="w-3 h-3 text-yellow-400" />
                        <span style={{ color: 'var(--text-secondary)' }}>Loot: {area.loot}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Skull className="w-3 h-3 text-red-400" />
                        <span style={{ color: 'var(--text-secondary)' }}>Danger: {area.danger}%</span>
                      </div>
                    </div>
                    
                    {!isLocked && !isComplete && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => exploreArea(area.id)}
                        disabled={disabled}
                      >
                        Explore
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hidden Rooms */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <EyeOff className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
            Hidden Chambers
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hiddenRooms.map(room => (
              <motion.div
                key={room.id}
                whileHover={{ scale: room.discovered ? 1 : 1.02 }}
                className={`p-3 rounded-lg border ${room.discovered ? 'border-green-500/30 bg-green-500/10' : 'border-purple-500/30 bg-purple-500/10'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {room.name}
                  </h5>
                  {room.discovered ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Position: ({room.x}, {room.y})
                  </div>
                  <div className="text-xs">
                    Requires: <Badge variant="outline" className="text-xs">{room.requires.replace('_', ' ')}</Badge>
                  </div>
                  
                  {!room.discovered && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => unlockHiddenRoom(room.id)}
                      disabled={disabled}
                    >
                      Unlock
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discoveries */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Star className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            Recent Discoveries
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {discoveries.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
              No discoveries yet. Keep exploring to find hidden treasures!
            </p>
          ) : (
            <div className="space-y-2">
              {discoveries.slice(-5).map((discovery, index) => (
                <motion.div
                  key={`${discovery.id}-${discovery.timestamp}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/20"
                >
                  <discovery.icon className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {discovery.name}
                      </span>
                      <Badge variant="outline" className={`text-xs ${getRarityColor(discovery.rarity)}`}>
                        {discovery.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {discovery.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exploration Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0 p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
            {discoveredAreas.filter(a => a.explored >= 100).length}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Fully Explored
          </div>
        </Card>
        
        <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0 p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-secondary)' }}>
            {hiddenRooms.filter(r => r.discovered).length}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Rooms Found
          </div>
        </Card>
        
        <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0 p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: '#fbbf24' }}>
            {discoveries.length}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Discoveries
          </div>
        </Card>
        
        <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0 p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
            {explorationProgress}%
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Progress
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExplorationSystem;