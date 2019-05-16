var meli 		= require('mercadolibre');
var client      = require('./config/mlClient'); 
var config      = require('./config/database'); 
var meliObject	= new meli.Meli();
var validador	= require('./utils/erroresEnPeticiones.js');
var armarCondicion	= require('./utils/armarCondicion.js');
var Publicacion = require('./models/publicacion')
var mongoose    = require('mongoose');
mongoose.connect(config.database);
var sleep = require('sleep')

var publicacionesNuevas = 0;
var total;
var	limit = 50;
var	offset = 0;
var cargadas = 0;

var condicionML = armarCondicion(process.argv);    
console.log(condicionML)
console.log("Comienza .. ");

meliObject.get("sites/MLA/search/?"+condicionML+"&limit="+limit+"&offset=0", async (req, datos) => {
	var paging = datos.paging;
	total = paging.total;
	console.log("Total de publicaciones a procesar: "+total)
	 if (total > 1000){
	 	console.log("Búsqueda demasiado grande. Tiene ",total)
	 	process.exit(0)
	 }

	while (total > offset) {

		meliObject.get("sites/MLA/search/?"+condicionML+"&limit="+limit+"&offset="+offset, (req, datos) => {
		      if (!(validador.errorEnPeticion(req, datos))) {
					var results = datos.results;
					results.forEach( (publicacion => {
						sleep.msleep(100)
						cargarItem(publicacion)
					}))
		       }
		    })

		offset += limit
	}
})

/*
	Agregar o actualizar el item de la publicación. 
	Si falla la petición o alguna de sus peticiones, se vuelve a ejecutar el comando.
*/

function cargarItem(publicacion) {
	meliObject.get("items/"+publicacion.id, (req1, item) => {

		meliObject.get("items/"+publicacion.id+"/description", (req2, descripcion) => {
			if (!(validador.errorEnPeticion(req2, descripcion)) || (descripcion && descripcion.error == 'not_found')) {	
				if (!('error' in descripcion)) publicacion.descripcion = descripcion

				meliObject.get("visits/items?ids="+publicacion.id, (req2, visits) => {
					if (!(validador.errorEnPeticion(req2, visits))) {
						publicacion.visitas = visits[publicacion.id]
						Publicacion.findOneAndUpdate({
						    id: publicacion.id
						}, publicacion, { upsert: true }, (err,aa) => {
							cargadas++;
							//console.log("Fueron cargadas "+cargadas+" de "+total)

							if (cargadas == total) {
								console.log("Fueron cargadas "+cargadas+" de "+total)
								process.exit(0)
							}
						});
					} else {
						cargarItem(publicacion)
					}
			})
		} else {
			cargarItem(publicacion)
		}})
	})
}