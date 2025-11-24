document.addEventListener('DOMContentLoaded', () => {
    generateMatrixInput('A');
    generateMatrixInput('B');
    generateMatrixInput('C'); // Generar C al inicio
    generateMatrixInput('D'); // Generar D al inicio
    // Establecer la fecha actual por defecto
    document.getElementById('header-fecha').value = new Date().toISOString().substring(0, 10);
});

// Número máximo de colores definidos en CSS (bg-color-0 a bg-color-9)
const COLOR_LIMIT = 10; 
let exerciseCount = 0; // Contador de ejercicios

// --- FUNCIONES DE UTILIDAD Y GENERACIÓN DE HTML ---

function getColorClass(i, j, cols) {
    // Calcula un índice único (i * cols + j) y usa módulo para reciclar los 10 colores.
    const index = (i * cols + j) % COLOR_LIMIT; 
    return `bg-color-${index}`;
}

/**
 * Genera la estructura de campos de entrada (inputs) para una matriz (A, B, C o D) usando <table>.
 */
function generateMatrixInput(matrixId) {
    const rows = parseInt(document.getElementById(`rows${matrixId}`).value);
    const cols = parseInt(document.getElementById(`cols${matrixId}`).value);
    const container = document.getElementById(`matrix${matrixId}-container`);
    
    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
        container.innerHTML = `<p class="error">Dimensiones inválidas para Matriz ${matrixId}.</p>`;
        return;
    }

    container.innerHTML = ''; 
    
    const table = document.createElement('table');
    table.className = `matrix-table ${matrixId}`;
    table.id = `matrix-table-${matrixId}`;

    for (let i = 0; i < rows; i++) {
        const row = table.insertRow();
        for (let j = 0; j < cols; j++) {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `cell${matrixId}-${i}-${j}`;
            input.placeholder = '0';
            cell.appendChild(input);
        }
    }
    container.appendChild(table);
}

/**
 * Lee los valores de una matriz desde los campos de entrada de la tabla.
 */
function getMatrixValues(matrixId) {
    const table = document.getElementById(`matrix-table-${matrixId}`);
    // Asegurarse de que la tabla existe y tiene filas, sino retorna array vacío
    if (!table || table.rows.length === 0) return []; 

    const rows = table.rows.length;
    const cols = table.rows[0].cells.length; // Si tiene filas, debe tener celdas
    const matrix = [];

    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const inputElement = table.rows[i].cells[j].querySelector('input');
            let value = parseFloat(inputElement.value);
            
            if (inputElement.value === '' || isNaN(value)) {
                value = 0;
            }
            row.push(value);
        }
        matrix.push(row);
    }
    return matrix;
}

/**
 * Construye la tabla de matriz de entrada (A, B, C o D) con colores para la impresión.
 */
