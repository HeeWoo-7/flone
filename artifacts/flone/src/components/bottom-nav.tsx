import { useLocation, Link } from "wouter";

const tabs = [
  { path: "/home", label: "홈", icon: HomeIcon },
  { path: "/record", label: "기록", icon: PencilIcon },
  { path: "/report", label: "리포트", icon: SparkleIcon },
  { path: "/my", label: "마이", icon: PersonIcon },
];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V12Z"
        fill={active ? "hsl(260 70% 55%)" : "hsl(260 20% 65%)"}
        stroke={active ? "hsl(260 70% 55%)" : "hsl(260 20% 65%)"}
        strokeWidth="0" />
    </svg>
  );
}

function PencilIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15.5 3.5L20.5 8.5L8 21H3V16L15.5 3.5Z"
        fill={active ? "hsl(260 70% 55%)" : "hsl(260 20% 65%)"}/>
    </svg>
  );
}

function SparkleIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
        fill={active ? "hsl(260 70% 55%)" : "hsl(260 20% 65%)"}/>
    </svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill={active ? "hsl(260 70% 55%)" : "hsl(260 20% 65%)"}/>
      <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20"
        stroke={active ? "hsl(260 70% 55%)" : "hsl(260 20% 65%)"}
        strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="bg-white/90 backdrop-blur-md border-t border-border flex items-center justify-around px-2 pt-2 pb-1"
        style={{ boxShadow: "0 -4px 20px rgba(120,100,180,0.06)" }}>
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = location.startsWith(path);
          return (
            <Link key={path} href={path}
              className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-2xl transition-all"
              data-testid={`nav-${label}`}>
              <Icon active={active} />
              <span className={`text-[10px] font-medium transition-colors ${active ? "text-[hsl(260,70%,55%)]" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
