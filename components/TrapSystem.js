import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Target,
  Shield,
  Zap,
  Skull,
  AlertTriangle,
  CheckCircle,
  Settings,
  ZapOff,
  Eye,
  EyeOff
} from "lucide-react";

export const TrapSystem = ({ gameState, onTrapAction, disabled = false }) => {
  const [selectedTrapType, setSelectedTrapType] = useState("");
  const [placementMode, setPlacementMode] = useState(false);
  const [trapInventory, setTrapInventory] = useState({
    spike_trap: { count: 5, damage: 25, cost: 10 },
    poison_dart: { count: 3, damage: 15, cost: 15 },
    pressure_plate: { count: 4, damage: 20, cost: 12 },
    fire_trap: { count: 2, damage: 35, cost: 25 },
    ice_trap: { count: 2, damage: 15, cost: 20 },
    electric_trap: { count: 1, damage: 40, cost: 30 }
  });

  const trapTypes = [
    {
      id: "spike_trap",
      name: "Spike Trap",
      description: "Classic mechanical spike trap",
      icon: Target,
      color: "#e53e3e",
      damage: 25,
      cost: 10,
      requirements: ["mechanical_skill: 1"]
    },
    {
      id: "poison_dart",
      name: "Poison Dart",
      description: "Launches poisoned darts at targets",
      icon: Skull,
      color: "#9f7aea",
      damage: 15,
      cost: 15,
      requirements: ["poison_skill: 1"]
    },
    {
      id: "pressure_plate",
      name: "Pressure Plate",
      description: "Triggers when stepped on",
      icon: Shield,
      color: "#4299e1",
      damage: 20,
      cost: 12,
      requirements: ["mechanical_skill: 2"]
    },
    {
      id: "fire_trap",
      name: "Fire Trap",
      description: "Burns enemies with magical fire",
      icon: Zap,
      color: "#f56565",
      damage: 35,
      cost: 25,
      requirements: ["magic_skill: 2", "fire_resistance"]
    },
    {
      id: "ice_trap",
      name: "Ice Trap",
      description: "Freezes targets in place",
      icon: ZapOff,
      color: "#63b3ed",
      damage: 15,
      cost: 20,
      requirements: ["magic_skill: 1", "ice_resistance"]
    },
    {
      id: "electric_trap",
      name: "Electric Trap",
      description: "Shocks multiple nearby enemies",
      icon: Zap,
      color: "#fbbf24",
      damage: 40,
      cost: 30,
      requirements: ["magic_skill: 3", "engineering_skill: 2"]
    }
  ];

  const getExistingTraps = () => {
    return gameState.objects.filter(obj => obj.object_type === "trap");
  };

  const handleTrapPlacement = async (position) => {
    if (!selectedTrapType || !placementMode || disabled) return;
    
    const trap = trapTypes.find(t => t.id === selectedTrapType);
    const inventory = trapInventory[selectedTrapType];
    
    if (inventory.count <= 0) {
      return { success: false, error: "No traps left of this type" };
    }
    
    try {
      const result = await onTrapAction({
        action: "place_trap",
        trapType: selectedTrapType,
        position,
        damage: trap.damage
      });
      
      if (result.success) {
        setTrapInventory(prev => ({
          ...prev,
          [selectedTrapType]: {
            ...prev[selectedTrapType],
            count: prev[selectedTrapType].count - 1
          }
        }));
        setPlacementMode(false);
        setSelectedTrapType("");
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleTrapActivation = async (trapId) => {
    try {
      const result = await onTrapAction({
        action: "activate_trap",
        trapId
      });
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleTrapDeactivation = async (trapId) => {
    try {
      const result = await onTrapAction({
        action: "deactivate_trap",
        trapId
      });
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleTrapUpgrade = async (trapId) => {
    try {
      const result = await onTrapAction({
        action: "upgrade_trap",
        trapId
      });
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getTrapStatusColor = (state) => {
    switch (state) {
      case "active": return "bg-green-500";
      case "inactive": return "bg-gray-500";
      case "triggered": return "bg-red-500";
      case "broken": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getTrapStatusText = (state) => {
    switch (state) {
      case "active": return "Armed";
      case "inactive": return "Disarmed";
      case "triggered": return "Triggered";
      case "broken": return "Broken";
      default: return "Unknown";
    }
  };

  return (
    <div className="space-y-4">
      {/* Trap Control Panel */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Target className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            Trap Control System
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Trap Selection */}
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Select Trap Type:
            </h4>
            <Select value={selectedTrapType} onValueChange={setSelectedTrapType} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a trap to place..." />
              </SelectTrigger>
              <SelectContent>
                {trapTypes.map(trap => (
                  <SelectItem key={trap.id} value={trap.id} disabled={trapInventory[trap.id].count === 0}>
                    <div className="flex items-center gap-2">
                      <trap.icon className="w-4 h-4" style={{ color: trap.color }} />
                      <span>{trap.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {trapInventory[trap.id].count}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Trap Details */}
          {selectedTrapType && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-black/20"
            >
              {(() => {
                const trap = trapTypes.find(t => t.id === selectedTrapType);
                const inventory = trapInventory[selectedTrapType];
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <trap.icon className="w-5 h-5" style={{ color: trap.color }} />
                      <h5 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {trap.name}
                      </h5>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {trap.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="opacity-70">Damage:</span>
                        <span className="ml-1 font-medium" style={{ color: 'var(--accent-primary)' }}>
                          {trap.damage}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-70">Cost:</span>
                        <span className="ml-1 font-medium" style={{ color: 'var(--accent-secondary)' }}>
                          {trap.cost} gold
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={inventory.count > 0 ? "secondary" : "destructive"}>
                        {inventory.count} in inventory
                      </Badge>
                      {placementMode && (
                        <Badge variant="outline" className="animate-pulse">
                          Click on map to place
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant={placementMode ? "destructive" : "default"}
              onClick={() => setPlacementMode(!placementMode)}
              disabled={!selectedTrapType || disabled}
              className="flex-1"
            >
              {placementMode ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Cancel Placement
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Place Trap
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Traps */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Settings className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
            Active Traps ({getExistingTraps().length})
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {getExistingTraps().length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
              No traps placed yet. Place your first trap to begin!
            </p>
          ) : (
            <div className="space-y-2">
              {getExistingTraps().map((trap, index) => (
                <motion.div
                  key={trap.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/20"
                >
                  <div className={`w-3 h-3 rounded-full ${getTrapStatusColor(trap.state)}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Trap #{index + 1}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getTrapStatusText(trap.state)}
                      </Badge>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Position: ({trap.position.x}, {trap.position.y})
                      {trap.damage && ` • DMG: ${trap.damage}`}
                      {trap.level && ` • Level: ${trap.level}`}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {trap.state === "inactive" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTrapActivation(trap.id)}
                        disabled={disabled}
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    )}
                    {trap.state === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTrapDeactivation(trap.id)}
                        disabled={disabled}
                      >
                        <EyeOff className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTrapUpgrade(trap.id)}
                      disabled={disabled || trap.state === "broken"}
                    >
                      <Zap className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trap Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0 p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
            {getExistingTraps().filter(t => t.state === "active").length}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Active Traps
          </div>
        </Card>
        
        <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0 p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-secondary)' }}>
            {Object.values(trapInventory).reduce((sum, trap) => sum + trap.count, 0)}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            In Inventory
          </div>
        </Card>
        
        <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0 p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
            {getExistingTraps().filter(t => t.state === "broken").length}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Need Repair
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TrapSystem;