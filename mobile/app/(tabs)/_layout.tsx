import { DynamicColorIOS, Platform } from "react-native";
import { NativeTabs } from "expo-router/native-tabs";

const tintColor = Platform.OS === "ios" ? DynamicColorIOS({ light: "black", dark: "white" }) : undefined;

const TABS = [
  {
    name: "index",
    label: "Items",
    icon: { sf: { default: "list.bullet", selected: "list.bullet" }, md: "list" },
  },
  {
    name: "stats",
    label: "Stats",
    icon: { sf: { default: "chart.bar", selected: "chart.bar.fill" }, md: "bar_chart" },
  },
  {
    name: "settings",
    label: "Settings",
    icon: { sf: { default: "gearshape", selected: "gearshape.fill" }, md: "settings" },
  },
] as const;

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown" tintColor={tintColor} labelStyle={tintColor ? { color: tintColor } : undefined}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={tab.icon.sf} md={tab.icon.md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
