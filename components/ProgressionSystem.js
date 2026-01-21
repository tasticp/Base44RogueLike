import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Star,
  Zap,
  Shield,
  Heart,
  Sword,
  Brain,
  Target,
  Crown,
  Award,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from "lucide-react";

export const ProgressionSystem = ({ gameState, onProgressionAction, disabled = false }) => {
  const [characterStats, setCharacterStats] = useState({
    level: 1,
    experience: 0,
    experienceToNext: 100,
    skillPoints: 0,
    totalExperience: 0,
    rank: "Novice"
  });

  const [skills, setSkills] = useState({
    mechanical_skill: { level: 1, experience: 0, max: 10, description: "Trap building and repair" },
    combat_skill: { level: 1, experience: 0, max: 10, description: "Combat effectiveness" },
    magic_skill: { level: 1, experience: 0, max: 10, description: "Magical abilities" },
    stealth_skill: { level: 1, experience: 0, max: 10, description: "Avoid detection" },
    healing_skill: { level: 1, experience: 0, max: 10, description: "Healing and support" },
    summoning_skill: { level: 1, experience: 0, max: 10, description: "Monster control" },
    alchemy_skill: { level: 1, experience: 0, max: 10, description: "Potion brewing" },
    engineering_skill: { level: 1, experience: 0, max: 10, description: "Advanced mechanics" }
  });

  const [abilities, setAbilities] = useState({
    trap_setter: [
      { id: "quick_setup", name: "Quick Setup", description: "Place traps 50% faster", unlocked: false, cost: 2, icon: Target },
      { id: "trap_mastery", name: "Trap Mastery", description: "Increase trap damage by 25%", unlocked: false, cost: 3, icon: Sword },
      { id: "chain_reaction", name: "Chain Reaction", description: "Triggers nearby traps", unlocked: false, cost: 4, icon: Zap },
      { id: "death_zone", name: "Death Zone", description: "Create multi-hit trap zones", unlocked: false, cost: 5, icon: Skull }
    ],
    healer: [
      { id: "area_heal", name: "Area Heal", description: "Heal multiple NPCs at once", unlocked: false, cost: 2, icon: Heart },
      { id: "revive_master", name: "Revive Master", description: "50% chance to instantly revive", unlocked: false, cost: 3, icon: Sparkles },
      { id: "blessing_aura", name: "Blessing Aura", description: "Passive healing to nearby allies", unlocked: false, cost: 4, icon: Star },
      { id: "divine_intervention", name: "Divine Intervention", description: "Full heal with bonus effects", unlocked: false, cost: 5, icon: Crown }
    ],
    store_keeper: [
      { id: "haggling", name: "Haggling", description: "20% better prices when buying", unlocked: false, cost: 2, icon: TrendingUp },
      { id: "inventory_master", name: "Inventory Master", description: "Increase carrying capacity", unlocked: false, cost: 3, icon: Shield },
      { id: "merchant_network", name: "Merchant Network", description: "Access to rare items", unlocked: false, cost: 4, icon: Award },
      { id: "market_domination", name: "Market Domination", description: "Control dungeon economy", unlocked: false, cost: 5, icon: Crown }
    ],
    monster_summoner: [
      { id: "pack_master", name: "Pack Master", description: "Summon multiple minions", unlocked: false, cost: 2, icon: Zap },
      { id: "demon_binding", name: "Demon Binding", description: "Control stronger monsters", unlocked: false, cost: 3, icon: Skull },
      { id: "soul_link", name: "Soul Link", description: "Share senses with minions", unlocked: false, cost: 4, icon: Brain },
      { id: "army_darkness", name: "Army of Darkness", description: "Mass summoning ritual", unlocked: false, cost: 5, icon: Crown }
    ],
    boss_reviver: [
      { id: "emergency_revival", name: "Emergency Revival", description: "Quick boss revival in combat", unlocked: false, cost: 2, icon: Heart },
      { id: "power_infusion", name: "Power Infusion", description: "Permanently boost boss stats", unlocked: false, cost: 3, icon: Zap },
      { id: "boss_enhancement", name: "Boss Enhancement", description: "Unlock boss ultimate abilities", unlocked: false, cost: 4, icon: Sword },
      { id: "final_evolution", name: "Final Evolution", description: "Transform boss into ultimate form", unlocked: false, cost: 5, icon: Crown }
    ]
  });

  const [selectedSkill, setSelectedSkill] = useState("");
  const [achievements, setAchievements] = useState([
    { id: "first_trap", name: "Trap Beginner", description: "Place your first trap", unlocked: false, icon: Target },
    { id: "first_heal", name: "Healer's Touch", description: "Heal your first NPC", unlocked: false, icon: Heart },
    { id: "first_summon", name: "Summoner's Call", description: "Summon your first monster", unlocked: false, icon: Zap },
    { id: "trap_master_10", name: "Trap Expert", description: "Place 10 traps", unlocked: false, icon: Award },
    { id: "dungeon_master", name: "Dungeon Master", description: "Reach level 10", unlocked: false, icon: Crown },
    { id: "wealthy", name: "Wealth Keeper", description: "Accumulate 5000 gold", unlocked: false, icon: TrendingUp }
  ]);

  const ranks = [
    { id: "novice", name: "Novice", minLevel: 1, color: "#6b7280" },
    { id: "apprentice", name: "Apprentice", minLevel: 5, color: "#3b82f6" },
    { id: "expert", name: "Expert", minLevel: 10, color: "#8b5cf6" },
    { id: "master", name: "Master", minLevel: 15, color: "#f59e0b" },
    { id: "grandmaster", name: "Grandmaster", minLevel: 20, color: "#ef4444" },
    { id: "legend", name: "Legend", minLevel: 30, color: "#fbbf24" }
  ];

  useEffect(() => {
    // Update rank based on level
    const currentRank = ranks.find(rank => characterStats.level >= rank.minLevel);
    if (currentRank && currentRank.id !== characterStats.rank) {
      setCharacterStats(prev => ({ ...prev, rank: currentRank.id }));
    }
  }, [characterStats.level]);

  const gainExperience = async (amount, skillType = null) => {
    try {
      const result = await onProgressionAction({
        action: "gain_experience",
        amount,
        skillType
      });

      if (result.success) {
        setCharacterStats(prev => {
          let newExp = prev.experience + amount;
          let newLevel = prev.level;
          let newSkillPoints = prev.skillPoints;
          let newTotalExp = prev.totalExperience + amount;
          let expToNext = prev.experienceToNext;

          // Level up logic
          while (newExp >= expToNext) {
            newExp -= expToNext;
            newLevel++;
            newSkillPoints += 2;
            expToNext = 100 * Math.pow(1.5, newLevel - 1);
          }

          return {
            ...prev,
            experience: newExp,
            level: newLevel,
            skillPoints: newSkillPoints,
            totalExperience: newTotalExp,
            experienceToNext: expToNext
          };
        });

        if (skillType) {
          setSkills(prev => ({
            ...prev,
            [skillType]: {
              ...prev[skillType],
              experience: prev[skillType].experience + amount
            }
          }));
        }

        // Check achievements
        checkAchievements();
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const levelUpSkill = async (skillId) => {
    const skill = skills[skillId];
    if (!skill || skill.level >= skill.max || characterStats.skillPoints < 1) return;

    try {
      const result = await onProgressionAction({
        action: "level_up_skill",
        skillId
      });

      if (result.success) {
        setSkills(prev => ({
          ...prev,
          [skillId]: {
            ...prev[skillId],
            level: prev[skillId].level + 1,
            experience: 0
          }
        }));

        setCharacterStats(prev => ({
          ...prev,
          skillPoints: prev.skillPoints - 1
        }));
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const unlockAbility = async (abilityId, role) => {
    const roleAbilities = abilities[role];
    const ability = roleAbilities.find(a => a.id === abilityId);
    
    if (!ability || ability.unlocked || characterStats.skillPoints < ability.cost) return;

    try {
      const result = await onProgressionAction({
        action: "unlock_ability",
        abilityId,
        role,
        cost: ability.cost
      });

      if (result.success) {
        setAbilities(prev => ({
          ...prev,
          [role]: prev[role].map(a => 
            a.id === abilityId ? { ...a, unlocked: true } : a
          )
        }));

        setCharacterStats(prev => ({
          ...prev,
          skillPoints: prev.skillPoints - ability.cost
        }));
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const checkAchievements = () => {
    // This would normally check game state and unlock achievements
    // For now it's a placeholder
    setAchievements(prev => prev.map(achievement => {
      // Add logic to check if achievement should be unlocked
      return achievement;
    }));
  };

  const getCurrentRank = () => {
    return ranks.find(rank => characterStats.level >= rank.minLevel) || ranks[0];
  };

  const getRoleAbilities = () => {
    const role = gameState.session?.npc_role;
    return abilities[role] || [];
  };

  return (
    <div className="space-y-4">
      {/* Character Overview */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            Character Progression
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                {characterStats.level}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Level
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-secondary)' }}>
                {characterStats.skillPoints}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Skill Points
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {getCurrentRank().name}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Rank
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Object.values(skills).reduce((sum, skill) => sum + skill.level, 0)}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Total Skill Levels
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Experience Progress
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {characterStats.experience} / {Math.floor(characterStats.experienceToNext)}
              </span>
            </div>
            <Progress 
              value={(characterStats.experience / characterStats.experienceToNext) * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Brain className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
            Skills
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(skills).map(([skillId, skill]) => (
              <motion.div
                key={skillId}
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-lg bg-black/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {skillId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h5>
                  <Badge variant="outline">Level {skill.level}/{skill.max}</Badge>
                </div>
                
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {skill.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {skill.experience} / {skill.level * 50}
                    </span>
                  </div>
                  <Progress 
                    value={(skill.experience / (skill.level * 50)) * 100} 
                    className="h-1" 
                  />
                </div>
                
                {skill.level < skill.max && characterStats.skillPoints > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => levelUpSkill(skillId)}
                    disabled={disabled}
                  >
                    Upgrade (1 SP)
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Abilities */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            Special Abilities
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getRoleAbilities().map(ability => (
              <motion.div
                key={ability.id}
                whileHover={{ scale: ability.unlocked ? 1 : 1.02 }}
                className={`p-3 rounded-lg border ${ability.unlocked ? 'border-green-500/30 bg-green-500/10' : 'border-gray-600/30 bg-gray-600/10'}`}
              >
                <div className="flex items-start gap-3">
                  <ability.icon className="w-5 h-5 mt-1" style={{ 
                    color: ability.unlocked ? 'var(--accent-secondary)' : 'var(--text-secondary)' 
                  }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {ability.name}
                      </h5>
                      {ability.unlocked ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    
                    <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {ability.description}
                    </p>
                    
                    {!ability.unlocked && (
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {ability.cost} Skill Points
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unlockAbility(ability.id, gameState.session?.npc_role)}
                          disabled={characterStats.skillPoints < ability.cost || disabled}
                        >
                          Unlock
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Award className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
            Achievements
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map(achievement => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border ${achievement.unlocked ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-gray-600/30 bg-gray-600/10'}`}
              >
                <div className="flex items-center gap-3">
                  <achievement.icon className={`w-5 h-5 ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {achievement.name}
                    </h5>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressionSystem;