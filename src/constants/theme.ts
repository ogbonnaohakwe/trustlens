export const BrandColors = {
  primary: '#10B981',
  primaryHover: '#059669',
  primaryContainer: '#064E3B',
  accentGlow: 'rgba(16, 185, 129, 0.3)',
  accentGold: '#FDC783',
  accentYellow: '#FEECB3',
  accentSage: '#E8EEDB',
  accentGreen: '#CCE8A0',
  accentLavender: '#DCE1FD',
  accentCoral: '#FF5757',

  // Safety Classification Colors
  safe: '#10B981',
  safeBg: '#DCFCE7',
  safeBorder: '#86EFAC',

  caution: '#F59E0B',
  cautionBg: '#FEF3C7',
  cautionBorder: '#FCD34D',

  unsafe: '#EF4444',
  unsafeBg: '#FEE2E2',
  unsafeBorder: '#FCA5A5',

  // Light Card Palette
  cardGridLight: {
    sage: {
      bg: '#EBF0DA',
      border: '#D8E2BF',
      title: '#1D2A12',
      subtitle: '#5C6D4C',
      iconBg: '#FFFFFF',
      iconColor: '#182A12',
    },
    yellow: {
      bg: '#FEEBB3',
      border: '#F7DB87',
      title: '#362B0A',
      subtitle: '#706030',
      iconBg: '#FFFFFF',
      iconColor: '#362B0A',
    },
    green: {
      bg: '#CCE8A0',
      border: '#B3D67B',
      title: '#17300A',
      subtitle: '#486830',
      iconBg: '#FFFFFF',
      iconColor: '#17300A',
    },
    peach: {
      bg: '#FDC783',
      border: '#F2AE56',
      title: '#3E2304',
      subtitle: '#7C5528',
      iconBg: '#FFFFFF',
      iconColor: '#3E2304',
    },
    lavender: {
      bg: '#DCE1FD',
      border: '#BFCAFA',
      title: '#1A2352',
      subtitle: '#4E5B94',
      iconBg: '#FFFFFF',
      iconColor: '#1A2352',
    },
    danger: {
      bg: '#FEE2E2',
      border: '#FCA5A5',
      title: '#7F1D1D',
      subtitle: '#991B1B',
      iconBg: '#FFFFFF',
      iconColor: '#DC2626',
    },
  },

  // Dark Card Palette (sleek, illuminated, modern dark surfaces)
  cardGridDark: {
    sage: {
      bg: '#11221B',
      border: '#1E3E31',
      title: '#E2FBEA',
      subtitle: '#8CE0B0',
      iconBg: '#183328',
      iconColor: '#6EE7B7',
    },
    yellow: {
      bg: '#241D0D',
      border: '#453518',
      title: '#FEF3C7',
      subtitle: '#FCD34D',
      iconBg: '#362A13',
      iconColor: '#FDE047',
    },
    green: {
      bg: '#122517',
      border: '#204629',
      title: '#DCFCE7',
      subtitle: '#86EFAC',
      iconBg: '#1A3922',
      iconColor: '#4ADE80',
    },
    peach: {
      bg: '#271712',
      border: '#4A261D',
      title: '#FFEDD5',
      subtitle: '#FDBA74',
      iconBg: '#3D1F17',
      iconColor: '#FB923C',
    },
    lavender: {
      bg: '#17192C',
      border: '#2C3056',
      title: '#EDE9FE',
      subtitle: '#C4B5FD',
      iconBg: '#232644',
      iconColor: '#A78BFA',
    },
    danger: {
      bg: '#281114',
      border: '#4E1D22',
      title: '#FEE2E2',
      subtitle: '#FCA5A5',
      iconBg: '#3E151A',
      iconColor: '#F87171',
    },
  },

  // Fallback / legacy alias
  cardGrid: {
    sage: {
      bg: '#EBF0DA',
      border: '#D8E2BF',
      title: '#1D2A12',
      subtitle: '#5C6D4C',
      iconBg: '#FFFFFF',
      iconColor: '#182A12',
    },
    yellow: {
      bg: '#FEEBB3',
      border: '#F7DB87',
      title: '#362B0A',
      subtitle: '#706030',
      iconBg: '#FFFFFF',
      iconColor: '#362B0A',
    },
    green: {
      bg: '#CCE8A0',
      border: '#B3D67B',
      title: '#17300A',
      subtitle: '#486830',
      iconBg: '#FFFFFF',
      iconColor: '#17300A',
    },
    peach: {
      bg: '#FDC783',
      border: '#F2AE56',
      title: '#3E2304',
      subtitle: '#7C5528',
      iconBg: '#FFFFFF',
      iconColor: '#3E2304',
    },
    lavender: {
      bg: '#DCE1FD',
      border: '#BFCAFA',
      title: '#1A2352',
      subtitle: '#4E5B94',
      iconBg: '#FFFFFF',
      iconColor: '#1A2352',
    },
    danger: {
      bg: '#FEE2E2',
      border: '#FCA5A5',
      title: '#7F1D1D',
      subtitle: '#991B1B',
      iconBg: '#FFFFFF',
      iconColor: '#DC2626',
    },
  },

  // Dark Palette
  dark: {
    background: '#0A0E14',
    card: '#121820',
    cardHigh: '#1A232E',
    surfaceBorder: '#222D3D',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    dockBg: '#121820',
    inputBg: '#0F151D',
  },

  // Light Palette
  light: {
    background: '#F5F7F6',
    card: '#FFFFFF',
    cardHigh: '#F0F3F1',
    surfaceBorder: '#E2E8F0',
    text: '#111418',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    dockBg: '#FFFFFF',
    inputBg: '#F8FAFC',
  },
} as const;

export const getCardGrid = (isDarkMode: boolean) => {
  return isDarkMode ? BrandColors.cardGridDark : BrandColors.cardGridLight;
};

export const Colors = {
  light: {
    text: BrandColors.light.text,
    background: BrandColors.light.background,
    card: BrandColors.light.card,
    cardHigh: BrandColors.light.cardHigh,
    border: BrandColors.light.surfaceBorder,
    textSecondary: BrandColors.light.textSecondary,
    textMuted: BrandColors.light.textMuted,
    primary: BrandColors.primary,
  },
  dark: {
    text: BrandColors.dark.text,
    background: BrandColors.dark.background,
    card: BrandColors.dark.card,
    cardHigh: BrandColors.dark.cardHigh,
    border: BrandColors.dark.surfaceBorder,
    textSecondary: BrandColors.dark.textSecondary,
    textMuted: BrandColors.dark.textMuted,
    primary: BrandColors.primary,
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const MaxContentWidth = 720;
