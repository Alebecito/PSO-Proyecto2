function setup() {

}

function draw() {
  if(condicionesParaEmpezarSimulacion){
    let procesoSolicitado;
    let punteroActual = listaDeAccesos[0];
    procesoSolicitado = procesoDePuntero(punteroActual);
    if (verificarSiProcesoEnTabla(parseInt(procesoSolicitado)) === false && listaDeAccesos.length > 0) {
      tablaDeProcesos.push({
        idProceso: parseInt(procesoSolicitado),
        accesoCompletado: false,
        tiempoDeVida: 10,
        R: generateRandomIntegerRGB(),
        G: generateRandomIntegerRGB(),
        B: generateRandomIntegerRGB(),
      });
    }
    background(255);
   
    for (let element of memorias) {
      element.dibujarMemoria();
      element.dibujarEstadoDeMemoria();
      element.dibujarTabla();
  
      
    }
  
    if (frameCount % 20 == 0) {
      if (listaDeAccesos.length > 0) {
        for (let element of memorias) {
          element.solicitarInstruccion(punteroActual, procesoSolicitado);
        }
        listaDeAccesos = listaDeAccesos.slice(1);
        if (verificarUltimoAccesoAMemoria(parseInt(procesoSolicitado)) === -1) {
          for (let element in tablaDeProcesos) {
            if (tablaDeProcesos[element].idProceso === parseInt(procesoSolicitado)) {
              tablaDeProcesos[element].accesoCompletado = true;
            }
          }
        }
      }
      
    }
    if (frameCount % 60 == 0) {
    reducirTiempoProcesos();
    }

  }
  
}
