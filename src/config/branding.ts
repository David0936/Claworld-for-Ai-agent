/**
 * Branding Configuration
 * All values driven by environment variables.
 */

export const BRANDING = {
  agentName: process.env.NEXT_PUBLIC_AGENT_NAME || "小小鱼",
  agentEmoji: process.env.NEXT_PUBLIC_AGENT_EMOJI || "🐟",
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "安瑞科科创",
  appTitle: process.env.NEXT_PUBLIC_APP_TITLE || "Claworld",
  logoLight: process.env.NEXT_PUBLIC_LOGO_LIGHT || "/branding/logo-light.png",
  logoDark: process.env.NEXT_PUBLIC_LOGO_DARK || "/branding/logo-dark.png",
} as const;

export function getAgentDisplayName(): string {
  return `${BRANDING.agentEmoji} ${BRANDING.agentName}`;
}
