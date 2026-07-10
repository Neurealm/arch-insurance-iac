// Re-exports used by shell.tsx to avoid a circular import chain.
export { StatusIndicator } from "./indicators";
export type StatusIndicatorProps = React.ComponentProps<typeof import("./indicators").StatusIndicator>;
