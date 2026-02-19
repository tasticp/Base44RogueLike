import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { createPageUrl } from "@/src/utils";
import {
  Home,
  Play,
  Wrench,
  Users,
  User,
  Sword,
  Zap,
  Crown,
  Settings,
  Shield
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { User as UserEntity } from "@/Entities/all";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Play Game",
    url: createPageUrl("GameModes"),
    icon: Play,
  },
  {
    title: "Level Creator",
    url: createPageUrl("LevelCreator"),
    icon: Wrench,
  },
  {
    title: "Community Levels",
    url: createPageUrl("CommunityLevels"),
    icon: Users,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
  }
];

const adminItems = [
  {
    title: "Admin Dashboard",
    url: createPageUrl("AdminDashboard"),
    icon: Shield,
  }
];

export default function Layout() {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await UserEntity.me();
        setUser(currentUser);
      } catch (error) {
        // User not logged in or error
      }
    };
    loadUser();
  }, []);

  const showAdminItems = user?.role === 'admin';

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #1a1a2e;
            --bg-card: #16213e;
            --accent-primary: #e94560;
            --accent-secondary: #f39c12;
            --text-primary: #eee6e6;
            --text-secondary: #a8a8b3;
            --glow-primary: rgba(233, 69, 96, 0.3);
            --glow-secondary: rgba(243, 156, 18, 0.3);
          }
          
          body {
            background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
            color: var(--text-primary);
            min-height: 100vh;
          }
          
          .glow-effect {
            box-shadow: 0 0 20px var(--glow-primary);
          }
          
          .hover-glow:hover {
            box-shadow: 0 0 30px var(--glow-secondary);
            transition: box-shadow 0.3s ease;
          }
          
          .particle-bg::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: radial-gradient(1px 1px at 20% 30%, #fff, transparent),
                              radial-gradient(1px 1px at 40% 70%, #fff, transparent),
                              radial-gradient(1px 1px at 90% 40%, #fff, transparent),
                              radial-gradient(1px 1px at 60% 10%, #fff, transparent);
            background-repeat: repeat;
            background-size: 200px 200px;
            opacity: 0.1;
            z-index: -1;
            animation: sparkle 20s linear infinite;
          }
          
          @keyframes sparkle {
            from { transform: translateY(0px); }
            to { transform: translateY(-200px); }
          }
          
          .neon-text {
            text-shadow: 0 0 10px var(--accent-primary);
          }
        `}
      </style>
      
      <div className="min-h-screen flex w-full particle-bg" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Sidebar className="border-r" style={{ borderColor: 'var(--bg-card)', backgroundColor: 'var(--bg-secondary)' }}>
          <SidebarHeader className="border-b p-4" style={{ borderColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center glow-effect" 
                   style={{ backgroundColor: 'var(--accent-primary)' }}>
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg neon-text" style={{ color: 'var(--text-primary)' }}>
                  NPC Dungeon
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Reverse Rogue-like
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-2 py-2"
                                 style={{ color: 'var(--text-secondary)' }}>
                Game Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover-glow transition-all duration-300 rounded-lg mb-1 ${
                          location.pathname === item.url 
                            ? 'glow-effect' 
                            : ''
                        }`}
                        style={{
                          backgroundColor: location.pathname === item.url 
                            ? 'var(--bg-card)' 
                            : 'transparent',
                          color: location.pathname === item.url 
                            ? 'var(--accent-primary)' 
                            : 'var(--text-primary)'
                        }}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {showAdminItems && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-2 py-2"
                                   style={{ color: 'var(--text-secondary)' }}>
                  Admin Controls
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover-glow transition-all duration-300 rounded-lg mb-1 ${
                            location.pathname === item.url 
                              ? 'glow-effect' 
                              : ''
                          }`}
                          style={{
                            backgroundColor: location.pathname === item.url 
                              ? 'var(--bg-card)' 
                              : 'transparent',
                            color: location.pathname === item.url 
                              ? 'var(--accent-primary)' 
                              : 'var(--text-primary)'
                          }}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-2 py-2"
                                 style={{ color: 'var(--text-secondary)' }}>
                Quick Actions
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Sword className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Current Role</span>
                    <span className="ml-auto font-medium" style={{ color: 'var(--accent-secondary)' }}>
                      Trap Setter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Level</span>
                    <span className="ml-auto font-bold">1</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4" style={{ borderColor: 'var(--bg-card)' }}>
             <div className="space-y-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover-glow transition-all duration-300 rounded-lg mb-1`}
                          style={{
                            backgroundColor: location.pathname === createPageUrl("Settings") ? 'var(--bg-card)' : 'transparent',
                            color: location.pathname === createPageUrl("Settings") ? 'var(--accent-primary)' : 'var(--text-primary)'
                          }}
                        >
                          <Link to={createPageUrl("Settings")} className="flex items-center gap-3 px-3 py-2 text-sm">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="flex items-center gap-3 pt-2 border-t border-[var(--bg-card)]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: 'var(--accent-primary)' }}>
                    <span className="text-white font-medium text-sm">
                      {user?.full_name?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {user?.full_name || 'Shadow Imp'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {user?.role === 'admin' ? 'Dungeon Master' : 'Dungeon Keeper'}
                    </p>
                  </div>
                </div>
             </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="md:hidden border-b px-6 py-4" 
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover-glow p-2 rounded-lg transition-all duration-300" />
              <h1 className="text-xl font-semibold neon-text">NPC Dungeon</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
