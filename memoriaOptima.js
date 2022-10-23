class claseMemoriaOptima {
  constructor(tipo) {
    this.tipo=tipo;
    this.MMU=[];
    this.RAM=this.memoriaDisponible=Array(100).fill(0);
    this.memoriaAsignada=[];
    this.cantidadDeFallosDePagina=0;
  }
  
  
  dibujarMemoria(){
  let RGB=[];
  let posiciony=0;

  this.tipo==="Óptimo"?posiciony=50:posiciony=100;
  fill(0);
  textSize(15);
  text("Fallos de Página: "+this.cantidadDeFallosDePagina, (width/2)-200, posiciony-5);
  fill(0);
  textSize(15);
  text( "Algoritmo "+this.tipo, (width/2)-400, posiciony-5);
  for(let i = 0; i<100;i++){
    
    this.RAM[i]===0?noFill():fill(obtenerRGB(this.RAM[i])[0],obtenerRGB(this.RAM[i])[1],obtenerRGB(this.RAM[i])[2]);
    rect(((width/2)-500)+(i*10),posiciony,10,25);
    }
  }
  
  
  
  

  solicitarInstruccion(puntero, procesoID){
    let flagEnMemoriaAsignada=false;
    let flagEnMMU=false;
    let direccionMemoria=-1;
    let tamano=0;
    tamano=buscarTamanioPuntero(puntero);
    tamano = Math.ceil(parseFloat(tamano)/4096);
    //Se revisa si tiene memoria asignada ese puntero
    if(this.memoriaAsignada.length===0){
      direccionMemoria=this.MMU.length+1
      this.memoriaAsignada.push({puntero:puntero, direccionDeMemoria:direccionMemoria+"-"+puntero})
      flagEnMemoriaAsignada=true;
    }else{
      for (let element in this.memoriaAsignada){
        if (this.memoriaAsignada[element].puntero===puntero){
          flagEnMemoriaAsignada=true;
          break;
        }
      }
    }
    if(!flagEnMemoriaAsignada){
      direccionMemoria=this.MMU.length+1
      this.memoriaAsignada.push({puntero:puntero, direccionDeMemoria:direccionMemoria+"-"+puntero})
    }
    //Siempre va a resultar con memoria asignada, si ya tenía no se le asigna más, si no tenía se le asigna nueva. Ahora se chequea el mapeo de las paginas virtuales usando su tabla de símbolos.
    
    if(this.MMU.length===0){
      this.MMU.push({id:puntero, paginas:[], tiempoDeVida:10})
      flagEnMMU=true;
      for (let i=0; i<tamano; i++){
        this.MMU[this.MMU.length-1].paginas.push({espacioEnMemoria:-1, marcado:false})
      }
    }else{
      for (let element in this.MMU){
        if (this.MMU[element].id===puntero){
          flagEnMMU=true;
        }
      }
    }
    if(!flagEnMMU){
      this.MMU.push({id:puntero, paginas:[]});
      for (let i=0; i<tamano; i++){
        this.MMU[this.MMU.length-1].paginas.push({espacioEnMemoria:-1, marcado:false})
      }
    }
    
    // Ahora se revisa si TODAS LAS PAGINAS DE LA TABLA DE SIMBOLOS TAMBIÉN ESTAN EN LA MEMORIA FISICA y AQUí SE PRODUCIRÍAN LOS FALLOS DE PÁGINA.
    for (let i=0; i<this.MMU.length;i++){
      if(this.MMU[i].id===puntero){     
        for (let j=0; j<this.MMU[i].paginas.length;j++){
          if(this.MMU[i].paginas[j].espacioEnMemoria === -1){
            if(this.RAM.indexOf(0)!==-1){
              this.MMU[i].paginas[j].espacioEnMemoria = this.RAM.indexOf(0);
              this.RAM[this.RAM.indexOf(0)] = parseInt(procesoID)
              this.cantidadDeFallosDePagina++;
            }else{
              let indiceDeCambio = this.paginarMemoria(parseInt(procesoID), puntero);
              this.MMU[i].paginas[j].espacioEnMemoria = indiceDeCambio
              this.cantidadDeFallosDePagina++;
            }
          }
        }
        break;
      }
    }
    console.log("Memoria Asignada", this.memoriaAsignada);
    console.log("MMU ",this.MMU);
    console.log("RAM ",this.RAM);
    console.log("tabla de proceso", tablaDeProcesos);
    console.log("-------------------------------------------------")
  }
  
  paginarMemoria(nuevoProceso, nuevoPuntero){
    let arregloOrdenado;
    let punteroEscogido
    let indiceDeCambio=0;
    for(let element in tablaDeProcesos){
      if(tablaDeProcesos[element].idProceso!==nuevoProceso){
        if(verificarUltimoAccesoAMemoria(tablaDeProcesos[element].idProceso)===-1){
          indiceDeCambio = this.RAM.indexOf(tablaDeProcesos[element].idProceso)
          this.RAM[indiceDeCambio]=nuevoProceso;
          for (let element1 in this.MMU){
            for(let element2 in this.MMU[element1].paginas){
              if(this.MMU[element1].paginas[element2].espacioEnMemoria===indiceDeCambio){
                this.MMU[element1].paginas[element2].espacioEnMemoria=-1;
                return indiceDeCambio;
              }
            }
          }
            
        }
      }
    }
    arregloOrdenado=llamadaMasTardia(nuevoPuntero);
    for(let i = arregloOrdenado.length-1; i>=0; i--){
        punteroEscogido=arregloOrdenado[i];
        for(let x in this.MMU){
          if(this.MMU[x].id===punteroEscogido){
            for(let y in this.MMU[x].paginas){
              if(this.MMU[x].paginas[y].espacioEnMemoria!==-1){
                indiceDeCambio=this.MMU[x].paginas[y].espacioEnMemoria;
                this.MMU[x].paginas[y].espacioEnMemoria=-1;
                this.RAM[indiceDeCambio] = nuevoProceso;
                return indiceDeCambio;
              }
            }
          }
        }
      
      
    }
  }
  
  eliminaProcesoDeMemoria(idProceso){
 
    for (let index = 0; index < this.RAM.length; index++) {
      if (this.RAM[index] === idProceso) {
        this.RAM[index] = 0;
      }
    }
  }
  

  
  
  
  
  eliminarDeMMUyMemoriaAsignada(proceso){
    for (let i = this.MMU.length - 1; i >= 0; --i) {
        if (parseInt(procesoDePuntero(this.MMU[i].id)) === proceso) {
            this.MMU.splice(i,1);
         
        }
    }
     for (let i = this.memoriaAsignada.length - 1; i >= 0; --i) {
        if (parseInt(procesoDePuntero(this.memoriaAsignada[i].puntero)) === proceso) {
            this.memoriaAsignada.splice(i,1);
          
        }
    }
    
    
  }
  
 
}




 

 










