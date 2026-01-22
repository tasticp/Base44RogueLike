import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Gem,
  Heart,
  Zap,
  Shield,
  Package,
  Coins,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";

export const ResourceSystem = ({ gameState, onResourceAction, disabled = false }) => {
  const [resources, setResources] = useState({
    gold: 1000,
    mana: 50,
    health_potions: 5,
    trap_parts: 20,
    soul_shards: 0,
    dark_essence: 0,
    repair_kits: 3,
    ancient_runes: 0
  });

  const [productionRates, setProductionRates] = useState({
    gold: 10,
    mana: 2,
    trap_parts: 1,
    soul_shards: 0,
    dark_essence: 0,
    ancient_runes: 0
  });

  const [selectedResource, setSelectedResource] = useState("");
  const [craftingMode, setCraftingMode] = useState(false);

  const resourceTypes = [
    {
      id: "gold",
      name: "Gold",
      icon: Coins,
      color: "#fbbf24",
      description: "Currency for purchases and upgrades",
      max: 9999
    },
    {
      id: "mana",
      name: "Mana",
      icon: Zap,
      color: "#8b5cf6",
      description: "Magical energy for spells and enchantments",
      max: 100,
      regenerates: true
    },
    {
      id: "health_potions",
      name: "Health Potions",
      icon: Heart,
      color: "#ef4444",
      description: "Restores health to allies and NPCs",
      max: 20
    },
    {
      id: "trap_parts",
      name: "Trap Parts",
      icon: Shield,
      color: "#6b7280",
      description: "Components for building and repairing traps",
      max: 99
    },
    {
      id: "soul_shards",
      name: "Soul Shards",
      icon: Gem,
      color: "#a78bfa",
      description: "Rare materials for advanced summoning",
      max: 10,
      rare: true
    },
    {
      id: "dark_essence",
      name: "Dark Essence",
      icon: AlertTriangle,
      color: "#991b1b",
      description: "Powerful but dangerous magical substance",
      max: 5,
      rare: true
    },
    {
      id: "repair_kits",
      name: "Repair Kits",
      icon: Package,
      color: "#059669",
      description: "Instantly repairs damaged traps and equipment",
      max: 10
    },
    {
      id: "ancient_runes",
      name: "Ancient Runes",
      icon: TrendingUp,
      color: "#1e40af",
      description: "Ancient magical artifacts for ultimate upgrades",
      max: 3,
      legendary: true
    }
  ];

  const recipes = [
    {
      id: "enhanced_trap",
      name: "Enhanced Trap",
      description: "Upgrade a trap to deal 50% more damage",
      cost: { trap_parts: 10, gold: 50 },
      requires: { mechanical_skill: 2 },
      result: "enhanced_trap_upgrade"
    },
    {
      id: "mana_potion",
      name: "Mana Potion",
      description: "Restores 25 mana points",
      cost: { soul_shards: 1, gold: 20 },
      requires: { alchemy_skill: 1 },
      result: { mana: 25 }
    },
    {
      id: "health_potion_batch",
      name: "Health Potion Batch",
      description: "Craft 3 health potions",
      cost: { ancient_runes: 1, gold: 30 },
      requires: { alchemy_skill: 2 },
      result: { health_potions: 3 }
    },
    {
      id: "dark_ritual",
      name: "Dark Ritual",
      description: "Generate dark essence from soul shards",
      cost: { soul_shards: 3, mana: 50 },
      requires: { dark_magic: 3 },
      result: { dark_essence: 1 }
    },
    {
      id: "trap_repair_kit",
      name: "Trap Repair Kit",
      description: "Create a kit for instant trap repairs",
      cost: { trap_parts: 5, gold: 15 },
      requires: { mechanical_skill: 1 },
      result: { repair_kits: 1 }
    },
    {
      id: "boss_enhancement",
      name: "Boss Enhancement",
      description: "Permanently enhance a boss's power",
      cost: { dark_essence: 2, ancient_runes: 1, gold: 100 },
      requires: { summoning_skill: 3 },
      result: "boss_enhancement"
    }
  ];

  const shops = [
    {
      id: "general_store",
      name: "General Store",
      icon: Package,
      items: [
        { id: "health_potion", name: "Health Potion", cost: 25, buy: true, sell: 12 },
        { id: "trap_parts", name: "Trap Parts", cost: 5, buy: true, sell: 2 },
        { id: "repair_kit", name: "Repair Kit", cost: 40, buy: true, sell: 20 }
      ]
    },
    {
      id: "magic_shop",
      name: "Magic Shop",
      icon: Zap,
      items: [
        { id: "mana_crystal", name: "Mana Crystal", cost: 30, buy: true, sell: 15 },
        { id: "soul_shard", name: "Soul Shard", cost: 100, buy: true, sell: 50 },
        { id: "ancient_rune", name: "Ancient Rune", cost: 500, buy: true, sell: 250, rare: true }
      ]
    },
    {
      id: "black_market",
      name: "Black Market",
      icon: AlertTriangle,
      items: [
        { id: "dark_essence", name: "Dark Essence", cost: 200, buy: true, sell: 100, dangerous: true },
        { id: "cursed_item", name: "Cursed Item", cost: 150, buy: true, sell: 75, dangerous: true }
      ]
    }
  ];

  useEffect(() => {
    const productionInterval = setInterval(() => {
      if (!disabled && gameState.phase === "playing") {
        setResources(prev => {
          const updated = { ...prev };
          Object.entries(productionRates).forEach(([resource, rate]) => {
            if (rate > 0) {
              updated[resource] = Math.min(
                resourceTypes.find(r => r.id === resource)?.max || 999,
                updated[resource] + rate
              );
            }
          });
          return updated;
        });
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(productionInterval);
  }, [disabled, gameState.phase, productionRates]);

  const handleCraft = async (recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    // Check if we have enough resources
    const canAfford = Object.entries(recipe.cost).every(
      ([resource, amount]) => resources[resource] >= amount
    );

    if (!canAfford) {
      return { success: false, error: "Insufficient resources" };
    }

    try {
      const result = await onResourceAction({
        action: "craft",
        recipeId,
        cost: recipe.cost,
        result: recipe.result
      });

      if (result.success) {
        setResources(prev => {
          const updated = { ...prev };
          // Subtract costs
          Object.entries(recipe.cost).forEach(([resource, amount]) => {
            updated[resource] -= amount;
          });
          // Add results
          Object.entries(recipe.result).forEach(([resource, amount]) => {
            updated[resource] = (updated[resource] || 0) + amount;
          });
          return updated;
        });
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleBuy = async (shopId, itemId, cost) => {
    if (resources.gold < cost) {
      return { success: false, error: "Insufficient gold" };
    }

    try {
      const result = await onResourceAction({
        action: "buy",
        shopId,
        itemId,
        cost
      });

      if (result.success) {
        setResources(prev => ({
          ...prev,
          gold: prev.gold - cost,
          [itemId]: (prev[itemId] || 0) + 1
        }));
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleSell = async (shopId, itemId, sellPrice) => {
    if ((resources[itemId] || 0) < 1) {
      return { success: false, error: "Insufficient items to sell" };
    }

    try {
      const result = await onResourceAction({
        action: "sell",
        shopId,
        itemId,
        amount: sellPrice
      });

      if (result.success) {
        setResources(prev => ({
          ...prev,
          gold: prev.gold + sellPrice,
          [itemId]: prev[itemId] - 1
        }));
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <div className="space-y-4">
      {/* Resource Overview */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Package className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            Resource Management
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {resourceTypes.map(resource => {
              const current = resources[resource.id] || 0;
              const max = resource.max;
              const percentage = (current / max) * 100;
              
              return (
                <motion.div
                  key={resource.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg bg-black/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <resource.icon className="w-4 h-4" style={{ color: resource.color }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {resource.name}
                    </span>
                    {resource.rare && <Badge variant="outline" className="text-xs">Rare</Badge>}
                    {resource.legendary && <Badge variant="destructive" className="text-xs">Legendary</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: resource.color }}>
                      {current}
                    </span>
                    <span className="text-xs opacity-70">/ {max}</span>
                  </div>
                  <Progress value={percentage} className="h-1 mt-1" />
                  {productionRates[resource.id] > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">+{productionRates[resource.id]}/5s</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Crafting System */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <RefreshCw className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
            Crafting Workshop
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipes.map(recipe => {
              const canCraft = Object.entries(recipe.cost).every(
                ([resource, amount]) => resources[resource] >= amount
              );
              
              return (
                <motion.div
                  key={recipe.id}
                  whileHover={{ scale: canCraft ? 1.02 : 1 }}
                  className={`p-3 rounded-lg border ${canCraft ? 'border-green-500/30 bg-green-500/10' : 'border-gray-600/30 bg-gray-600/10'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {recipe.name}
                    </h5>
                    {canCraft ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {recipe.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Object.entries(recipe.cost).map(([resource, amount]) => (
                      <Badge key={resource} variant="outline" className="text-xs">
                        {amount} {resourceTypes.find(r => r.id === resource)?.name}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleCraft(recipe.id)}
                    disabled={!canCraft || disabled}
                  >
                    Craft
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trading System */}
      <Card style={{ backgroundColor: 'var(--bg-card)' }} className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Coins className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            Trading Posts
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {shops.map(shop => (
              <div key={shop.id} className="p-3 rounded-lg bg-black/20">
                <div className="flex items-center gap-2 mb-2">
                  <shop.icon className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                  <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {shop.name}
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {shop.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded bg-black/30">
                      <div>
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {item.name}
                        </span>
                        {item.rare && <Badge variant="outline" className="ml-1 text-xs">Rare</Badge>}
                        {item.dangerous && <Badge variant="destructive" className="ml-1 text-xs">Danger</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-yellow-400">{item.cost}g</span>
                        {item.buy && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBuy(shop.id, item.id, item.cost)}
                            disabled={resources.gold < item.cost || disabled}
                          >
                            Buy
                          </Button>
                        )}
                        {resources[item.id] > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSell(shop.id, item.id, item.sell)}
                          >
                            Sell {item.sell}g
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceSystem;