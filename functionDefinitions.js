let chronometer=0;
let memoriaTotal;
let listaDeAccesos;
const memoriaOptima = new claseMemoriaOptima("Óptimo");
const memoriaRandom = new claseMemoriaRandom("Random");
const memoriaLRU = new claseMemoriaLRU("LRU");
const memoriaAging = new claseMemoriaAging("Aging");
const memorias= [memoriaOptima, memoriaAging];
let tablaDeProcesos=[];



  generatorRandom= SeedRandom(1);//El 10 es el seed

function obtenerRGB(proceso){
  let RGB=[];
  for(let element in tablaDeProcesos){
    if(tablaDeProcesos[element].idProceso===proceso){
      RGB.push(tablaDeProcesos[element].R);
      RGB.push(tablaDeProcesos[element].G)
      RGB.push(tablaDeProcesos[element].B)
    }
  }
  return RGB;
}
  function generateRandomIntegerRGB() {
       randomValue= generatorRandom(255+1)
   return randomValue<1?1:randomValue;
}

 function generateRandomInteger(max, min) {
     randomValue= generatorRandom(max+1)
   return randomValue<min?min:randomValue;
   
}

function llamadaMasTardia(punteroIgnorado){
 let arreglo=[];
 for(let elemento in listaDeAccesos){
   if(!arreglo.includes(listaDeAccesos[elemento])&&listaDeAccesos[elemento]!==punteroIgnorado){
    arreglo.push(listaDeAccesos[elemento]);
   }
 }
return arreglo;
  
  
}

function verificarSiProcesoEnTabla(proceso){
  for(let element in tablaDeProcesos){
    if(tablaDeProcesos[element].idProceso===proceso){
      return true;
    }
  }
  return false;
}

function verificarUltimoAccesoAMemoria(proceso){
 for(let element in listaDeAccesos){
   if(parseInt(procesoDePuntero(listaDeAccesos[element]))===proceso){
     return element;
   }
 } 
  return -1;
}



function procesoDePuntero(puntero){
 
  for (let element in memoriaTotal){
    if (memoriaTotal[element].puntero===puntero){
      return memoriaTotal[element].iDproceso;
    }
  }
}


function buscarTamanioPuntero(puntero){
  let resultado;
  for(let element in memoriaTotal){
    if(memoriaTotal[element].puntero===puntero){
      resultado = memoriaTotal[element].tamano;
    }
  }
  return resultado
}

function SeedRandom(state1,state2){
    var mod1=4294967087
    var mul1=65539
    var mod2=4294965887
    var mul2=65537
    if(typeof state1!="number"){
        state1=+new Date()
    }
    if(typeof state2!="number"){
        state2=state1
    }
    state1=state1%(mod1-1)+1
    state2=state2%(mod2-1)+1
    function random(limit){
        state1=(state1*mul1)%mod1
        state2=(state2*mul2)%mod2
        if(state1<limit && state2<limit && state1<mod1%limit && state2<mod2%limit){
            return random(limit)
        }
        return (state1+state2)%limit
    }
    return random
}

function reducirTiempoProcesos(){
    for (let element in tablaDeProcesos){
      if(tablaDeProcesos[element].accesoCompletado===true){
        tablaDeProcesos[element].tiempoDeVida=tablaDeProcesos[element].tiempoDeVida-1;
      }
    }
  
   chequearProcesoAcabado();
  }

function chequearProcesoAcabado(){
    
     for (let element in tablaDeProcesos){
      if(tablaDeProcesos[element].tiempoDeVida<=0){
        console.log("Eliminado Proceso acabado ", tablaDeProcesos[element].idProceso);
         for (let objeto of memorias){
          objeto.eliminaProcesoDeMemoria(tablaDeProcesos[element].idProceso);
          objeto.eliminarDeMMUyMemoriaAsignada(tablaDeProcesos[element].idProceso);
           console.log("RAM ",objeto.RAM);
           console.log("Memoria Asignada ", objeto.memoriaAsignada);
           console.log("MMU ", objeto.MMU);
        }
        tablaDeProcesos.splice(element,1);
        console.log("tabla de proceso", tablaDeProcesos);
        console.log("-------------------------------------------------")
        break;
      }
    }
  }



function dibujarCronometro(){
  
  fill(0);
  textSize(20);
  text("Tiempo transcurrido :", (width/2)-420, 210);
  fill(0);
  textSize(20);
  text(chronometer+"s", (width/2)-225, 210);
  if (frameCount % 60 == 0 ) { 
    chronometer++;
  }
  
}
function preload() {
  memoriaTotal = loadStrings('procesos.txt');
  listaDeAccesos = loadStrings('listaDeAccesos.txt');
}

function mapearMemoriaTotal(){
    let objetoAuxiliar=[];
   let arregloAuxiliar=[];
   memoriaTotal = memoriaTotal.slice(1);
  for (let element in memoriaTotal){
    arregloAuxiliar = memoriaTotal[element].split(',');
    objetoAuxiliar.push(
      {
        puntero: arregloAuxiliar[1].trim(), 
        iDproceso: arregloAuxiliar[0].trim(),
        tamano: arregloAuxiliar[2].trim()
      }
    ) 
  }
  memoriaTotal = objetoAuxiliar.slice(0);
}