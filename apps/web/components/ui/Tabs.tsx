"use client";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  badge?: number | string;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = "",
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={`flex flex-wrap gap-1 border-b border-surface-border ${className}`}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-surface-muted hover:text-slate-200"
            }`}
          >
            {tab.label}
            {tab.badge != null && Number(tab.badge) > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  active ? "bg-blue-900/60 text-blue-300" : "bg-surface-border text-surface-muted"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
