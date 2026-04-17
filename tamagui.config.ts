import { createTamagui, createTokens } from 'tamagui'
import { gray, grayDark, green, greenDark, red, redDark, yellow, yellowDark } from '@tamagui/colors'

const tokens = createTokens({
  color: {
    ...gray,
    ...grayDark,
    ...green,
    ...greenDark,
    ...red,
    ...redDark,
    ...yellow,
    ...yellowDark,
    white: '#ffffff',
    black: '#000000',
    green50: '#E8F8EE',
    green400: '#4CAF6D',
    green700: '#2B6D42',
    text: '#0D1F14',
  },
  space: {
    true: 16,
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
  },
  size: {
    true: 16,
    0: 0,
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 38,
    10: 46,
    11: 54,
    12: 62,
  },
  radius: {
    true: 10,
    0: 0,
    1: 6,
    2: 10,
    3: 14,
  },
  zIndex: {
    true: 1,
    0: 0,
    1: 100,
    2: 200,
  },
})

const config = createTamagui({
  tokens,
  themes: {
    light: {
      background: green.green1,
      backgroundHover: green.green2,
      backgroundPress: green.green3,
      color: gray.gray12,
      colorHover: gray.gray11,
      borderColor: gray.gray6,
      primary: green.green9,
      primaryHover: green.green10,
      primaryPress: green.green11,
      success: green.green9,
      warning: yellow.yellow9,
      error: red.red9,
    },
    dark: {
      background: greenDark.green1,
      backgroundHover: greenDark.green2,
      backgroundPress: greenDark.green3,
      color: grayDark.gray12,
      colorHover: grayDark.gray11,
      borderColor: grayDark.gray6,
      primary: greenDark.green9,
      primaryHover: greenDark.green10,
      primaryPress: greenDark.green11,
      success: greenDark.green9,
      warning: yellowDark.yellow9,
      error: redDark.red9,
    },
  },
  defaultTheme: 'light',
})

export type AppTamaguiConfig = typeof config

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default config

