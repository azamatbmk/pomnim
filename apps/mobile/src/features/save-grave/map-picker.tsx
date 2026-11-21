import { useEffect, useMemo, useState } from 'react'
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import type { MapPoint } from '../../entities/grave'
import { Button } from '../../shared/ui/button'
import { sans, serif, theme } from '../../shared/ui/theme'

const defaultCenter: MapPoint = { latitude: 43.0246, longitude: 44.6818 }

type PickGravePointProps = {
  visible: boolean
  initial?: MapPoint | null
  onClose: () => void
  onPick: (point: MapPoint) => void
}

function mapHtml(apiKey: string, center: MapPoint, hasInitial: boolean) {
  const lat = JSON.stringify(center.latitude)
  const lng = JSON.stringify(center.longitude)
  const placeOnLoad = hasInitial ? 'true' : 'false'
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <script src="https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU"></script>
  <style>
    html, body, #map { margin: 0; height: 100%; width: 100%; background: #f7f7f2; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function send(coords) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        latitude: coords[0],
        longitude: coords[1]
      }));
    }
    ymaps.ready(function () {
      var center = [${lat}, ${lng}];
      var map = new ymaps.Map('map', {
        center: center,
        zoom: 16,
        controls: ['zoomControl', 'geolocationControl', 'searchControl']
      });
      var placemark = null;
      function place(coords) {
        if (placemark) {
          placemark.geometry.setCoordinates(coords);
        } else {
          placemark = new ymaps.Placemark(coords, {}, {
            draggable: true,
            preset: 'islands#darkGreenDotIcon'
          });
          map.geoObjects.add(placemark);
          placemark.events.add('dragend', function () {
            send(placemark.geometry.getCoordinates());
          });
        }
        send(coords);
      }
      map.events.add('click', function (event) {
        place(event.get('coords'));
      });
      if (${placeOnLoad}) place(center);
    });
  </script>
</body>
</html>`
}

function readPoint(raw: string): MapPoint | null {
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null) return null
    const latitude = Reflect.get(value, 'latitude')
    const longitude = Reflect.get(value, 'longitude')
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return null
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null
    return { latitude, longitude }
  } catch {
    return null
  }
}

function allowMapUrl(url: string) {
  if (url === 'about:blank') return true
  return /^https:\/\/([^/]+\.)?(yandex\.(ru|net|com|by|kz)|yastatic\.net)(\/|$)/i.test(url)
}

export function PickGravePoint({ visible, initial, onClose, onPick }: PickGravePointProps) {
  const apiKey = process.env.EXPO_PUBLIC_YANDEX_MAPS_KEY?.trim() ?? ''
  const [draft, setDraft] = useState<MapPoint | null>(null)
  const hasInitial = Boolean(initial && Number.isFinite(initial.latitude) && Number.isFinite(initial.longitude))
  const center = hasInitial && initial ? initial : defaultCenter
  const html = useMemo(
    () => (apiKey ? mapHtml(apiKey, center, hasInitial) : ''),
    [apiKey, center.latitude, center.longitude, hasInitial],
  )

  useEffect(() => {
    if (!visible) return
    setDraft(hasInitial && initial ? initial : null)
  }, [visible, hasInitial, initial?.latitude, initial?.longitude])

  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.empty}>
            <Text style={styles.error}>Карта доступна в мобильном приложении.</Text>
            <Button label="Закрыть" onPress={onClose} />
          </View>
        </SafeAreaView>
      </Modal>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <Text style={styles.link}>Закрыть</Text>
          </Pressable>
          <Text style={styles.title}>Точка на карте</Text>
          <Text style={styles.lead}>Нажмите на карту или перетащите метку.</Text>
        </View>
        {!apiKey ? (
          <View style={styles.empty}>
            <Text style={styles.error}>Нужен ключ Яндекс.Карт (EXPO_PUBLIC_YANDEX_MAPS_KEY).</Text>
          </View>
        ) : (
          <WebView
            originWhitelist={['about:blank', 'https://*']}
            source={{ html, baseUrl: 'https://pomnim.site' }}
            style={styles.map}
            onMessage={(event) => {
              const point = readPoint(event.nativeEvent.data)
              if (point) setDraft(point)
            }}
            onShouldStartLoadWithRequest={(request) => allowMapUrl(request.url)}
            javaScriptEnabled
            domStorageEnabled
            javaScriptCanOpenWindowsAutomatically={false}
            setSupportMultipleWindows={false}
          />
        )}
        <View style={styles.footer}>
          {draft ? (
            <Text style={styles.coords}>
              {draft.latitude.toFixed(6)}, {draft.longitude.toFixed(6)}
            </Text>
          ) : (
            <Text style={styles.coords}>Нажмите на карту, чтобы поставить метку</Text>
          )}
          <Button
            label="Сохранить точку"
            onPress={() => {
              if (!draft) return
              onPick(draft)
              onClose()
            }}
            disabled={!draft || !apiKey}
          />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  link: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.green,
    marginBottom: 10,
  },
  title: {
    fontFamily: serif,
    fontSize: 28,
    lineHeight: 34,
    color: theme.ink,
  },
  lead: {
    marginTop: 6,
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 20,
    color: theme.lead,
  },
  map: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  coords: {
    fontFamily: sans,
    fontSize: 12,
    color: theme.help,
  },
  error: {
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 20,
    color: theme.danger,
    textAlign: 'center',
  },
})
