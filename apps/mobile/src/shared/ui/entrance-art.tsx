import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { StyleSheet, View } from 'react-native'

export function EntranceArt() {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox="0 0 560 360" preserveAspectRatio="xMidYMax slice">
        <Defs>
          <LinearGradient id="fade" x1="0" x2="1">
            <Stop offset="0" stopColor="#e8ecdf" stopOpacity="0" />
            <Stop offset="1" stopColor="#dce4d0" />
          </LinearGradient>
          <LinearGradient id="ridge" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#c5d0b5" />
            <Stop offset="1" stopColor="#8ea080" />
          </LinearGradient>
        </Defs>
        <Path fill="url(#fade)" d="M0 0h560v360H0z" />
        <Circle cx={422} cy={91} r={42} fill="#f1efdc" />
        <Path d="m70 263 130-126 50 35L335 42l49 84 40-21 136 165v90H70Z" fill="#d2dbc5" />
        <Path d="m335 42 49 84 40-21 136 165v90H245l91-147-28-33 28-38-14-21Z" fill="#bdcbae" />
        <Path d="m277 132 58-90 33 56-22-8-14 16-15-4-16 30-7-10Z" fill="#f1f0e2" />
        <Path d="m51 337 91-102 53 18 56-56 62 73 40-24 80 52 127-64v126H51Z" fill="url(#ridge)" />
        <Path d="M0 360c124-47 165-54 255-28 93 27 169-51 305-17v45Z" fill="#879d7d" />
        <Path d="M267 360c58-20 80-36 105-33 25 3 47-4 71-16" fill="none" stroke="#d6dec5" strokeWidth={2} />
        <Path d="M455 360V230m0 27-21-15m21 37 24-18m-24 43-29-20m29 43 30-21" fill="none" stroke="#6f8966" strokeWidth={3} />
        <Path d="M493 360V278m0 24-12-9m12 26 15-13m-15 33-16-12" fill="none" stroke="#6f8966" strokeWidth={2} />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '46%',
  },
})
