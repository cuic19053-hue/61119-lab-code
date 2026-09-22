// ===== 高德地图定位小地图 =====
// 使用说明：请先在 index.html 中将 SDK 地址里 key= 后面的占位符，
// 替换为你在高德开放平台（https://lbs.amap.com）申请的「Web端(JS API)」key。

(function () {
  // 定位失败时的兜底中心点（北京天安门，GCJ-02 坐标）
  const DEFAULT_CENTER = [116.397428, 39.90923];

  let map = null;
  let marker = null;
  let accuracyCircle = null;

  // ===== DOM 元素 =====
  const mapPanel = document.getElementById('mapPanel');
  const mapContainer = document.getElementById('mapContainer');
  const mapToggle = document.getElementById('mapToggle');
  const mapStatus = document.getElementById('mapStatus');

  if (!mapContainer || typeof AMap === 'undefined') {
    // SDK 未加载（通常是 key 未配置或网络问题），隐藏面板并提示
    if (mapPanel) mapPanel.style.display = 'none';
    console.warn('[定位小地图] 高德地图 SDK 未加载：请检查 index.html 中 key 是否已配置');
    return;
  }

  // ===== 初始化地图 =====
  map = new AMap.Map('mapContainer', {
    zoom: 14,
    center: DEFAULT_CENTER,
    resizeEnable: true,
  });

  // 添加缩放工具条与比例尺
  AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], function () {
    map.addControl(new AMap.ToolBar({ position: 'RB' }));
    map.addControl(new AMap.Scale());
  });

  // ===== 逆地理编码：坐标 -> 地址文字 =====
  function reverseGeocode(lnglat) {
    AMap.plugin('AMap.Geocoder', function () {
      const geocoder = new AMap.Geocoder();
      geocoder.getAddress(lnglat, function (status, result) {
        if (status === 'complete' && result.regeocode) {
          const addr = result.regeocode.formattedAddress;
          mapStatus.textContent = addr;
          mapStatus.title = addr;
        } else {
          mapStatus.textContent = `${lnglat.lng.toFixed(6)}, ${lnglat.lat.toFixed(6)}`;
        }
      });
    });
  }

  // ===== 在地图上标记某个位置 =====
  function markPosition(lnglat, accuracy) {
    // 清除旧标记
    if (marker) map.remove(marker);
    if (accuracyCircle) map.remove(accuracyCircle);

    marker = new AMap.Marker({
      position: lnglat,
      title: '当前位置',
    });
    map.add(marker);

    // 定位精度圈（有精度值时才画）
    if (typeof accuracy === 'number' && accuracy > 0) {
      accuracyCircle = new AMap.Circle({
        center: lnglat,
        radius: accuracy,
        strokeColor: '#4f46e5',
        strokeWeight: 1,
        strokeOpacity: 0.6,
        fillColor: '#4f46e5',
        fillOpacity: 0.15,
        bubble: true,
      });
      map.add(accuracyCircle);
    }

    map.setCenter(lnglat);
    map.setZoom(15);
  }

  // ===== 获取当前位置 =====
  AMap.plugin('AMap.Geolocation', function () {
    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true, // 高精度定位
      timeout: 10000,           // 10 秒超时
      maximumAge: 0,
      convert: true,            // 自动转换为 GCJ-02 坐标
      showButton: false,
    });
    map.addControl(geolocation);

    geolocation.getCurrentPosition(function (status, result) {
      if (status === 'complete') {
        const { position, accuracy } = result;
        const lnglat = [position.lng, position.lat];
        markPosition(lnglat, accuracy);
        reverseGeocode(new AMap.LngLat(position.lng, position.lat));
      } else {
        // 浏览器拒绝授权或定位失败：使用默认中心点并提示
        mapStatus.textContent = '定位失败，当前显示默认位置（北京）。可点击地图选择任意位置。';
        markPosition(DEFAULT_CENTER, 0);
      }
    });

    // ===== 点击地图手动选点（定位失败时的替代方案） =====
    map.on('click', function (e) {
      const lnglat = [e.lnglat.getLng(), e.lnglat.getLat()];
      markPosition(lnglat, 0);
      reverseGeocode(e.lnglat);
    });
  });

  // ===== 展开 / 收起小地图 =====
  let collapsed = false;
  mapToggle.addEventListener('click', function () {
    collapsed = !collapsed;
    mapPanel.classList.toggle('collapsed', collapsed);
    mapToggle.textContent = collapsed ? '+' : '−';
    if (!collapsed) {
      // 展开后容器尺寸变化，需要让地图重新计算布局
      setTimeout(() => map.resize(), 50);
    }
  });
})();
