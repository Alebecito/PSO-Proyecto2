let chronometer = 0;
let memoriaTotal;
let mitad = 50.00;
let listaDeAccesos;
const memoriaOptima = new claseMemoriaOptima("Óptimo");
const memoriaRandom = new claseMemoriaRandom("Random");
const memoriaLRU = new claseMemoriaLRU("LRU");
const memoriaAging = new claseMemoriaAging("Aging");
const memoriaSecondChance = new claseMemoriaSecondChance("Second Chance");
let memorias;
let archivo="";
let tablaDeProcesos = [];
let condicionesParaEmpezarSimulacion = false;
let variableSemilla=10;
let algoritmoSeleccionado=0;
let generatorRandom;

function obtenerRGB(proceso) {
  
  // console.log("RGB begin");
  // console.log("Proceso", proceso);
  let RGB = [];
  for (let element in tablaDeProcesos) {
    // console.log(tablaDeProcesos[element].idProceso)
    if (parseInt(tablaDeProcesos[element].idProceso) === parseInt(proceso)) {
      RGB.push(tablaDeProcesos[element].R);
      RGB.push(tablaDeProcesos[element].G);
      RGB.push(tablaDeProcesos[element].B);
    }
  }
  // console.log("RGB ARRAY", RGB);
  // console.log("RGB end");
  return RGB;
}



function uid() {
  let uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16);
  };

  function establecerCanva(){
    console.log("TABLA DE PROCESOS:", tablaDeProcesos);
    definirAlgoritmo();
    createCanvas(2500, 2500);
    generatorRandom = SeedRandom(variableSemilla);
    mapearMemoriaTotal();
    
    mapearListaDeAccesos();
    console.log("Memoria Total ", memoriaTotal);
    console.log("Lista De Accesos ", listaDeAccesos); //El 10 es el seed
  for (let element of memorias) {
    element.construirTabla();
  }
  
  }





function shiftString(str, leftShifts, rightShifts) {
  str = shiftLeft(str, leftShifts);
  return shiftRight(str, rightShifts);
}

function shiftLeft(str, leftShifts) {
  return str.substring(leftShifts) + str.substring(0, leftShifts);
}

function shiftRight(str, rightShifts) {
  let len = str.length - rightShifts;
  return shiftLeft(str, len);
}

function definirAlgoritmo(){
  switch (algoritmoSeleccionado){
    case 1:
       memorias = [memoriaOptima, memoriaLRU];
      break;
    case 2:
       memorias = [memoriaOptima, memoriaSecondChance];
      break;
    case 3:
       memorias = [memoriaOptima, memoriaAging];
      break;
    case 4:
       memorias = [memoriaOptima, memoriaRandom];
      break;
    default:
      break;

  }

}

function generateRandomIntegerRGB() {
  randomValue = generatorRandom(255 + 1);
  return randomValue < 1 ? 1 : randomValue;
}

function generateRandomInteger(max, min) {
  randomValue = generatorRandom(max + 1);
  return randomValue < min ? min : randomValue;
}


function empezarSimulacion(){
  
  let nombreAlgoritmo="";
  let entrada=document.getElementById("fsemilla").value;
  entrada===""?variableSemilla=0:variableSemilla=parseInt(entrada);
  if(isNaN(variableSemilla) ){
   variableSemilla=0;
  } 
   archivo = document.getElementById('archivoProcesos').value;
  if(algoritmoSeleccionado===0 || archivo===""){
      alert("Campos para empezar Simulación incompletos");
  }else{
    switch (algoritmoSeleccionado){
      case 1:
      nombreAlgoritmo="LRU";
      break;
      case 2: 
      nombreAlgoritmo="Second Chance";
      break;

      case 3:
      nombreAlgoritmo="Aging";
      break;

      case 4:
      nombreAlgoritmo="Random";
      break;
    default:
        break;
    }
    alert(` Semilla: ${variableSemilla}\n Algoritmo: ${nombreAlgoritmo}\n Archivo: ${archivo}`)
    establecerCanva();
 
  condicionesParaEmpezarSimulacion=true;
  }
  
  
} 



function guardarSeleccionAlgoritmo(algoritmoSeleccionadoP){
  algoritmoSeleccionado=algoritmoSeleccionadoP;
}



function llamadaMasTardia(punteroIgnorado) {
  let arreglo = [];
  for (let elemento in listaDeAccesos) {
    if (
      !arreglo.includes(listaDeAccesos[elemento]) &&
      listaDeAccesos[elemento] !== punteroIgnorado
    ) {
      arreglo.push(listaDeAccesos[elemento]);
    }
  }
  return arreglo;
}

function verificarSiProcesoEnTabla(proceso) {
  for (let element in tablaDeProcesos) {
    if (tablaDeProcesos[element].idProceso === proceso) {
      return true;
    }
  }
  return false;
}

