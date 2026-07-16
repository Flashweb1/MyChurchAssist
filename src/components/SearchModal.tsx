"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, X, User, Users, DollarSign, UserPlus, ClipboardList, 
  Building2, Calendar, MessageSquare, Settings, FileText, Loader2 
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useDarkMode } from "@/lib/dark-mode-context";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
}

const typeIcons: Record<string, React.ElementType> = {
  user: User,
  users: Users,
  dollar: DollarSign,
  "user-plus": UserPlus,
  clipboard: ClipboardList,
  building: Building2,
  calendar: Calendar,
  message: MessageSquare,
  settings: Settings,
  file: FileText,
};

// Global state for search modal
let globalSearchOpen = false;
const searchListeners: Set<(isOpen: boolean) => void> = new Set();

export function openSearchModal() {
  globalSearchOpen = true;
  searchListeners.forEach(listener => listener(true));
}

export function closeSearchModal() {
  globalSearchOpen = false;
  searchListeners.forEach(listener => listener(false));
}

export function useSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const listener = (open: boolean) => setIsOpen(open);
    searchListeners.add(listener);
    return () => { searchListeners.delete(listener); };
  }, []);
  
  return isOpen;
}

export default function SearchModal() {
  const isOpen = useSearchModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { darkMode } = useDarkMode();

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearchModal();
      }
      if (e.key === "Escape") {
        closeSearchModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search as user types (debounced)
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || !user) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const params = new URLSearchParams({ query, type: "all" });
      
      const response = await fetch(`/api/search?${params}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    closeSearchModal();
    router.push(result.href);
  };

  if (!isOpen) return null;

  const getIconComponent = (iconName: string) => {
    const Icon = typeIcons[iconName] || User;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => closeSearchModal()}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-start justify-center pt-[15vh] z-50 pointer-events-none">
        <div className={`
          w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden pointer-events-auto
          ${darkMode 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white border-slate-200'
          }
        `}>
          {/* Search Input */}
          <div className={`
            flex items-center gap-3 px-5 py-4 border-b
            ${darkMode ? 'border-slate-800' : 'border-slate-100'}
          `}>
            <Search className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search members, departments, transactions..."
              className={`
                flex-1 bg-transparent border-none outline-none text-base
                ${darkMode 
                  ? 'placeholder:text-slate-500 text-slate-200' 
                  : 'placeholder:text-slate-400 text-slate-900'
                }
              `}
            />
            {loading && <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />}
            <button
              onClick={() => closeSearchModal()}
              className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className={`
            max-h-96 overflow-y-auto
            ${darkMode ? 'bg-slate-900' : 'bg-white'}
          `}>
            {results.length === 0 && searchQuery.trim() && !loading && (
              <div className="px-5 py-12 text-center">
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  No results found for &quot;{searchQuery}&quot;
                </p>
              </div>
            )}

            {results.length === 0 && !searchQuery.trim() && (
              <div className="px-5 py-12 text-center">
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Start typing to search...
                </p>
              </div>
            )}

            {results.map((result, index) => {
              const IconComponent = getIconComponent(result.icon);
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`
                    w-full flex items-center gap-4 px-5 py-3 text-left transition-colors
                    ${index === selectedIndex 
                      ? darkMode 
                        ? 'bg-indigo-900/30' 
                        : 'bg-indigo-50'
                      : darkMode 
                        ? 'hover:bg-slate-800' 
                        : 'hover:bg-slate-50'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${index === selectedIndex 
                      ? 'bg-indigo-500 text-white' 
                      : darkMode 
                        ? 'bg-slate-800 text-slate-400' 
                        : 'bg-slate-100 text-slate-500'
                    }
                  `}>
                    {IconComponent}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`
                      font-medium truncate
                      ${darkMode ? 'text-slate-200' : 'text-slate-900'}
                    `}>
                      {result.title}
                    </p>
                    <p className={`
                      text-sm truncate
                      ${darkMode ? 'text-slate-400' : 'text-slate-500'}
                    `}>
                      {result.subtitle}
                    </p>
                  </div>
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}
                  `}>
                    {result.type}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className={`
            flex items-center justify-between px-5 py-3 border-t text-xs
            ${darkMode 
              ? 'bg-slate-900 border-slate-800 text-slate-500' 
              : 'bg-slate-50 border-slate-100 text-slate-400'
            }
          `}>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-800' : 'bg-white border'}`}>↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-800' : 'bg-white border'}`}>↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-800' : 'bg-white border'}`}>esc</kbd>
                close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}