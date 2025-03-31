document.addEventListener("DOMContentLoaded", function () {
    const executionBox = document.getElementById("scrollBox");
    const excecuteButton = document.getElementById("scrollButton");
    const typeProcess = document.getElementById("selectBox");
    const addButton = document.getElementById("addButton");
    const sendBatch = document.getElementById("scrollButton2");
    const previousProcess = document.getElementById("scrollBox2");
    const timeDisplay = document.getElementById("tiempoTotal");
    const processQueve = []; 
    let processNumber = 1;
    let isProcessing = false; 
    let seconds = 0;


    //Evento a realizar mi boton "agregar" segun mi typeProcess
    addButton.addEventListener('click', function(){
        if(typeProcess.value==="Serie"){
            processQueve.push(addProcess(executionBox));
            if (!isProcessing) {
                executeSerialProcess();
            }   
        }else if(typeProcess.value==="Monoprogramacion"){
            addProcess(previousProcess);
        }else if(typeProcess.value==="Multiprogramacion"){
            addProcessInTable();    
        }else{

        }
    });

    //Evento a realizar al escoger mi typeProcess
    typeProcess.addEventListener("change", function () {
        const selectedValue = typeProcess.value;
        if (selectedValue === "Multiprogramacion") {
            previousProcess.replaceChildren();
            previousProcess.appendChild(createTable());//inserta una tabla de vista previa de mi batch
            excecuteButton.disabled = false;
            sendBatch.disabled = false;
        } else if (selectedValue === "Monoprogramacion") {
            excecuteButton.disabled = false;
            sendBatch.disabled = false;
            previousProcess.replaceChildren();//elimina la tabla anteriormente insertada al dar otra opcion
        } else {
            excecuteButton.disabled = true;
            sendBatch.disabled = true;
            previousProcess.replaceChildren();//elimina la tabla anteriormente insertada al dar otra opcion
        }
    });

    //Evento a realizar al interactuar con el boton "Enviar lote" segun typeProcess
    sendBatch.addEventListener("click", function () {
        const children = Array.from(previousProcess.children); // Convierte los hijos en un array
        const batch = document.createElement("div");//Crea un lote que va a contener procesos
        batch.className = "myBatch";   
        children.forEach((child) => {
            batch.appendChild(child);
        });
        processQueve.push(batch);//agrega a un array el batch 
        executionBox.appendChild(batch);//visualizo mi batch en el panel de ejecucion      
        processNumber = 1;
        if(typeProcess.value==="Multiprogramacion"){
            previousProcess.appendChild(createTable());
        }   
});

    //Evento a realizar al interactuar con el boton "Ejecutar" segun typeProcess
    excecuteButton.addEventListener('click', function(){
        if(typeProcess.value==="Monoprogramacion"){
            executeMonoBatch();
        }else if(typeProcess.value==="Multiprogramacion"){
            executeMultiBatch();
        }   
    });


    function createTable(){
        // Crear la tabla
        const table = document.createElement("table");
        const tableContainer = document.createElement("div");
         

        // Crear el encabezado de la tabla
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const th1 = document.createElement("th");
        th1.textContent = "ID";
        const th2 = document.createElement("th");
        th2.textContent = "Tiempo Restante";

        headerRow.appendChild(th1);
        headerRow.appendChild(th2);
        thead.appendChild(headerRow);

        // Crear el cuerpo de la tabla
        const tbody = document.createElement("tbody");
        tbody.id = "procesos";

        // Insertar encabezado y cuerpo en la tabla
        table.appendChild(thead);
        table.appendChild(tbody);

        tableContainer.appendChild(table);

        return tableContainer;
    }



    
    //agregar un proceso a un contenedor escogido por parametro
    function addProcess(boxParam){
        const newProcces = document.createElement("div");
        newProcces.className = "myProcess";
        newProcces.textContent = "Proceso";

        //creo mi barra de animacion de progreso
        const bar = document.createElement("progress");
        bar.value = 0;
        bar.max = 100;
        bar.className = "barProcess";

        newProcces.appendChild(bar);
        boxParam.appendChild(newProcces);
      
        return newProcces;
    }

    //Funcion que me agrega un proceso a una tabla previa a la ejecucion de un proceso Multiprogramacion
    function addProcessInTable() {
        const table = previousProcess.querySelector("table");
        const tbody = table.querySelector("tbody");

        let fila = tbody.insertRow();
        let celdaId = fila.insertCell(0);
        let celdaTiempo = fila.insertCell(1);

        celdaId.textContent = processNumber;
        processNumber++;
    
        celdaTiempo.textContent = Math.floor(Math.random() * 10) + 1;

    }


    //funcion que me ejecuta mis procesos en serie 
    function executeSerialProcess() {
        if (processQueve.length === 0) {
            isProcessing = false; // No hay más procesos en cola
            return;
        }
    
        isProcessing = true;
        const process = processQueve.shift(); // Sacar el primer proceso de la cola
        const bar = process.querySelector(".barProcess");
        
        
    
        let tiempoTotal = 3;
        let tiempoTranscurrido = 0;
        let pausaRealizada = false; // Bandera para saber si la pausa ya ocurrió
    
        let intervalo = setInterval(() => {
            if (tiempoTranscurrido === 1 && !pausaRealizada) {
                clearInterval(intervalo); // Pausar la actualización de la barra
                pausaRealizada = true; // Marcar que la pausa ya ocurrió
                setTimeout(() => {
                    // Reanudar el proceso después de la pausa
                    intervalo = setInterval(actualizarBarra, 1000);
                }, 2000); // Pausa de 2 segundos
            } else {
                actualizarBarra();
            }
        }, 1000);
    
        function actualizarBarra() {
            tiempoTranscurrido++;
            let porcentaje = (tiempoTranscurrido / tiempoTotal) * 100;
            bar.value = porcentaje;
            seconds++;
            timeDisplay.textContent = `${seconds} Segundos`;


    
            if (tiempoTranscurrido >= tiempoTotal) {
                clearInterval(intervalo);
                process.remove(); // Eliminar el proceso terminado
                executeSerialProcess(); // Ejecutar el siguiente proceso en la cola
            }
        }
    }


    //funcion que me ejecuta mis lotes monoprogramacion con las procesos de cada batch
    function executeMonoBatch() {
        if (processQueve.length === 0) return; // Si no hay procesos, salir
    
        const batch = processQueve.shift(); // Obtener el primer batch
        const children = Array.from(batch.children);//Hijos o procesos de mi batch
    
        function procesarUnoPorUno(index) {
            if (index >= children.length) {//comprueba que ya recorri todos los procesos
                batch.remove(); // Eliminar el batch cuando todos los procesos terminen
                executeMonoBatch(); // Ejecutar el siguiente batch
                return;
            }
    
            const child = children[index];//obtengo un procesos de mi batch
            const bar = child.querySelector(".barProcess");//obtengo la barra de visualizacion
    
            let tiempoTotal = 3; // Segundos
            let tiempoTranscurrido = 0;
    
            let intervalo = setInterval(() => {
                tiempoTranscurrido++;
                let porcentaje = (tiempoTranscurrido / tiempoTotal) * 100;
                bar.value = porcentaje;
                seconds++;
                timeDisplay.textContent = `${seconds} Segundos`;

                if (tiempoTranscurrido >= tiempoTotal) {
                    clearInterval(intervalo);
                    child.remove(); // Eliminar el proceso terminado
                    procesarUnoPorUno(index + 1); // Llamar recursivamente al siguiente proceso
                }
            }, 1000);
        }
    
        procesarUnoPorUno(0); // Iniciar el procesamiento con el primer hijo del batch
    }

    //funcion que me ejecuta mis lotes con las tablas llenas de procesos 
    async function executeMultiBatch() {
        let quantum = 2;//quantum para consumir mis procesos 
    
        for (let batch of processQueve) { // Iteramos sobre cada batch en el array
            let tabla = batch.querySelector("tbody"); // Obtenemos la tabla dentro del batch
    
            while (tabla.rows.length > 0) {
                for (let i = 0; i < tabla.rows.length; i++) {
                    let fila = tabla.rows[i];
                    let tiempoRestante = parseInt(fila.cells[1].innerText);
    
                    if (tiempoRestante > 0) {
                        let ejecutar = Math.min(quantum, tiempoRestante);
                        tiempoRestante -= ejecutar;
                        fila.cells[1].innerText = tiempoRestante;
                        seconds = seconds + ejecutar;
                        timeDisplay.textContent = `${seconds} Segundos`;
                        await new Promise(r => setTimeout(r, 1000)); // Simula la ejecución
    
                        if (tiempoRestante === 0) {
                            fila.remove(); // Elimina la fila si el proceso terminó
                            i--; // Ajusta el índice tras eliminar la fila
                        }
                    }
                }
            }

            batch.remove();//remueve el batch terminado 
        }
    }
 
})