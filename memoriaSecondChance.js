class claseMemoriaSecondChance {
  constructor(tipo) {
    this.tipo = tipo;
    this.MMU = [];
    this.RAM = this.memoriaDisponible = Array(100).fill(0);
    this.memoriaAsignada = [];
    this.cantidadDeFallosDePagina = 0;
    this.colaDePaginas = [];
    this.procesosCorriendo = 0;
    this.tiempoDeSimulacion = 0;
    this.RAMutilizadaKB = 0;
    this.RAMutilizadaPorcentaje = 0;
    this.VRAMutilizadaKB = 0;
    this.VRAMutilizadaPorcentaje = 0;
    this.paginasCargadas = 0;
    this.pagindasNoCargadas = 0;
    this.trashingTiempo = 0;
    this.trashingPorcentaje = 0;
    this.fragmentacionInternar = [];
    this.divTabla = undefined;
    this.listaDePaginasDecargadas = [];
    this.espacioLogico = 0;
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

  calculoFragmentacionInterna(){
    let suma=0;
    for(let i=0;i<this.fragmentacionInternar.length;i++){
      suma+=this.fragmentacionInternar[i].fragmentacion;
    }
    return suma;
  }

  solicitarInstruccion(puntero, procesoID) {
    let flagEnMemoriaAsignada = false;
    let flagEnMMU = false;
    let direccionMemoria = -1;
    let tamano = 0;
    tamano = buscarTamanioPuntero(puntero);
    let decimales = parseFloat(tamano/4096)-parseInt(tamano / 4096)
    decimales=100-(decimales*100);
    decimales=(decimales/100) * 4096;
    decimales=decimales/1024;
    this.fragmentacionInternar.push({proceso:procesoID, fragmentacion:round(decimales,4)});
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
          marcado: false,
          identificadorUnico: uid(),
          espacioLogico: this.espacioLogico++,
          tiempoCargado: 0,

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
          marcado: false,
          identificadorUnico: uid(),
          espacioLogico: this.espacioLogico++,
          tiempoCargado: 0,

        });
      }
    }

    console.log("\n procesoID: " + procesoID);
    // Ahora se revisa si TODAS LAS PAGINAS DE LA TABLA DE SIMBOLOS TAMBIÉN ESTAN EN LA MEMORIA FISICA y AQUí SE PRODUCIRÍAN LOS FALLOS DE PÁGINA.
    for (let i = 0; i < this.MMU.length; i++) {
      if (this.MMU[i].id === puntero) {
        for (let j = 0; j < this.MMU[i].paginas.length; j++) {
          if (this.MMU[i].paginas[j].espacioEnMemoria === -1) {
            if (this.RAM.indexOf(0) !== -1) {
              this.MMU[i].paginas[j].espacioEnMemoria = this.RAM.indexOf(0);
              this.MMU[i].paginas[j].marcado = false;
              this.colaDePaginas.push(this.MMU[i].paginas[j]);
              this.RAM[this.RAM.indexOf(0)] = parseInt(procesoID);
              this.cantidadDeFallosDePagina++;
              this.tiempoDeSimulacion+=5;
              this.tiempoPaginaCargada(5);
              this.trashingTiempo+=5;

            } else {
              let indiceDeCambio = this.paginarMemoria(parseInt(procesoID), puntero);
              this.MMU[i].paginas[j].espacioEnMemoria = indiceDeCambio;
              this.sacarDePaginasDescargada(this.MMU[i].paginas[j].identificadorUnico);
              this.cantidadDeFallosDePagina++;
              this.tiempoDeSimulacion+=5;
              this.tiempoPaginaCargada(5);
              this.trashingTiempo+=5;

            }
          } else {
            this.MMU[i].paginas[j].marcado = true;
            this.tiempoDeSimulacion+=1;
            // console.log("Cola de páginas: " + JSON.stringify(this.colaDePaginas));

            let index = this.colaDePaginas.findIndex(
              (element) => element.espacioEnMemoria === this.MMU[i].paginas[j].espacioEnMemoria
            );
            this.colaDePaginas[index].marcado = true;
            this.tiempoPaginaCargada(1);
          }
        }
        break;
      }
    }
  }
  eliminarPaginasDeProceso(procesoID) {
    
    for(let i = this.listaDePaginasDecargadas.length - 1; i >= 0; --i){
      
      if(this.listaDePaginasDecargadas[i].proceso === procesoID){
        this.listaDePaginasDecargadas.splice(i, 1);
      }
    }
    
    
  }

  meterEnPaginasDecargadas(procesoID, paginaP) {
    this.listaDePaginasDecargadas.push({proceso:procesoID, pagina:paginaP});
  }

  sacarDePaginasDescargada(paginaP){
    for (let i = this.listaDePaginasDecargadas.length - 1; i >= 0; --i) {
      if (this.listaDePaginasDecargadas[i].pagina === paginaP) {
        this.listaDePaginasDecargadas.splice(i, 1);
        break;
      }
    }
    
  }
  revisarSiPaginaDescargada(paginaP){
    for (let i = 0; i < this.listaDePaginasDecargadas.length; i++) {
      if (this.listaDePaginasDecargadas[i].pagina === paginaP) {
        return true;
      }
    }
    return false;
  }

  paginarMemoria(nuevoProceso, nuevoPuntero) {
    let indiceDeCambio = undefined;
    while (true) {
      console.log("Paginando: " + JSON.stringify(this.colaDePaginas[0]));
      if (this.colaDePaginas[0].marcado) {
        this.colaDePaginas[0].marcado = false;
        this.colaDePaginas.push(this.colaDePaginas.shift());
      } else {
        if (this.colaDePaginas[0].espacioEnMemoria !== -1) {
          indiceDeCambio = this.colaDePaginas[0].espacioEnMemoria;
          this.RAM[indiceDeCambio] = nuevoProceso;
          this.colaDePaginas[0].marcado = false;
          this.colaDePaginas.push(this.colaDePaginas.shift());
          break;
        }
      }
    }
    console.log("indiceDeCambio: " + indiceDeCambio);

    for (let element1 in this.MMU) {
      for (let element2 in this.MMU[element1].paginas) {
        if (this.MMU[element1].paginas[element2].espacioEnMemoria === indiceDeCambio) {
          this.MMU[element1].paginas[element2].espacioEnMemoria = -1;
          this.meterEnPaginasDecargadas(nuevoProceso, this.MMU[element1].paginas[element2].identificadorUnico);
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
    this.colaDePaginas = this.colaDePaginas.filter((item) => paginasABorrar.indexOf(item) === -1);
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
    for (let i = this.fragmentacionInternar.length - 1; i >= 0; --i) {
      if (parseInt(this.fragmentacionInternar[i].proceso) === parseInt(proceso)) {
        this.fragmentacionInternar.splice(i, 1);
      }
    }
    this.eliminarPaginasDeProceso(proceso);
  }

  construirTabla(){
    let div = createDiv("")
    div.style("font-size", "16px");
    div.position(1350, 200);
    div.class("scrollable-table");
    this.divTabla = div;
  }

  dibujarTabla() {   
    this.divTabla.html(this.generarDatosTabla());  
  }


  tiempoPaginaCargada(time){
    for(let i=0;i<this.MMU.length;i++){
      for(let j=0;j<this.MMU[i].paginas.length;j++){
        if(this.MMU[i].paginas[j].espacioEnMemoria!==-1){
          this.MMU[i].paginas[j].tiempoCargado +=time;
          this.MMU[i].paginas[j].tiempoCargado = round(this.MMU[i].paginas[j].tiempoCargado,2);
        }
      }
    }
  } 

  RGBtoHex(proceso) {
    function rgbToHex(rgb) {
      let hex = Number(rgb).toString(16);
      if (hex.length < 2) {
          hex = "0" + hex;
      }
      return hex;
    }
    return rgbToHex(proceso.R) + rgbToHex(proceso.G) + rgbToHex(proceso.B);
  }
  
  generarDatosTabla() {
    let data = [];

    for (let i = 0; i< this.MMU.length; i++) {
      for (let j = 0; j < this.MMU[i].paginas.length; j++) {
        let page = {"PageID":this.MMU[i].paginas[j].espacioLogico, 
        "PID":tablaDeProcesos[i].idProceso,
        "Loaded": this.MMU[i].paginas[j].espacioEnMemoria != -1 ? "X" : " ",
        "L_ADDR": this.MMU[i].paginas[j].espacioLogico,
        "M_ADDR": this.MMU[i].paginas[j].espacioEnMemoria != -1 ? this.MMU[i].paginas[j].espacioEnMemoria : " ",
        "D_ADDR": this.MMU[i].paginas[j].espacioEnMemoria == -1 ? this.MMU[i].paginas[j].espacioLogico+11 : " ",
        "Loaded_T": this.MMU[i].paginas[j].tiempoCargado,
        "Mark":this.MMU[i].paginas[j].marcado ? "X" : " ",
        "Color":this.RGBtoHex(tablaDeProcesos[i])};    
        data.push(page);
      }

    }
    let tableHeaders =
      "<div>" +
        "<table>" +
          "<thead>" +
          "<tr >" +
            "<th>PAGE ID</th>" +
            "<th>PID</th>" +
            "<th>LOADED</th>" +
            "<th>L-ADDR</th>" +
            "<th>M-ADDR</th>" +
            "<th>D-ADDR</th>" +
            "<th>LOADED-T</th>" +
            "<th>MARK </th>"+
          "</tr>";
          "</thead>";
          "<tbody>";
      let tableRows = "";
      for (let i = 0; i < data.length; i++) {
        tableRows +=
          "<tr bgcolor=" + data[i].Color + ">" +
            "<td>" + data[i].PageID + "</td>" +
            "<td>" + data[i].PID + "</td>" +
            "<td>" + data[i].Loaded + "</td>" +
            "<td>" + data[i].L_ADDR + "</td>" +
            "<td>" + data[i].M_ADDR + "</td>" +
            "<td>" + data[i].D_ADDR + "</td>" +
            "<td>" + data[i].Loaded_T + "</td>" +
            "<td>" + data[i].Mark+ "</td>" +
          "</tr>";
      }
    let tableFooter = "</tbody></table></div>";
    let table = tableHeaders + tableRows + tableFooter;
    return table;
  }

  dibujarEstadoDeMemoria() {
    let verde = [255, 255, 255];
    let rojo = [255, 150, 150];
    let posicionX, posiciony;
    this.tipo === "Óptimo" ? (posicionX = width / 2 - 900) : (posicionX = width / 2 + 105);
    posiciony = 900;
    noFill();
    rect(posicionX, posiciony, 600, 75);
    line(posicionX, posiciony + 25, posicionX + 600, posiciony + 25);
    line(posicionX + 300, posiciony, posicionX + 300, posiciony + 75);
    fill(0);
    textSize(15);
    text("Processes", posicionX + 100, posiciony + 20);
    this.procesosCorriendo= tablaDeProcesos.length;
    text(this.procesosCorriendo, posicionX + 125, posiciony + 60);
    text("Sim - Time", posicionX + 420, posiciony + 20);
    text(this.tiempoDeSimulacion + "s", posicionX + 420, posiciony + 60);

    //-------------------------------------------------
    noFill();
    rect(posicionX, posiciony + 100, 600, 75);
    line(posicionX, posiciony + 125, posicionX + 600, posiciony + 125);
    line(posicionX + 300, posiciony + 100, posicionX + 300, posiciony + 175);
    line(posicionX + 150, posiciony + 100, posicionX + 150, posiciony + 175);
    line(posicionX + 450, posiciony + 100, posicionX + 450, posiciony + 175);
    fill(0);
    textSize(15);
    text("RAM KB", posicionX + 50, posiciony + 120);
    this.RAMutilizadaKB = 400-getOccurrence(this.RAM, 0) * 4;
    text(this.RAMutilizadaKB, posicionX + 70, posiciony + 160);
    text("RAM %", posicionX + 200, posiciony + 120);
    this.RAMutilizadaPorcentaje = round((this.RAMutilizadaKB / 400) * 100,2);
    text(this.RAMutilizadaPorcentaje, posicionX + 220, posiciony + 160);
    text("V-RAM KB", posicionX + 350, posiciony + 120);
    this.VRAMutilizadaKB = this.RAMutilizadaKB+this.listaDePaginasDecargadas.length*4;
    text(this.VRAMutilizadaKB, posicionX + 365, posiciony + 160);
    text("V-RAM %", posicionX + 500, posiciony + 120);
    this.VRAMutilizadaPorcentaje = round((this.VRAMutilizadaKB / 400) * 100,2);

    text(this.VRAMutilizadaPorcentaje, posicionX + 525, posiciony + 160);

    //---------------------------------------------------
    noFill();
    rect(posicionX, posiciony + 200, 600, 75);
    this.trashingPorcentaje>mitad?fill(rojo[0], rojo[1], rojo[2]):fill(verde[0], verde[1], verde[2]);
    rect(posicionX + 300, posiciony + 200, 150, 75);
    noFill();
    line(posicionX, posiciony + 225, posicionX + 600, posiciony + 225);
    line(posicionX, posiciony + 250, posicionX + 300, posiciony + 250);
    line(posicionX + 300, posiciony + 200, posicionX + 300, posiciony + 275);
    line(posicionX + 150, posiciony + 225, posicionX + 150, posiciony + 275);
    line(posicionX + 450, posiciony + 200, posicionX + 450, posiciony + 275);
    line(posicionX + 375, posiciony + 225, posicionX + 375, posiciony + 275);

    fill(0);
    textSize(15);
    text("Pages", posicionX + 120, posiciony + 220);
    textSize(13);
    text("Fragmentation", posicionX + 480, posiciony + 220);
    textSize(15);
    text(this.calculoFragmentacionInterna() + "KB", posicionX + 520, posiciony + 260);
    this.trashingPorcentaje = round((this.trashingTiempo*100)/this.tiempoDeSimulacion,2);
    text(this.trashingPorcentaje + "%", posicionX + 390, posiciony + 260);
    text("Trashing", posicionX + 350, posiciony + 220);
    text(this.trashingTiempo + "s", posicionX + 325, posiciony + 260);
    text("Loaded", posicionX + 50, posiciony + 245);
    this.paginasCargadas = 100-getOccurrence(this.RAM, 0);
    text(this.paginasCargadas, posicionX + 70, posiciony + 270);
    text("Unloaded", posicionX + 200, posiciony + 245);
    this.pagindasNoCargadas= this.listaDePaginasDecargadas.length;
    text(this.pagindasNoCargadas, posicionX + 220, posiciony + 270);
    //-----------------------------------------------------
  }
}
