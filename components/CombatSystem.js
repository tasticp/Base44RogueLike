import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Sword,
  Shield,
  Heart,
  Zap,
  Skull,
  Target,
  Sparkles,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export const CombatSystem = ({ gameState, onCombatAction, disabled = false }) => {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const combatActions = {
    trap_setter: [
      { id: "spike_trap", name: "Spike Trap", damage: 30, cooldown: 3, icon: Target },
      { id: "poison_dart", name: "Poison Dart", damage: 15, cooldown: 2, icon: Skull },
      { id: "pressure_plate", name: "Pressure Plate", damage: 25, cooldown: 4, icon: Shield }
    ],
    healer: [
      { id: "heal_ally", name: "Heal Ally", heal: 40, cooldown: 2, icon: Heart },
      { id: "holy_light", name: "Holy Light", damage: 20, heal: 10, cooldown: 3, icon: Sparkles },
      { id: "regeneration", name: "Regeneration", heal: 15, cooldown: 5, icon: Zap }
    ],
    monster_summoner: [
      { id: "summon_minion", name: "Summon Minion", damage: 10, cooldown: 4, icon: Skull },
      { id: "dark_curse", name: "Dark Curse", damage: 35, cooldown: 5, icon: AlertTriangle },
      { id: "demon_pact", name: "Demon Pact", damage: 50, cooldown: 8, icon: Target }
    ],
    boss_reviver: [
      { id: "empower_boss", name: "Empower Boss", damage: 0, empower: 25, cooldown: 6, icon: Sparkles },
      { id: "revive_fallen", name: "Revive Fallen", heal: 60, cooldown: 8, icon: Heart },
      { id: "final_stand", name: "Final Stand", damage: 40, shield: 30, cooldown: 10, icon: Shield }
    ]
  };

  const getRoleActions = () => {
    const role = gameState.session?.npc_role;
    return combatActions[role] || combatActions.trap_setter;
  };

  const addToCombatLog = (message, type = "action") => {
    const newEntry = {
      id: Date.now(),
      text: message,
      type,
      timestamp: new Date()
    };
    setCombatLog(prev => [...prev.slice(-4), newEntry]);
  };

  const executeCombatAction = async (action) => {
    if (disabled || isAnimating) return;
    
    setIsAnimating(true);
    setSelectedTarget(null);
    
    try {
      const result = await onCombatAction(action, selectedTarget);
      
      if (result.success) {
        addToCombatLog(`${action.name} executed successfully!`, "success");
        if (result.damage) {
          addToCombatLog(`Dealt ${result.damage} damage!`, "damage");
        }
        if (result.heal) {
          addToCombatLog(`Healed ${result.heal} HP!`, "heal");
        }
      } else {
        addToCombatLog(`Action failed: ${result.error}`, "error");
      }
    } catch (error) {
      addToCombatLog(`Combat error: ${error.message}`, "error");
    }
    
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const getCombatTargets = () => {
    return gameState.objects.filter(obj => 
      (obj.object_type === "boss" || obj.object_type === "npc" || obj.object_type === "monster") &&
      obj.health > 0
    );
  };

  const getLogTypeStyle = (type) => {
    switch (type) {
      case "success": return "text-green-400";
      case "damage": return "text-red-400";
      case "heal": return "text-blue-400";
      case "error": return "text-orange-400";
      default: return "text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Combat Header */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sword className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            Combat System
            <Badge variant="outline">
              {gameState.session?.npc_role?.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Target Selection */}
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Select Target:
            </h4>
            <div className="flex flex-wrap gap-2">
              {getCombatTargets().map(target => (
                <Button
                  key={target.id}
                  variant={selectedTarget?.id === target.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTarget(target)}
                  disabled={disabled || isAnimating}
                  className="flex items-center gap-2"
                >
                  <Skull className="w-3 h-3" />
                  {target.object_type} ({target.health}HP)
                </Button>
              ))}
            </div>
          </div>

          {/* Combat Actions */}
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Available Actions:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {getRoleActions().map(action => (
                <motion.div
                  key={action.id}
                  whileHover={{ scale: disabled ? 1 : 1.02 }}
                  whileTap={{ scale: disabled ? 1 : 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => executeCombatAction(action)}
                    disabled={disabled || isAnimating || (!selectedTarget && action.damage)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <action.icon className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{action.name}</div>
                        <div className="text-xs opacity-70">
                          {action.damage && `DMG: ${action.damage}`}
                          {action.heal && ` Heal: ${action.heal}`}
                          {action.empower && ` Empower: ${action.empower}`}
                          {action.shield && ` Shield: ${action.shield}`}
                          {" • CD: " + action.cooldown + "s"}
                        </div>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Combat Log */}
          {combatLog.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Combat Log:
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {combatLog.map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs p-2 rounded bg-black/20"
                  >
                    <span className={getLogTypeStyle(entry.type)}>
                      {entry.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Combat Status */}
      <div className="grid grid-cols-2 gap-4">
        <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0 p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Battle Status
            </span>
          </div>
          <div className="mt-2">
            <Badge variant={isAnimating ? "destructive" : "secondary"} className="w-full justify-center">
              {isAnimating ? "In Combat" : "Ready"}
            </Badge>
          </div>
        </Card>

        <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0 p-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Target Focus
            </span>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="w-full justify-center">
              {selectedTarget ? `${selectedTarget.object_type} Selected` : "No Target"}
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CombatSystem;