var mongoose = require('mongoose');
var publicacionSchema = new mongoose.Schema({}, { strict: false })

module.exports = mongoose.model('Publicacion', publicacionSchema)