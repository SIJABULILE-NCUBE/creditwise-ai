export const tokens = {
  color: {
    primary: '#0F5C4D',
    accent: '#B7791F',
    background: '#F7F5F0',
    surface: '#FFFFFF',
    border: '#E3DED3',
    inputBorder: '#D6D1C4',
    text: '#1F2A37',
    textSecondary: '#5B6670',
    error: '#B42318',
    success: '#1E7B4A',
    warning: '#B45309',
    pill: {
      green: {
        bg: '#DCF2E3',
        text: '#14532D',
      },
      amber: {
        bg: '#FDECD3',
        text: '#7C2D12',
      },
      red: {
        bg: '#FDE2E0',
        text: '#7F1D1D',
      },
      grey: {
        bg: '#EEEBE4',
        text: '#5B6670',
      },
    },
    placeholder: '#ECE8DF',
    toast: '#1F2A37',
  },
  font: {
    family: {
      text: 'Inter',
      money: 'IBM Plex Mono',
    },
    size: {
      display: '40px',
      title: '24px',
      heading: '18px',
      body: '16px',
      money: '16px',
      moneyStat: '28px',
      small: '14px',
      caption: '12px',
    },
  },
  space: {
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    screen: {
      mobile: 16,
      tablet: 24,
      desktop: 32,
    },
  },
  radius: {
    card: 12,
    input: 8,
    button: 8,
    pill: '9999px',
  },
  size: {
    button: 48,
    touchMin: 44,
    header: 56,
    tabBar: 64,
    sideMenu: 240,
    avatar: {
      sm: 32,
      lg: 56,
    },
    icon: 24,
    iconSmall: 20,
  },
  layout: {
    maxTablet: 720,
    maxDesktop: 1120,
  },
  breakpoint: {
    tablet: 640,
    desktop: 1024,
  },
  shadow: 'none',
} as const;

export type Tokens = typeof tokens;
