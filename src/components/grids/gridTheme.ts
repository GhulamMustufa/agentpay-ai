import {
  colorSchemeDark,
  colorSchemeLight,
  themeQuartz,
} from "ag-grid-community";

export function createAgentPayGridTheme(
  theme: "dark" | "light",
  options: {
    fontSize: number;
    rowVerticalPaddingScale: number;
  }
) {
  const isDark = theme === "dark";
  const scheme = isDark ? colorSchemeDark : colorSchemeLight;

  // Keep `backgroundColor` opaque so AG Grid popups, menus, and inputs
  // never become transparent over underlying table rows.
  const surfaceColor = isDark ? "#212631" : "#ffffff";
  const menuSurfaceColor = isDark ? "#1a1f29" : "#ffffff";
  const headerSurfaceColor = isDark ? "#262c3a" : "#f1f5f9";
  const inputSurfaceColor = isDark ? "#141820" : "#f8fafc";
  const pickerSurfaceColor = isDark ? "#232936" : "#f8fafc";
  const borderHex = isDark ? "#313744" : "#d7dfea";
  const menuBorderHex = isDark ? "#3b4354" : "#cbd5e1";
  const textHex = isDark ? "#f1f5f9" : "#0f172a";

  return themeQuartz.withPart(scheme).withParams({
    backgroundColor: surfaceColor,
    chromeBackgroundColor: isDark ? "#1c212b" : "#f8fafc",
    headerBackgroundColor: headerSurfaceColor,
    menuBackgroundColor: menuSurfaceColor,
    panelBackgroundColor: menuSurfaceColor,
    inputBackgroundColor: inputSurfaceColor,
    pickerButtonBackgroundColor: pickerSurfaceColor,
    pickerListBackgroundColor: menuSurfaceColor,
    tooltipBackgroundColor: isDark ? "#141820" : "#0f172a",
    tooltipTextColor: "#f8fafc",
    foregroundColor: textHex,
    textColor: isDark ? "#e2e8f0" : "#0f172a",
    menuTextColor: textHex,
    inputTextColor: isDark ? "#f8fafc" : "#0f172a",
    inputPlaceholderTextColor: isDark ? "#94a3b8" : "#64748b",
    accentColor: isDark ? "#3b82f6" : "#2563eb",
    borderColor: borderHex,
    menuBorder: { width: 1, style: "solid", color: menuBorderHex },
    inputBorder: { width: 1, style: "solid", color: isDark ? "#334155" : "#cbd5e1" },
    pickerButtonBorder: { width: 1, style: "solid", color: isDark ? "#334155" : "#cbd5e1" },
    pickerListBorder: { width: 1, style: "solid", color: menuBorderHex },
    menuShadow: isDark
      ? "0 12px 32px rgba(0, 0, 0, 0.55)"
      : "0 12px 32px rgba(15, 23, 42, 0.14)",
    popupShadow: isDark
      ? "0 12px 32px rgba(0, 0, 0, 0.55)"
      : "0 12px 32px rgba(15, 23, 42, 0.14)",
    fontFamily: "inherit",
    fontSize: options.fontSize,
    rowVerticalPaddingScale: options.rowVerticalPaddingScale,
  });
}