function createInputTableHTML(matrix, id, colsR, operation) {
    const rows = matrix.length;
    // Manejar matriz vacía
    if (rows === 0 || matrix[0] === undefined) return `<p style="color:#e74c3c;">Matriz ${id} no definida o vacía.</p>`;

    const cols = matrix[0].length;
    let html = `<table class="matrix-table ${id}">`;

    for (let i = 0; i < rows; i++) {
        html += '<tr>';
        for (let j = 0; j < cols; j++) {
            let colorClass = '';
            
            // Usar el ancho de la matriz resultante para colorear
            colorClass = getColorClass(i, j, colsR);

            const inputValue = matrix[i][j].toFixed(2).replace(/\.?0+$/, '');
            html += `<td class="${colorClass.trim()}">${inputValue}</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
}

/**
 * Construye la tabla de Paso a Paso.
 */
function createStepTableHTML(steps, results, colsR) {
    const rows = steps.length;
    // Manejar matriz vacía
    if (rows === 0 || steps[0] === undefined) return '';

    let html = '<div class="matrix-table-container"><table class="matrix-table step-table">';
    for (let i = 0; i < rows; i++) {
        html += '<tr>';
        for (let j = 0; j < steps[0].length; j++) {
            const colorClass = getColorClass(i, j, colsR);
            const resultValue = results[i][j].toFixed(4).replace(/\.?0+$/, '');
            html += `<td class="${colorClass}">${steps[i][j]} = <b>${resultValue}</b></td>`;
        }
        html += '</tr>';
    }
    html += '</table></div>';
    return html;
}

/**
 * Construye la tabla de Resultados Finales.
 */
function createResultTableHTML(matrix, colsR) {
    const rows = matrix.length;
    // Manejar matriz vacía
    if (rows === 0 || matrix[0] === undefined) return '';
    
    let html = '<div class="matrix-table-container"><table class="matrix-table result-table">';
    for (let i = 0; i < rows; i++) {
        html += '<tr>';
        for (let j = 0; j < matrix[0].length; j++) {
            const colorClass = getColorClass(i, j, colsR);
            html += `<td class="${colorClass}">${matrix[i][j].toFixed(4).replace(/\.?0+$/, '')}</td>`;
        }
        html += '</tr>';
    }
    html += '</table></div>';
    return html;
}

// --- FUNCIONES DE CÁLCULO BÁSICO ---

function calculateElementWise(A, B, symbol) {
    const rows = A.length;
    const cols = A[0].length;
    const C = []; 
    const S = []; 
    for (let i = 0; i < rows; i++) {
        C[i] = [];
        S[i] = [];
        for (let j = 0; j < cols; j++) {
            const valA = A[i][j];
            const valB = B[i][j];
            C[i][j] = (symbol === '+') ? (valA + valB) : (valA - valB);
            S[i][j] = `${valA} ${symbol} ${valB}`;
        }
    }
    return [C, S];
}

function calculateMultiplication(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length; 
    const colsB = B[0].length;
    const C = []; 
    const S = []; 
    for (let i = 0; i < rowsA; i++) {
        C[i] = [];
        S[i] = [];
        for (let j = 0; j < colsB; j++) {
            let sum = 0;
            let stepString = ""; 
            
            for (let k = 0; k < colsA; k++) {
                sum += A[i][k] * B[k][j];
                
                stepString += `(${A[i][k].toFixed(2).replace(/\.?0+$/, '')} x ${B[k][j].toFixed(2).replace(/\.?0+$/, '')})`;
                if (k < colsA - 1) {
                    stepString += " + ";
                }
            }
            C[i][j] = sum;
            S[i][j] = stepString;
        }
    }
    return [C, S];
}

// --- LÓGICA DE OPERACIONES MÚLTIPLES (CADENAS) ---

/**
 * Ejecuta una operación por etapas (A+B+C, A-B-C o AxBxC).
 */
function executeChainOperation(operation, matrices) {
    const operationSymbols = operation.match(/[+\-x]/g) || []; // Obtiene todos los símbolos de la operación (+, -, x)
    let currentResult = matrices[0];
    let allSteps = [];
    let matricesUsed = [operation[0]]; // Para la etiqueta de las matrices

    // Iterar sobre las matrices restantes (B, C, D...)
    for (let i = 1; i < matrices.length; i++) {
        const nextMatrix = matrices[i];
        const nextMatrixLabel = operation[i*2]; // Etiqueta de la matriz (B, C, D)
        const opSymbol = operationSymbols[i - 1]; // EL SÍMBOLO CORRECTO para esta etapa
        matricesUsed.push(nextMatrixLabel);

        if (currentResult.length === 0 || nextMatrix.length === 0) {
            throw new Error(`Matriz ${matricesUsed[i-1]} o Matriz ${nextMatrixLabel} está vacía.`);
        }

        let result;
        let steps;

        if (opSymbol === '+' || opSymbol === '-') {
            // Verificar dimensiones para suma/resta
            if (currentResult.length !== nextMatrix.length || currentResult[0].length !== nextMatrix[0].length) {
                throw new Error(`Dimensiones incompatibles para la operación de Suma/Resta en la etapa ${i}.`);
            }
            [result, steps] = calculateElementWise(currentResult, nextMatrix, opSymbol);
            // La etiqueta de la etapa usa el símbolo correcto
            allSteps.push({ stage: `(${matricesUsed.slice(0, i).join(operationSymbols[i-2] || operationSymbols[0])}) ${opSymbol} ${nextMatrixLabel}`, steps, result });
        } else if (opSymbol === 'x') { // Multiplicación
            // Verificar dimensiones para multiplicación
            if (currentResult[0].length !== nextMatrix.length) {
                throw new Error(`Dimensiones incompatibles para la operación de Multiplicación en la etapa ${i}. Filas de ${nextMatrixLabel} (${nextMatrix.length}) no coinciden con columnas del resultado anterior (${currentResult[0].length}).`);
            }
            [result, steps] = calculateMultiplication(currentResult, nextMatrix);
            allSteps.push({ stage: `(${matricesUsed.slice(0, i).join(' x ')}) x ${nextMatrixLabel}`, steps, result });
        }
        
        currentResult = result;
    }
    
    // Construir la etiqueta final (Ej: A-B-C)
    let finalLabel = operation[0];
    for (let i = 0; i < operationSymbols.length; i++) {
        finalLabel += operationSymbols[i] + operation[ (i+1) * 2 ];
    }


    return { result: currentResult, steps: allSteps, label: finalLabel };
}

/**
 * Ejecuta el cálculo y añade el ejercicio completo al reporte.
 */
function addExerciseToReport() {
    const operationCode = document.getElementById('operation').value;
    const errorDisplay = document.getElementById('error-message');
    errorDisplay.textContent = ''; 

    // Obtener las matrices requeridas según la operación
    const matrixIds = operationCode.replace(/[^A-D]/g, '').split(''); // Ej: "A+B+C" -> ["A", "B", "C"]
    const matrices = [];

    for (const id of matrixIds) {
        const matrix = getMatrixValues(id);
        if (matrix.length === 0 || matrix[0] === undefined || matrix[0].length === 0) {
            errorDisplay.textContent = `Error: La Matriz ${id} es requerida y no está definida o está vacía.`;
            return;
        }
        matrices.push(matrix);
    }
    
    let finalResult = null;
    let stageSteps = []; // Guarda los resultados y pasos de cada sub-operación
    let operationName = operationCode;
    let finalLabel = operationCode;

    try {
        if (matrices.length === 2) {
            // Lógica de dos matrices (A+B, A-B, AxB)
            const opSymbol = operationCode.includes('+') ? '+' : (operationCode.includes('-') ? '-' : 'x');
            const opLabel = opSymbol === '+' ? 'Suma' : (opSymbol === '-' ? 'Resta' : 'Multiplicación');
            operationName = opLabel;

            const A = matrices[0];
            const B = matrices[1];
            
            if (opSymbol === '+' || opSymbol === '-') {
                 if (A.length !== B.length || A[0].length !== B[0].length) {
                    throw new Error(`La ${opLabel} requiere matrices de la misma dimensión.`);
                }
                const [result, steps] = calculateElementWise(A, B, opSymbol);
                finalResult = result;
                stageSteps.push({ stage: operationCode, steps, result });
            } else { // Multiplicación (AxB)
                if (A[0].length !== B.length) {
                    throw new Error(`La Multiplicación requiere que Columnas de A (${A[0].length}) coincida con Filas de B (${B.length}).`);
                }
                const [result, steps] = calculateMultiplication(A, B);
                finalResult = result;
                stageSteps.push({ stage: operationCode, steps, result });
            }

        } else if (matrices.length > 2) {
            // Lógica de cadenas (A+B+C, A-B-C, AxBxC, etc.)
            const chainResult = executeChainOperation(operationCode, matrices);
            finalResult = chainResult.result;
            stageSteps = chainResult.steps;
            operationName = "Cadena de Operaciones";
            finalLabel = chainResult.label;
        }

    } catch (error) {
        errorDisplay.textContent = `Error en el cálculo: ${error.message}`;
        return;
    }
    
    // --- GENERACIÓN DEL REPORTE ---
    exerciseCount++;
    const currentId = exerciseCount;
    
    // Verificación final en caso de matrices vacías después del cálculo (aunque ya se filtró)
    if (finalResult === null || finalResult.length === 0) {
        errorDisplay.textContent = `Error en el cálculo: La matriz resultante está vacía.`;
        return;
    }
    
    const finalRows = finalResult.length;
    const finalCols = finalResult[0].length;
    
    let matricesHTML = '';
    let stepByStepHTML = '<h4>Paso a Paso (Operaciones)</h4>';

    // 1. Mostrar todas las matrices usadas
    for (let i = 0; i < matrixIds.length; i++) {
        matricesHTML += `
            <div style="flex: 1; min-width: 250px;">
                <h4>Matriz ${matrixIds[i]}</h4>
                ${createInputTableHTML(matrices[i], matrixIds[i], finalCols, operationCode)}
            </div>
        `;
    }

    // 2. Mostrar los pasos por etapa
    for (let i = 0; i < stageSteps.length; i++) {
        const stage = stageSteps[i];
        const resultMatrix = stage.result;
        const resultCols = resultMatrix[0].length;
        stepByStepHTML += `
            <h5 style="margin-bottom: 5px;">Etapa ${i + 1}: ${stage.stage}</h5>
            ${createStepTableHTML(stage.steps, resultMatrix, resultCols)}
        `;
    }

    const reportHTML = `
        <div class="exercise-report" id="exercise-${currentId}">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; margin-bottom: 10px;">
                <h3 style="margin: 0;">Ejercicio ${currentId}: ${operationName} (${finalLabel} = ${finalRows}x${finalCols})</h3>
                <button onclick="removeExercise(${currentId})" style="background-color: #e74c3c; padding: 5px 10px; font-size: 0.8em;">🗑️ Eliminar</button>
            </div>
            
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px;">
                ${matricesHTML}
            </div>

            ${stepByStepHTML}

            <h4>Resultado Final (Matriz R)</h4>
            ${createResultTableHTML(finalResult, finalCols)}
        </div>
    `;

    document.getElementById('exercises-list').insertAdjacentHTML('beforeend', reportHTML);
    document.querySelector('.placeholder')?.remove();
}

/**
 * Remueve un ejercicio específico del reporte usando su ID y renumeera los restantes.
 * @param {number} id - El número único del ejercicio a remover.
 */
window.removeExercise = function(id) {
    const exerciseElement = document.getElementById(`exercise-${id}`);
    if (exerciseElement) {
        exerciseElement.remove();
        
        const exercisesList = document.getElementById('exercises-list');
        
        if (!exercisesList.hasChildNodes()) {
            exercisesList.innerHTML = '<p class="placeholder">Añade ejercicios para generar el reporte.</p>';
            exerciseCount = 0;
        } else {
            let currentCount = 0;
            exercisesList.querySelectorAll('.exercise-report').forEach(element => {
                currentCount++;
                element.id = `exercise-${currentCount}`;
                
                const headerH3 = element.querySelector('h3');
                const titleParts = headerH3.textContent.split(': ');
                if(titleParts.length > 1) {
                    headerH3.innerHTML = `Ejercicio ${currentCount}: ${titleParts[1]}`;
                } else {
                    headerH3.innerHTML = `Ejercicio ${currentCount}: N/A`;
                }
                
                element.querySelector('button').setAttribute('onclick', `removeExercise(${currentCount})`);
            });
            exerciseCount = currentCount; 
        }
    }
}


// --- FUNCIONES DE IMPORTACIÓN DE TEXTO ---

/**
 * Muestra u oculta el área de pegado para la matriz especificada.
 */
window.showPasteArea = function(matrixId) {
    const area = document.getElementById(`paste${matrixId}-area`);
    // Toggle (Mostrar/Ocultar)
    area.style.display = (area.style.display === 'block') ? 'none' : 'block';
}

/**
 * Importa los valores de una matriz desde texto plano (separado por comas, espacios o saltos de línea).
 */
window.importMatrixFromText = function(matrixId) {
    const text = document.getElementById(`paste${matrixId}-text`).value.trim();
    if (!text) {
        alert("El área de texto está vacía.");
        return;
    }

    const rows = text.split('\n');
    const newMatrix = [];

    // Patrón para dividir por comas O espacios, eliminando entradas vacías
    const delimiterPattern = /[\s,]+/;

    for (const rowText of rows) {
        const cells = rowText.split(delimiterPattern).filter(val => val.trim() !== '');
        // Convertir cada valor a número (o 0 si no es válido)
        const row = cells.map(val => parseFloat(val) || 0);
        
        if (row.length > 0) {
            newMatrix.push(row);
        }
    }

    if (newMatrix.length === 0 || newMatrix[0].length === 0) {
        alert("No se pudo parsear una matriz válida. Asegúrate de usar números separados por comas o espacios.");
        return;
    }
    
    // Asegurar que todas las filas tengan el mismo número de columnas
    const newRows = newMatrix.length;
    const newCols = newMatrix[0].length;
    const isValid = newMatrix.every(row => row.length === newCols);
    
    if (!isValid) {
        alert("Error: Todas las filas de la matriz deben tener el mismo número de columnas.");
        return;
    }

    // 1. Actualizar las dimensiones de los inputs de setup
    document.getElementById(`rows${matrixId}`).value = newRows;
    document.getElementById(`cols${matrixId}`).value = newCols;

    // 2. Generar la tabla con las nuevas dimensiones
    generateMatrixInput(matrixId);

    // 3. Rellenar la tabla con los valores importados
    for (let i = 0; i < newRows; i++) {
        for (let j = 0; j < newCols; j++) {
            const inputId = `cell${matrixId}-${i}-${j}`;
            const input = document.getElementById(inputId);
            if (input) {
                input.value = newMatrix[i][j];
            }
        }
    }
    
    // Ocultar el área de pegado y limpiar
    document.getElementById(`paste${matrixId}-area`).style.display = 'none';
    document.getElementById(`paste${matrixId}-text`).value = '';
    alert(`Matriz ${matrixId} (${newRows}x${newCols}) importada con éxito.`);
}


// --- FUNCIONES DE IMPRESIÓN ---

/**
 * Genera el encabezado del reporte.
 */
function generateHeaderHTML() {
    const materia = document.getElementById('header-materia').value || 'N/A';
    const nombre = document.getElementById('header-nombre').value || 'N/A';
    const carrera = document.getElementById('header-carrera').value || 'N/A';
    const sede = document.getElementById('header-sede').value || 'N/A';
    const jornada = document.getElementById('header-jornada').value || 'N/A';
    const fecha = document.getElementById('header-fecha').value || new Date().toISOString().substring(0, 10);

    return `
        <div class="report-header">
            <h1 style="text-align: center; margin-bottom: 5px;">Reporte de Cálculos de Matrices</h1>
            <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
                <p><strong>Materia:</strong> ${materia}</p>
                <p><strong>Carrera:</strong> ${carrera}</p>
                <p><strong>Realizado por:</strong> ${nombre}</p>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
                <p><strong>Sede:</strong> ${sede}</p>
                <p><strong>Jornada:</strong> ${jornada}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
            </div>
            <hr style="border-top: 1px solid #ccc;">
        </div>
    `;
}

/**
 * Prepara el contenido para imprimir (Encabezado + Ejercicios) y abre la ventana de impresión.
 */
function printReport() {
    const printArea = document.getElementById('print-area');
    const exercisesList = document.getElementById('exercises-list').innerHTML;

    if (exercisesList.includes('placeholder')) {
        alert('Por favor, añade al menos un ejercicio al reporte antes de imprimir.');
        return;
    }

    // Combinar encabezado y ejercicios
    printArea.innerHTML = generateHeaderHTML() + exercisesList;

    // Abrir ventana de impresión
    window.print();
}

/**
 * Limpia la lista de ejercicios del reporte.
 */
function clearReport() {
    const list = document.getElementById('exercises-list');
    list.innerHTML = '<p class="placeholder">Añade ejercicios para generar el reporte.</p>';
    exerciseCount = 0;
    alert('Reporte limpiado.');
}
