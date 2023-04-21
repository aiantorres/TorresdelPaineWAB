define([
  'dojo/dom',
  "dojo/_base/declare",
  "dijit/_WidgetsInTemplateMixin",
  "jimu/BaseWidget",
  "esri/graphic",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/toolbars/draw",
  "dojo/_base/lang",
  "dojo/on",
  "dojo/_base/Color",
  "dojo/_base/array",
  "esri/tasks/GeometryService",
  "esri/tasks/BufferParameters",
  "esri/tasks/query",
  "esri/layers/FeatureLayer",
  "esri/geometry/Circle"
  ],
  function (dom, declare, _WidgetsInTemplateMixin, BaseWidget, Graphic,
    SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Draw, lang, on,
    Color, array, GeometryService, BufferParameters, Query, FeatureLayer, Circle) {
    return declare([BaseWidget, _WidgetsInTemplateMixin], {

      baseClass: 'buffer-widget',
      ruta: null,

      //this property is set by the framework when widget is loaded.
      name: 'Buffer',
      gsvc: new GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"),
      symbol: null,

      
      startup: function () {
       
      },

      onOpen: function(){
        this.map.on('click', lang.hitch(this, function(evt) {
          this.map.graphics.clear(); // limpiar capa gráfica
          console.log('evt', this.map);
          var lineas;

          if (this.ruta.value == 'bici') {
            lineas = this.map.getLayer('2a395672ecdf4f369518c3f2d99afbf7'); 
          } else if (this.ruta.value == 'sende' ){
            lineas = this.map.getLayer('81093c9d232f4ef9a818a3ecea25bd2d') 
          }else if (this.ruta.value == 'monta' ){
            lineas = this.map.getLayer('220a370bbe334127aade2bcf49c8431f')
          } else if (this.ruta.value == 'auto' ){
            lineas = this.map.getLayer('f0e10e3c6f9e4249b51bfc2b2fd8a8c2')
          } else if (this.ruta.value == 'cabal' ){
            lineas = this.map.getLayer('1659ed3e445145a4958cf19c5528aa8a')
          } else if (this.ruta.value == 'kayak'){
            lineas = this.map.getLayer('2974866d26324e22a60ff0634c00cbb5')
          } else if (this.ruta.value == 'motor'){
            lineas = this.map.getLayer('34194fe973844bcdb8e75b0c80db7a73')
          };


          var circle = new Circle({
            center: evt.mapPoint,
            geodesic: true,
            radius: 0.2,
            radiusUnit: "esriMiles"
          })
          var query = new Query();
          query.geometry = circle.getExtent();

          lineas.selectFeatures(query, FeatureLayer.SELECTION_NEW, lang.hitch(this, this._doBuffer))
        }))
      },

      _doBuffer: function (evtObj) {
        console.log('evtObj', evtObj)
        var geometry = evtObj[0].geometry;
        // Pinta linea encima de feature seleccionado
        // switch (geometry.type) {
        // case "point":
        //   this.symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
        //   break;
        // case "polyline":
        //   this.symbol = new SimpleLineSymbol();
        //   break;
        // case "polygon":
        //   this.symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NONE, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));
        //   break;
        // }

        // var graphic = new Graphic(geometry, this.symbol);
        // this.map.graphics.add(graphic);

        //setup the buffer parameters
        var params = new BufferParameters();
        params.distances = [dom.byId("distance").value]; // Ajustar la distancia
        params.bufferSpatialReference = this.map.spatialReference;
        params.outSpatialReference = this.map.spatialReference;
        params.unit = GeometryService[dom.byId("unit").value];

        params.geometries = [geometry];
        this.gsvc.buffer(params, lang.hitch(this, this._showBuffer));
        
      },

      _showBuffer: function (bufferedGeometries) {
        var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));

        array.forEach(bufferedGeometries, lang.hitch(this, function (geometry) {
          // geometry es la geometría con la que tenemos que buscar los refugios que quedan dentro.
          console.log('geometry buffer', geometry)
          // Pinta el buffer (amarillo y rojo)
          var graphic = new Graphic(geometry, symbol);
          this.map.graphics.add(graphic);

          // Ejecutar la query geométrica
          var consulta = new Query();
          consulta.geometry = geometry;
          consulta.outFields = ['*'];
          var hoteles = this.map.getLayer('e1d8c23369524f2e92f464a2b7d8f517');
          hoteles.selectFeatures(consulta, FeatureLayer.SELECTION_NEW, lang.hitch(this, this.mostrarListadohoteles));

          var refugios = this.map.getLayer('205d7c619bb7461f8af9990ef54f7b64');
          refugios.selectFeatures(consulta, FeatureLayer.SELECTION_NEW, lang.hitch(this, this.mostrarListadorefugios));

          var camping = this.map.getLayer('82bfeea148c74171b05e3134140661e8');
          camping.selectFeatures(consulta, FeatureLayer.SELECTION_NEW, lang.hitch(this, this.mostrarListadocamping));

          var guarderias = this.map.getLayer('17896ebe9a1f4126ba343cb590e04063');
          guarderias.selectFeatures(consulta, FeatureLayer.SELECTION_NEW, lang.hitch(this, this.mostrarListadoguarderias));
        }));

      },
      mostrarListadohoteles: function(results) {
        
       
        dom.byId('listaH').innerHTML = '';
        array.forEach(results, lang.hitch(this, function(hot){
          if(results){
            dom.byId('listaH').innerHTML += `<tr><td>${hot.attributes.Nombre}</td> <td>${hot.attributes.Contacto}</td></tr>`
          } else {
            dom.byId('listaH').innerHTML = `No hay ningún establecimiento cercano al área solicitada`
          }
          
  
      }));
      },
      mostrarListadorefugios: function(results) {
        
        dom.byId('listaR').innerHTML = '';
        array.forEach(results, lang.hitch(this, function(hot){
          if(results){
            dom.byId('listaR').innerHTML += `<tr><td>${hot.attributes.Nombre}</td> <td>${hot.attributes.Contacto}</td></tr>`
          } else {
            dom.byId('listaR').innerHTML = `No hay ningún establecimiento cercano al área solicitada`
          }
          
  
      }));
      },
      mostrarListadocamping: function(results) {
        
        dom.byId('listaC').innerHTML = '';
        array.forEach(results, lang.hitch(this, function(hot){
          if(results){
            dom.byId('listaC').innerHTML += `<tr><td>${hot.attributes.NombreCamping}</td> <td>${hot.attributes.Contacto}</td></tr>`
          } else {
            dom.byId('listaC').innerHTML = `No hay ningún establecimiento cercano al área solicitada`
          }
          
  
      }));
      },
      mostrarListadoguarderias: function(results) {
        
        dom.byId('listaG').innerHTML = '';
        array.forEach(results, lang.hitch(this, function(hot){
          if(results){
            dom.byId('listaG').innerHTML += `<tr><td>${hot.attributes.Nombre}</td> `
          } else {
            dom.byId('listaG').innerHTML = `No hay ningún establecimiento cercano al área solicitada`
          }
          
  
      }));
      },

    });
  });