import config from '@/config/index.js'
export const settingTemplate = {
  debugger: true,
  arcgisApiURL: config.baseUrl.gisApi + '/arcgis_js_v320_api/arcgis_js_api/library/3.20/3.20/init.js',
  arcgisCssURL: config.baseUrl.gisApi + '/arcgis_js_v320_api/arcgis_js_api/library/3.20/3.20/esri/css/esri.css',
  arcgisServiceUrl: config.baseUrl.serverip + '/arcgis/rest/services/YP_GDYHJGPT',
  gpserver_print: config.baseUrl.serverip + '/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
  x: 121.52026481877233,
  y: 31.28830004353804,
  level: 4,
  popupDefaultWdith: 250,
  dynamicLayers: [
    {
      id: 'YP_RoadService_DynamicMapServiceLayer',
      name: '杨浦道路数据',
      url: config.baseUrl.serverip + '/arcgis/rest/services/YP_GDYHJGPT/TM_ROAD/MapServer'
    },
    {
      id: 'YP_KJDW_DynamicMapServiceLayer',
      name: '杨浦POI数据',
      url: config.baseUrl.serverip + '/arcgis/rest/services/YP_GDYHJGPT/KJDW/MapServer'
    }
  ],
  FeatureLayers: [
    {
      id: 'YPFence_FeatureLayer',
      name: '杨浦围栏',
      url: config.baseUrl.serverip + '/arcgis/rest/services/YP_GDYHJGPT/TM_Enclosure/FeatureServer'
    },
    {
      id: 'YPRoad_FeatureLayer',
      name: '杨浦道路数据',
      url: config.baseUrl.serverip + '/arcgis/rest/services/YP_GDYHJGPT/TM_ROAD/FeatureServer'
    },
    {
      id: 'YPRoad_FeatureLayer',
      name: '杨浦管线图层',
      url: config.baseUrl.serverip + '/arcgis/rest/services/YP_GDYHJGPT/GWSB_Query/FeatureServer'
    }
  ],
  geojson: [],
  baseMapLayers: [
    {
      id: 'YP_TiledLayer',
      name: '杨浦底图',
      url: config.baseUrl.serverip + '/arcgis/rest/services/YP_GDYHJGPT/YPBaseMap/MapServer',
      type: 'tile'
    },
    {
      id: 'ssgl_dynamicLayer',
      name: '设施管理',
      url: config.baseUrl.serverip + '/arcgis/rest/services/YP_GDYHJGPT/T_SSGL/MapServer',
      furl: config.baseUrl.serverip + '/arcgis/rest/services/YP_GDYHJGPT/T_SSGL/FeatureServer',
      type: 'dynamic',
      visible: false
    },
    {
      id: 'trajectory_dynamicLayer',
      name: '巡查轨迹',
      url: config.baseUrl.serverip + '/arcgis/rest/services/YP_GDYHJGPT/trajectory/MapServer',
      type: 'dynamic',
      visible: false
    },
    {
      id: 'ZT_BZJSD_dynamicLayer',
      name: '泵站积水点',
      url: config.baseUrl.serverip + '/arcgis/rest/services/YP_GDYHJGPT/ZT_BZJSD/MapServer',
      type: 'dynamic',
      visible: false
    }
  ],
  fuzzyQueryServe: [
    {
      id: 'YP_fuzzyQueryServe_FeatureLayer',
      name: '杨浦模糊查询服务',
      url: '/GWSB_Query/FeatureServer',
      layerId: '0',
      layerName: '排水井',
      searchField: 'S_MANHOLE_NAME_ROAD',
      clickabled: true,
      showFields: [
        'OBJECTID',
        'S_MANHOLE_ID',
        'N_MANHOLE_STATE',
        'N_MANHOLE_ALT_GRD',
        'N_MANHOLE_GRADE',
        'N_MANHOLE_TYPE',
        'N_GRADE',
        'S_MANHOLE_NAME_ROAD',
        'N_WELLFORM',
        'N_MANHOLE_DEPTH',
        'S_MANHOLE_BROAD_NAME',
        'S_MANHOLE_EROAD_NAME',
        'N_DISTRICT'
      ]
    },
    {
      id: 'YP_fuzzyQueryServe_FeatureLayer',
      name: '杨浦模糊查询服务',
      url: '/GWSB_Query/FeatureServer',
      layerId: '1',
      layerName: '道路',
      searchField: 'S_NAME',
      clickabled: false,
      showFields: ['OBJECTID', 'S_NAME', 'S_RANK', 'S_QD_ROAD', 'S_ZD_ROAD', 'S_ROAD_ID']
    },
    {
      id: 'YP_fuzzyQueryServe_FeatureLayer',
      name: '杨浦模糊查询服务',
      url: '/GWSB_Query/FeatureServer',
      layerId: '2',
      layerName: '围栏',
      searchField: 'S_Enclosure_ID',
      clickabled: false,
      showFields: ['OBJECTID', 'S_Enclosure_ID', 'S_Enclosure_SUBTYPE', 'N_Enclosure_Len']
    },
    {
      id: 'YP_fuzzyQueryServe_FeatureLayer',
      name: '杨浦模糊查询服务',
      url: '/GWSB_Query/FeatureServer',
      layerId: '3',
      layerName: '排水管线',
      searchField: 'S_DRAI_PIPE_NAME_ROAD',
      clickabled: true,
      showFields: [
        'OBJECTID',
        'N_DRAI_PIPE_GRADE',
        'N_DRAI_PIPE_TYPE',
        'N_DRAI_PIPE_STYLE',
        'N_DRAI_PIPE_MATERIAL',
        'S_DRAI_PIPE_NAME_ROAD',
        'S_DRAI_PIPE_BROAD_NAME',
        'S_DRAI_PIPE_EROAD_NAME',
        'N_DRAI_PIPE_D1',
        'N_DRAI_PIPE_D2'
      ]
    }
  ],
  lend: {
    shadeLayerVisibility: false,
    labelsLayerVisibility: false
  },
  gisModules: [
    'esri/map',
    'esri/dijit/OverviewMap',
    'esri/geometry/webMercatorUtils',
    'esri/toolbars/navigation',
    'esri/dijit/Measurement',
    'esri/units',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/SpatialReference',
    'esri/geometry/Extent',
    'esri/layers/TileInfo',
    'esri/geometry/Point',
    'esri/geometry/Circle',
    'esri/geometry/Polygon',
    'esri/symbols/SimpleFillSymbol',
    'esri/graphic',
    'esri/layers/GraphicsLayer',
    'esri/tasks/IdentifyTask',
    'esri/tasks/IdentifyParameters',
    'esri/tasks/QueryTask',
    'esri/tasks/query',
    'esri/symbols/PictureMarkerSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/renderers/SimpleRenderer',
    'esri/toolbars/draw',
    'esri/tasks/FindTask',
    'esri/tasks/FindParameters',
    'esri/geometry/webMercatorUtils',
    'esri/InfoTemplate',
    // 'ncam/PopupExtended',
    'esri/dijit/PopupTemplate',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/CartographicLineSymbol',
    'esri/layers/FeatureLayer',
    'esri/toolbars/edit',
    'esri/Color',
    'dijit/Menu',
    'dijit/MenuItem',
    'dijit/MenuSeparator',
    'esri/geometry/Polyline',
    'esri/geometry/geometryEngine',
    'esri/tasks/FeatureSet',
    'esri/renderers/HeatmapRenderer',
    'dojo/parser',
    'esri/tasks/PrintTask',
    'esri/tasks/PrintTemplate',
    'esri/tasks/PrintParameters',
    'esri/dijit/Scalebar'
  ]
}
