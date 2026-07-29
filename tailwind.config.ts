import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        indigo: {
          DEFAULT: "hsl(var(--indigo))",
          foreground: "hsl(var(--indigo-foreground))",
        },
        navy: "hsl(var(--navy))",
        ai: {
          DEFAULT: "hsl(var(--ai))",
          soft: "hsl(var(--ai-soft))",
          foreground: "hsl(var(--ai-foreground))",
        },
        crimson: {
          DEFAULT: "hsl(var(--crimson))",
          soft: "hsl(var(--crimson-soft))",
          foreground: "hsl(var(--crimson-foreground))",
        },
        tl: {
          planning: "hsl(var(--tl-planning))",
          "planning-soft": "hsl(var(--tl-planning-soft))",
          build: "hsl(var(--tl-build))",
          "build-soft": "hsl(var(--tl-build-soft))",
          testing: "hsl(var(--tl-testing))",
          "testing-soft": "hsl(var(--tl-testing-soft))",
          deployment: "hsl(var(--tl-deployment))",
          "deployment-soft": "hsl(var(--tl-deployment-soft))",
          customer: "hsl(var(--tl-customer))",
          "customer-soft": "hsl(var(--tl-customer-soft))",
          commercial: "hsl(var(--tl-commercial))",
          "commercial-soft": "hsl(var(--tl-commercial-soft))",
          governance: "hsl(var(--tl-governance))",
          "governance-soft": "hsl(var(--tl-governance-soft))",
          readiness: "hsl(var(--tl-readiness))",
          "readiness-soft": "hsl(var(--tl-readiness-soft))",
          risk: "hsl(var(--tl-risk))",
          "risk-soft": "hsl(var(--tl-risk-soft))",
          complete: "hsl(var(--tl-complete))",
          "complete-soft": "hsl(var(--tl-complete-soft))",
          today: "hsl(var(--tl-today))",
        },
        status: {

          healthy: "hsl(var(--status-healthy))",
          "healthy-soft": "hsl(var(--status-healthy-soft))",
          warning: "hsl(var(--status-warning))",
          "warning-soft": "hsl(var(--status-warning-soft))",
          critical: "hsl(var(--status-critical))",
          "critical-soft": "hsl(var(--status-critical-soft))",
          info: "hsl(var(--status-info))",
          "info-soft": "hsl(var(--status-info-soft))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.35s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
