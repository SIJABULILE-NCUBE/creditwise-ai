import { describe, it, expect } from 'vitest';
import { tokens } from '@/theme/tokens';

describe('T-SETUP-1 Design tokens', () => {
  it('T-SETUP-1 matches Section 7.1 colors exactly', () => {
    expect(tokens.color.primary).toBe('#0F5C4D');
    expect(tokens.color.accent).toBe('#B7791F');
    expect(tokens.color.background).toBe('#F7F5F0');
    expect(tokens.color.surface).toBe('#FFFFFF');
    expect(tokens.color.border).toBe('#E3DED3');
    expect(tokens.color.inputBorder).toBe('#D6D1C4');
    expect(tokens.color.text).toBe('#1F2A37');
    expect(tokens.color.textSecondary).toBe('#5B6670');
    expect(tokens.color.error).toBe('#B42318');
    expect(tokens.color.success).toBe('#1E7B4A');
    expect(tokens.color.warning).toBe('#B45309');

    expect(tokens.color.pill.green.bg).toBe('#DCF2E3');
    expect(tokens.color.pill.green.text).toBe('#14532D');
    expect(tokens.color.pill.amber.bg).toBe('#FDECD3');
    expect(tokens.color.pill.amber.text).toBe('#7C2D12');
    expect(tokens.color.pill.red.bg).toBe('#FDE2E0');
    expect(tokens.color.pill.red.text).toBe('#7F1D1D');
    expect(tokens.color.pill.grey.bg).toBe('#EEEBE4');
    expect(tokens.color.pill.grey.text).toBe('#5B6670');

    expect(tokens.color.placeholder).toBe('#ECE8DF');
    expect(tokens.color.toast).toBe('#1F2A37');
  });

  it('T-SETUP-1 matches Section 7.1 fonts, spacing, sizing and layout', () => {
    expect(tokens.font.family.text).toBe('Inter');
    expect(tokens.font.family.money).toBe('IBM Plex Mono');

    expect(tokens.size.button).toBe(48);
    expect(tokens.size.touchMin).toBe(44);
    expect(tokens.size.header).toBe(56);
    expect(tokens.size.tabBar).toBe(64);
    expect(tokens.size.sideMenu).toBe(240);
    expect(tokens.size.avatar.sm).toBe(32);
    expect(tokens.size.avatar.lg).toBe(56);
    expect(tokens.size.icon).toBe(24);
    expect(tokens.size.iconSmall).toBe(20);

    expect(tokens.space[1]).toBe(4);
    expect(tokens.space[2]).toBe(8);
    expect(tokens.space[3]).toBe(16);
    expect(tokens.space[4]).toBe(24);
    expect(tokens.space[5]).toBe(32);

    expect(tokens.radius.card).toBe(12);
    expect(tokens.radius.input).toBe(8);
    expect(tokens.radius.button).toBe(8);
    expect(tokens.radius.pill).toBe('9999px');

    expect(tokens.layout.maxTablet).toBe(720);
    expect(tokens.layout.maxDesktop).toBe(1120);
    expect(tokens.breakpoint.tablet).toBe(640);
    expect(tokens.breakpoint.desktop).toBe(1024);
    expect(tokens.shadow).toBe('none');
  });
});
