# -*- coding: utf-8 -*-
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace block 1: lines 254 to 301
# Wait, let's find the exact indices
start1 = -1
end1 = -1
for i, line in enumerate(lines):
    if "const [mapFilter, setMapFilter] = useState('all');" in line:
        start1 = i
    if "  }, [currentScreen]);" in line and start1 != -1 and i > start1 + 40:
        end1 = i
        break

new_chunk1 = '''  const [mapFilter, setMapFilter] = useState('all'); // 'all', 'cng', 'lng', 'service'
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [stations, setStations] = useState([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const mapRef = React.useRef(null);

  useEffect(() => {
    if (currentScreen !== 'STATIONS_MAP') return;

    const fetchStations = async () => {
      setIsLoadingStations(true);
      try {
        const res = await fetch('https://elitegas.ru/wp-json/gazmap/v1/stations');
        const data = await res.json();

        // Нормализация данных с API под наш формат
        const parsed = (Array.isArray(data) ? data : []).map((s, idx) => ({
          id: s.id || idx,
          title: s.title || s.name || 'Заправка',
          address: s.address || '',
          lat: parseFloat(s.lat || s.latitude || (s.coords && s.coords[0])),
          lon: parseFloat(s.lng || s.lon || s.longitude || (s.coords && s.coords[1])),
          type: (s.type || s.fuel_type || '').toLowerCase().includes('lng') || (s.title || '').toLowerCase().includes('спг') ? 'lng' 
              : (s.type || s.fuel_type || '').toLowerCase().includes('service') ? 'service' 
              : 'cng',
          status: s.status || 'Работает',
          distance: s.distance || ''
        })).filter(s => !isNaN(s.lat) && !isNaN(s.lon));

        setStations(parsed);
      } catch (err) {
        console.error('Ошибка загрузки базы заправок:', err);
      } finally {
        setIsLoadingStations(false);
      }
    };

    fetchStations();
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen !== 'STATIONS_MAP') return;

    const initMap = () => {
      if (!window.ymaps) return;
      window.ymaps.ready(() => {
        setIsMapLoaded(true);
        const mapContainer = document.getElementById('yandex-custom-map');
        if (!mapContainer || mapContainer.innerHTML !== '') return;

        const map = new window.ymaps.Map('yandex-custom-map', {
          center: [56.8389, 60.6057], // Екатеринбург
          zoom: 10,
          controls: ['zoomControl']
        });
        mapRef.current = map;
      });
    };

    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [currentScreen]);

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.ymaps) return;

    mapRef.current.geoObjects.removeAll();

    const filteredStations = mapFilter === 'all' 
      ? stations 
      : stations.filter(s => s.type === mapFilter);

    filteredStations.forEach(station => {
      let color = '#f97316'; // orange (service)
      if (station.type === 'cng') color = '#16a34a'; // green
      if (station.type === 'lng') color = '#2563eb'; // blue
      if (station.type === 'propane') color = '#dc2626'; // red

      const placemark = new window.ymaps.Placemark([station.lat, station.lon], {
        balloonContentHeader: <div style="font-weight:bold;font-size:14px;">\</div>,
        balloonContentBody: <div style="font-size:12px;margin-top:4px;">\</div>
                             <div style="font-size:10px;color:gray;margin-top:4px;text-transform:uppercase;">Тип: \</div>
      }, {
        preset: 'islands#circleIcon',
        iconColor: color
      });
      mapRef.current.geoObjects.add(placemark);
    });
  }, [stations, mapFilter, isMapLoaded]);
'''

if start1 != -1 and end1 != -1:
    lines = lines[:start1] + [new_chunk1 + '\n'] + lines[end1+1:]
    print("Replaced chunk 1")

start2 = -1
end2 = -1
for i, line in enumerate(lines):
    if "const filteredStations = mapFilter === 'all'" in line and "stations" not in line:
        start2 = i
    if "MOCK_STATIONS.filter(s => s.type === mapFilter);" in line and start2 != -1:
        end2 = i
        break

new_chunk2 = '''    const filteredStations = mapFilter === 'all' 
      ? stations 
      : stations.filter(s => s.type === mapFilter);
'''
if start2 != -1 and end2 != -1:
    lines = lines[:start2] + [new_chunk2] + lines[end2+1:]
    print("Replaced chunk 2")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
