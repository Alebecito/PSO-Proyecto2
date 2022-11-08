function setup() {
  createCanvas(2500, 2500);
  //Convirtiendo memoria inicial en un diccionario lógico
  mapearMemoriaTotal();
  mapearListaDeAccesos();
  for (let element of memorias) {
    element.construirTabla();
    
  }
  console.log("Memoria Total ", memoriaTotal);
  console.log("Lista De Accesos ", listaDeAccesos);
}

function draw() {
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
  dibujarCronometro();
  for (let element of memorias) {
    element.dibujarMemoria();
    element.dibujarEstadoDeMemoria();
    element.dibujarTabla();

    
  }

  if (frameCount % 60 == 0) {
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
    reducirTiempoProcesos();
  }
}
