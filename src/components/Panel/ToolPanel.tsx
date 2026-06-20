import type { JSX } from "react";
import CommandPalette from "../CommandPalette";
import Snippets from "../Snippets";
import History from "../History";
import Profiles from "../Profiles";
import CheatSheet from "../CheatSheet";
import QuickActions from "../QuickActions";
import Settings from "../Settings";
import EnvStatus from "../EnvStatus";
import ProcessManager from "../ProcessManager";
import FavoriteDirs from "../FavoriteDirs";
import type { Profile } from "../Profiles/types";
import type { Settings as AppSettings } from "../../types/settings";

/** Ferramentas disponíveis na toolbar do Panel. */
export type Tool =
  | "commands"
  | "snippets"
  | "history"
  | "profiles"
  | "cheat"
  | "quick"
  | "env"
  | "processes"
  | "dirs"
  | "config";

/** Rótulos e ordem das ferramentas na toolbar. */
export const TOOL_LABELS: ReadonlyArray<{ id: Tool; label: string }> = [
  { id: "commands", label: "Comandos" },
  { id: "snippets", label: "Snippets" },
  { id: "history", label: "Histórico" },
  { id: "profiles", label: "Perfis" },
  { id: "cheat", label: "Cheat Sheet" },
  { id: "quick", label: "Ações" },
  { id: "env", label: "Ambiente" },
  { id: "processes", label: "Processos" },
  { id: "dirs", label: "Pastas" },
  { id: "config", label: "Config" },
];

interface ToolPanelProps {
  tool: Tool;
  cwd: string | null;
  settings: AppSettings;
  onInsert: (command: string) => void;
  onRun: (command: string) => void;
  onOpenProfile: (profile: Profile) => void;
  onPickDir: (path: string) => void;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
}

/** Roteia para a ferramenta ativa da sidebar. */
export default function ToolPanel(props: ToolPanelProps): JSX.Element {
  switch (props.tool) {
    case "commands":
      return <CommandPalette onInsert={props.onInsert} onRun={props.onRun} />;
    case "snippets":
      return <Snippets onInsert={props.onInsert} onRun={props.onRun} />;
    case "history":
      return <History onRun={props.onRun} />;
    case "profiles":
      return <Profiles onOpen={props.onOpenProfile} />;
    case "cheat":
      return <CheatSheet onInsert={props.onInsert} />;
    case "quick":
      return <QuickActions cwd={props.cwd} />;
    case "env":
      return <EnvStatus />;
    case "processes":
      return <ProcessManager />;
    case "dirs":
      return <FavoriteDirs onPick={props.onPickDir} />;
    case "config":
      return (
        <Settings settings={props.settings} onUpdate={props.onUpdateSettings} />
      );
  }
}