function verificarUltimoAccesoAMemoria(proceso) {
  for (let element in listaDeAccesos) {
    if (parseInt(procesoDePuntero(listaDeAccesos[element])) === proceso) {
      return element;
    }
  }
  return -1;
}

function procesoDePuntero(puntero) {
  for (let element in memoriaTotal) {
    if (memoriaTotal[element].puntero === puntero) {
      return memoriaTotal[element].iDproceso;
    }
  }
}

function objetoProcesoDePuntero(puntero) {
  for (let element in memoriaTotal) {
    if (memoriaTotal[element].puntero === puntero) {
      return memoriaTotal[element];
    }
  }
}

function buscarTamanioPuntero(puntero) {
  let resultado;
  for (let element in memoriaTotal) {
    if (memoriaTotal[element].puntero === puntero) {
      resultado = memoriaTotal[element].tamano;
    }
  }
  return resultado;
}

function SeedRandom(state1, state2) {
  var mod1 = 4294967087;
  var mul1 = 65539;
  var mod2 = 4294965887;
  var mul2 = 65537;
  if (typeof state1 != "number") {
    state1 = +new Date();
  }
  if (typeof state2 != "number") {
    state2 = state1;
  }
  state1 = (state1 % (mod1 - 1)) + 1;
  state2 = (state2 % (mod2 - 1)) + 1;
  function random(limit) {
    state1 = (state1 * mul1) % mod1;
    state2 = (state2 * mul2) % mod2;
    if (state1 < limit && state2 < limit && state1 < mod1 % limit && state2 < mod2 % limit) {
      return random(limit);
    }
    return (state1 + state2) % limit;
  }
  return random;
}

function reducirTiempoProcesos() {
  for (let element in tablaDeProcesos) {
    if (tablaDeProcesos[element].accesoCompletado === true) {
      tablaDeProcesos[element].tiempoDeVida = tablaDeProcesos[element].tiempoDeVida - 1;
    }
  }

  chequearProcesoAcabado();
}

function chequearProcesoAcabado() {
  for (let element in tablaDeProcesos) {
    if (tablaDeProcesos[element].tiempoDeVida <= 0) {
      //   console.log("Eliminado Proceso acabado ", tablaDeProcesos[element].idProceso);
      for (let objeto of memorias) {
        objeto.eliminaProcesoDeMemoria(tablaDeProcesos[element].idProceso);
        objeto.eliminarDeMMUyMemoriaAsignada(tablaDeProcesos[element].idProceso);
        //   console.log("RAM ", objeto.RAM);
        //   console.log("Memoria Asignada ", objeto.memoriaAsignada);
        //   console.log("MMU ", objeto.MMU);
      }
      tablaDeProcesos.splice(element, 1);
      //   console.log("tabla de proceso", tablaDeProcesos);
      //   console.log("-------------------------------------------------");
      break;
    }
  }
}


function getOccurrence(array, value) {
  return array.filter((v) => (v === value)).length;
}



function mapearMemoriaTotal() {
  let objetoAuxiliar = [];
  let arregloAuxiliar = [];
  memoriaTotal = memoriaTotal.slice(1);
  for (let element in memoriaTotal) {
    arregloAuxiliar = memoriaTotal[element].split(",");
    objetoAuxiliar.push({
      puntero: arregloAuxiliar[1].trim(),
      iDproceso: arregloAuxiliar[0].trim(),
      tamano: arregloAuxiliar[2].trim(),
    });
  }
  memoriaTotal = objetoAuxiliar.slice(0);
}

function mapearListaDeAccesos() {
  let cantidadAleatoria = 0;
  let objetoAuxiliar = [];
  let arregloAuxiliar = [];
  listaDeAccesos = listaDeAccesos.slice(1);
  for (let element in listaDeAccesos) {
    arregloAuxiliar = listaDeAccesos[element].split(",");
    objetoAuxiliar.push(arregloAuxiliar[1].trim());
  }
  listaDeAccesos = objetoAuxiliar.slice(0);
  arregloAuxiliar = [];
  for (let element in listaDeAccesos) {
    cantidadAleatoria = generateRandomInteger(10, 1);
    for (let i = 0; i < cantidadAleatoria; i++) {
      arregloAuxiliar.push(listaDeAccesos[element]);
    }
  }
  arregloAuxiliar = revolverArreglo(arregloAuxiliar);

  listaDeAccesos = arregloAuxiliar.slice(0);
}

function revolverArreglo(inputArray) {
  let currentIndex = inputArray.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = generateRandomInteger(currentIndex, 0);
    currentIndex--;

    // And swap it with the current element.
    [inputArray[currentIndex], inputArray[randomIndex]] = [
      inputArray[randomIndex],
      inputArray[currentIndex],
    ];
  }

  return inputArray;
}
