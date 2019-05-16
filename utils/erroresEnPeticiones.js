module.exports.errorEnPeticion = function(request, response) {
  if (request != null && request.code == "ECONNRESET") {
        /* Al parecer ocurre luego de reiteradas consultas */
        console.log("Error socket hang up")
        console.log(request)
        return true;
      }

  if (response != null && response.error == "not_found") {
      console.log(request)
      console.log(response)
      return true;
  }

  return false;

}