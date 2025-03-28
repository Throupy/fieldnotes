import React from "react";
import { Select } from "../ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useSettings } from "../../contexts/SettingsContext";


const PreferenceSettings: React.FC = () => {

  const { theme, setTheme } = useSettings();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--text-color)]">
              Appearance
            </p>
            <p className="text-sm text-[var(--muted-text)]">
              Customize how FieldNotes looks on your device.
            </p>
          </div>
          <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
            <SelectTrigger>
              <SelectValue placeholder="System"></SelectValue>
            </SelectTrigger>
            <SelectContent className="w-48 p-2 bg-[var(--bg-color)] border border-[var(--sidebar-border)] rounded-md text-[var(--text-color)] sm:text-sm">
              <SelectItem value="system">Use system setting</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSettings;
