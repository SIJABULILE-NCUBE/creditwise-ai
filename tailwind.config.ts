import type { Config } from 'tailwindcss';
import { tokens } from './src/theme/tokens';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      tablet: `${tokens.breakpoint.tablet}px`,
      desktop: `${tokens.breakpoint.desktop}px`,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: tokens.color.primary,
          hover: '#0A4338',
        },
        accent: tokens.color.accent,
        pageBackground: tokens.color.background,
        surface: tokens.color.surface,
        appBorder: tokens.color.border,
        inputBorder: tokens.color.inputBorder,
        mainText: tokens.color.text,
        secondaryText: tokens.color.textSecondary,
        appError: tokens.color.error,
        appSuccess: tokens.color.success,
        appWarning: tokens.color.warning,
        placeholder: tokens.color.placeholder,
        toast: tokens.color.toast,
        pillGreenBg: tokens.color.pill.green.bg,
        pillGreenText: tokens.color.pill.green.text,
        pillAmberBg: tokens.color.pill.amber.bg,
        pillAmberText: tokens.color.pill.amber.text,
        pillRedBg: tokens.color.pill.red.bg,
        pillRedText: tokens.color.pill.red.text,
        pillGreyBg: tokens.color.pill.grey.bg,
        pillGreyText: tokens.color.pill.grey.text,
      },
      fontFamily: {
        sans: [tokens.font.family.text, 'sans-serif'],
        mono: [tokens.font.family.money, 'monospace'],
      },
      borderRadius: {
        card: `${tokens.radius.card}px`,
        input: `${tokens.radius.input}px`,
        button: `${tokens.radius.button}px`,
        pill: tokens.radius.pill,
      },
      spacing: {
        'touch': `${tokens.size.touchMin}px`,
        'btn': `${tokens.size.button}px`,
        'header': `${tokens.size.header}px`,
        'tab': `${tokens.size.tabBar}px`,
        'sidebar': `${tokens.size.sideMenu}px`,
      },
      maxWidth: {
        tablet: `${tokens.layout.maxTablet}px`,
        desktop: `${tokens.layout.maxDesktop}px`,
      },
      boxShadow: {
        none: tokens.shadow,
      },
    },
  },
  plugins: [],
} satisfies Config;
