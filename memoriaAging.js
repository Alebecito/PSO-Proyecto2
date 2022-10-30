class claseMemoriaAging {
  constructor(tipo) {
    this.tipo = tipo;
    this.MMU = [];
    this.RAM = this.memoriaDisponible = Array(100).fill(0);
    this.memoriaAsignada = [];
    this.cantidadDeFallosDePagina = 0;
    this.procesosCorriendo=0;
    this.tiempoDeSimulacion=0;
    this.RAMutilizadaKB=0;
    this.RAMutilizadaPorcentaje=0;
    this.VRAMutilizadaKB=0;
    this.VRAMutilizadaPorcentaje=0;
    this.paginasCargadas=0;
    this.pagindasNoCargadas=0;
    this.trashingTiempo=0;
    this.trashingPorcentaje=0;
    this.fragmentacionInternar=0;
  }

  dibujarMemoria() {
    let RGB = [];
    let posiciony = 0;
    this.tipo === "Óptimo" ? (posiciony = 50) : (posiciony = 100);
    fill(0);
    textSize(15);
    text("Fallos de Página: " + this.cantidadDeFallosDePagina, width / 2 - 200, posiciony - 5);
    fill(0);
    textSize(15);
    text("Algoritmo " + this.tipo, width / 2 - 400, posiciony - 5);
    for (let i = 0; i < 100; i++) {
      this.RAM[i] === 0
        ? noFill()
        : fill(obtenerRGB(this.RAM[i])[0], obtenerRGB(this.RAM[i])[1], obtenerRGB(this.RAM[i])[2]);
      rect(width / 2 - 1000 + i * 20, posiciony, 20, 25);
    }
  }

  solicitarInstruccion(puntero, procesoID) {
    let flagEnMemoriaAsignada = false;
    let flagEnMMU = false;
    let direccionMemoria = -1;
    let tamano = 0;
    tamano = buscarTamanioPuntero(puntero);
    tamano = Math.ceil(parseFloat(tamano) / 4096);
    //Se revisa si tiene memoria asignada ese puntero
    if (this.memoriaAsignada.length === 0) {
      direccionMemoria = this.MMU.length + 1;
      this.memoriaAsignada.push({
        puntero: puntero,
        direccionDeMemoria: direccionMemoria + "-" + puntero,
      });
      flagEnMemoriaAsignada = true;
    } else {
      for (let element in this.memoriaAsignada) {
        if (this.memoriaAsignada[element].puntero === puntero) {
          flagEnMemoriaAsignada = true;
          break;
        }
      }
    }
    if (!flagEnMemoriaAsignada) {
      direccionMemoria = this.MMU.length + 1;
      this.memoriaAsignada.push({
        puntero: puntero,
        direccionDeMemoria: direccionMemoria + "-" + puntero,
      });
    }
    //Siempre va a resultar con memoria asignada, si ya tenía no se le asigna más, si no tenía se le asigna nueva. Ahora se chequea el mapeo de las paginas virtuales usando su tabla de símbolos.

    if (this.MMU.length === 0) {
      this.MMU.push({ id: puntero, paginas: [], tiempoDeVida: 10 });
      flagEnMMU = true;
      for (let i = 0; i < tamano; i++) {
        this.MMU[this.MMU.length - 1].paginas.push({
          espacioEnMemoria: -1,
          contador: 100,
        });
      }
    } else {
      for (let element in this.MMU) {
        if (this.MMU[element].id === puntero) {
          flagEnMMU = true;
        }
      }
    }
    if (!flagEnMMU) {
      this.MMU.push({ id: puntero, paginas: [] });
      for (let i = 0; i < tamano; i++) {
        this.MMU[this.MMU.length - 1].paginas.push({
          espacioEnMemoria: -1,
          contador: 100,
        });
      }
    }

    // Ahora se revisa si TODAS LAS PAGINAS DE LA TABLA DE SIMBOLOS TAMBIÉN ESTAN EN LA MEMORIA FISICA y AQUí SE PRODUCIRÍAN LOS FALLOS DE PÁGINA.
    for (let i = 0; i < this.MMU.length; i++) {
      if (this.MMU[i].id === puntero) {
        for (let j = 0; j < this.MMU[i].paginas.length; j++) {
          if (this.MMU[i].paginas[j].espacioEnMemoria === -1) {
            if (this.RAM.indexOf(0) !== -1) {
              this.MMU[i].paginas[j].espacioEnMemoria = this.RAM.indexOf(0);
              // this.colaDePaginas.push(this.RAM.indexOf(0));
              this.MMU[i].paginas[j].contador = parseInt(this.MMU[i].paginas[j].contador / 2);
              this.RAM[this.RAM.indexOf(0)] = parseInt(procesoID);
              this.cantidadDeFallosDePagina++;
            } else {
              let indiceDeCambio = this.paginarMemoria(parseInt(procesoID));
              this.MMU[i].paginas[j].espacioEnMemoria = indiceDeCambio;
              this.cantidadDeFallosDePagina++;
            }
          } else {
            this.MMU[i].paginas[j].contador += 100;
            // this.colaDePaginas.splice(this.MMU[i].paginas[j].espacioEnMemoria,1);
            // this.colaDePaginas.push(this.RAM[this.MMU[i].paginas[j].espacioEnMemoria]);
          }
        }
        break;
      }
    }
    //   console.log("Memoria Asignada", this.memoriaAsignada);
    //   console.log("MMU ", this.MMU);
    //   console.log("RAM ", this.RAM);
    //   console.log("tabla de proceso", tablaDeProcesos);
    //   console.log("-------------------------------------------------");
    //regex to eliminate everything in front of a coma except for the \n
    let regex = /(?<=\n)[^,]*/g;
  }

  paginarMemoria(nuevoProceso) {
    let max = Number.MAX_VALUE;
    let indicesDeCambio = [];
    let indiceDeCambio = -1;
    for (let element1 in this.MMU) {
      for (let element2 in this.MMU[element1].paginas) {
        if (
          this.MMU[element1].paginas[element2].contador < max &&
          this.MMU[element1].paginas[element2].espacioEnMemoria !== -1
        ) {
          indicesDeCambio = [];
          indicesDeCambio.push(this.MMU[element1].paginas[element2].espacioEnMemoria);
          max = this.MMU[element1].paginas[element2].contador;
        } else if (
          this.MMU[element1].paginas[element2].contador === max &&
          this.MMU[element1].paginas[element2].espacioEnMemoria !== -1
        ) {
          indicesDeCambio.push(this.MMU[element1].paginas[element2].espacioEnMemoria);
        }
      }
    }

    if (indicesDeCambio.length === 1) {
      indiceDeCambio = indicesDeCambio[0];
    } else {
      let random = Math.floor(Math.random() * indicesDeCambio.length);
      indiceDeCambio = indicesDeCambio[random];
    }

    for (let element1 in this.MMU) {
      for (let element2 in this.MMU[element1].paginas) {
        if (this.MMU[element1].paginas[element2].espacioEnMemoria === indiceDeCambio) {
          this.MMU[element1].paginas[element2].espacioEnMemoria = -1;
          this.MMU[element1].paginas[element2].contador = 100;
          this.RAM[indiceDeCambio] = nuevoProceso;
          return indiceDeCambio;
        }
      }
    }
  }

  eliminaProcesoDeMemoria(idProceso) {
    let paginasABorrar = [];
    for (let index = 0; index < this.RAM.length; index++) {
      if (this.RAM[index] === idProceso) {
        this.RAM[index] = 0;
        paginasABorrar.push(index);
      }
    }
    //   this.colaDePaginas = this.colaDePaginas.filter(item => paginasABorrar.indexOf(item) === -1);
  }

  eliminarDeMMUyMemoriaAsignada(proceso) {
    for (let i = this.MMU.length - 1; i >= 0; --i) {
      if (parseInt(procesoDePuntero(this.MMU[i].id)) === proceso) {
        this.MMU.splice(i, 1);
      }
    }
    for (let i = this.memoriaAsignada.length - 1; i >= 0; --i) {
      if (parseInt(procesoDePuntero(this.memoriaAsignada[i].puntero)) === proceso) {
        this.memoriaAsignada.splice(i, 1);
      }
    }
  }
  dibujarEstadoDeMemoria() {
    let verde = [150, 255, 150];
    let rojo = [255, 150, 150];
    let posicionX, posiciony;
    this.tipo==="Óptimo"?posicionX=width/2-1000:posicionX=width/2;
    posiciony=1000;
    noFill();
    rect(posicionX, posiciony, 600, 75);
    line(posicionX, posiciony+25, posicionX+600, posiciony+25);
    line(posicionX+300, posiciony, posicionX+300, posiciony+75);
    fill(0);
    textSize(15);
    text("Processes", posicionX+100, posiciony+20);
    text(this.procesosCorriendo, posicionX+125, posiciony+60);
    text("Sim - Time", posicionX+420, posiciony+20);
    text(this.tiempoDeSimulacion+"s", posicionX+420, posiciony+60);
 
//-------------------------------------------------
    noFill();
    rect(posicionX, posiciony+100, 600, 75);
    line(posicionX, posiciony+125, posicionX+600, posiciony+125);
    line(posicionX+300, posiciony+100, posicionX+300, posiciony+175);
    line(posicionX+150, posiciony+100, posicionX+150, posiciony+175);
    line(posicionX+450, posiciony+100, posicionX+450, posiciony+175);
    fill(0);
    textSize(15);
    text("RAM KB", posicionX+50, posiciony+120);
    text(this.RAMutilizadaKB, posicionX+70, posiciony+160);
    text("RAM %", posicionX+200, posiciony+120);
    text(this.RAMutilizadaPorcentaje, posicionX+220, posiciony+160);
    text("V-RAM KB", posicionX+350, posiciony+120);
    text(this.VRAMutilizadaKB, posicionX+365, posiciony+160);
    text("V-RAM %", posicionX+500, posiciony+120);
    text(this.VRAMutilizadaPorcentaje, posicionX+525, posiciony+160);

    //---------------------------------------------------
    noFill();
    rect(posicionX, posiciony+200, 600, 75);
    fill(verde[0],verde[1],verde[2]);
    rect(posicionX+300, posiciony+200, 150, 75);
    noFill();
    line(posicionX, posiciony+225, posicionX+600, posiciony+225);
    line(posicionX, posiciony+250, posicionX+300, posiciony+250);
    line(posicionX+300, posiciony+200, posicionX+300, posiciony+275);
    line(posicionX+150, posiciony+225, posicionX+150, posiciony+275);
    line(posicionX+450, posiciony+200, posicionX+450, posiciony+275);
    line(posicionX+375, posiciony+225, posicionX+375, posiciony+275);

    fill(0);
    textSize(15);
    text("Pages", posicionX+120, posiciony+220);
    textSize(13);
    text("Fragmentation", posicionX+480, posiciony+220);
    textSize(15);
    text(this.fragmentacionInternar+"KB", posicionX+520, posiciony+260);
    text(this.trashingPorcentaje+"%", posicionX+400, posiciony+260);
    text("Trashing", posicionX+350, posiciony+220);
    text(this.trashingTiempo+"s", posicionX+325, posiciony+260);
    text("Loaded", posicionX+50, posiciony+245);
    text(this.paginasCargadas, posicionX+70, posiciony+270);
    text("Unloaded", posicionX+200, posiciony+245);
    text(this.pagindasNoCargadas, posicionX+220, posiciony+270);
//-----------------------------------------------------
  }
}
