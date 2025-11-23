document.addEventListener('DOMContentLoaded', () => {
    generateMatrixInput('A');
    generateMatrixInput('B');
});

// Número máximo de colores definidos en CSS (bg-color-0 a bg-color-9)
const COLOR_LIMIT = 10; 

// Función para obtener el color basado en la posición (i, j)
function getColorClass(i, j, cols) {
    // Calcula un índice único (i * cols + j) y usa módulo para reciclar los 10 colores.
    const index = (i * cols + j) % COLOR_LIMIT; 
    return `bg-color-${index}`;
}


/**
 * Genera la estructura de campos de entrada (inputs) para una matriz (A o B) usando <table>.
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
    if (!table) return [];

    const rows = table.rows.length;
    const cols = table.rows.length > 0 ? table.rows[0].cells.length : 0;
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
 * Muestra el resultado final en formato de tabla, aplicando el color.
 */
function displayResult(matrix, cols) {
    const container = document.getElementById('result-container');
    container.innerHTML = ''; 

    if (!matrix || matrix.length === 0) return; 

    const table = document.createElement('table');
    table.className = 'matrix-table result-table';

    for (let i = 0; i < matrix.length; i++) {
        const row = table.insertRow();
        for (let j = 0; j < matrix[0].length; j++) {
            const cell = row.insertCell();
            // Aplicar color
            cell.classList.add(getColorClass(i, j, cols));
            
            cell.textContent = matrix[i][j].toFixed(4).replace(/\.?0+$/, ''); 
        }
    }
    container.appendChild(table);
}

/**
 * Muestra la operación y el resultado de esa celda en formato de tabla, aplicando el color.
 */
function displayOperationSteps(steps, results, operation) {
    const container = document.getElementById('operation-display-container');
    container.innerHTML = '';

    if (!steps || steps.length === 0) return;

    const rows = steps.length;
    const cols = steps[0].length;

    const table = document.createElement('table');
    table.className = 'matrix-table step-table';
    
    const isMultiplication = operation === 'multiply';
    if (isMultiplication) {
        addMultiplicationHoverListeners(table, rows, cols);
    }

    for (let i = 0; i < rows; i++) {
        const row = table.insertRow();
        for (let j = 0; j < cols; j++) {
            const cell = row.insertCell();
            
            // Aplicar color
            cell.classList.add(getColorClass(i, j, cols));

            // Construir la cadena: Operación = Resultado
            const resultValue = results[i][j].toFixed(4).replace(/\.?0+$/, '');
            cell.innerHTML = `${steps[i][j]} = <b>${resultValue}</b>`;

            if (isMultiplication) {
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', j);
            }
        }
    }
    container.appendChild(table);
}

/**
 * Agrega los listeners de mouseover/mouseout para el sombreado de multiplicación. (Lógica sin cambios)
 */
function addMultiplicationHoverListeners(stepTable, rows, cols) {
    const matrixATable = document.getElementById('matrix-table-A');
    const matrixBTable = document.getElementById('matrix-table-B');

    stepTable.querySelectorAll('td').forEach(cell => {
        cell.addEventListener('mouseover', () => {
            const rowIdx = parseInt(cell.getAttribute('data-row'));
            const colIdx = parseInt(cell.getAttribute('data-col'));

            if (isNaN(rowIdx) || isNaN(colIdx)) return;

            // Sombreado de la FILA en la Matriz A (Color A)
            if (matrixATable && matrixATable.rows[rowIdx]) {
                Array.from(matrixATable.rows[rowIdx].cells).forEach(c => c.classList.add('highlight-A'));
            }

            // Sombreado de la COLUMNA en la Matriz B (Color B)
            if (matrixBTable) {
                for (let i = 0; i < matrixBTable.rows.length; i++) {
                    if (matrixBTable.rows[i].cells[colIdx]) {
                        matrixBTable.rows[i].cells[colIdx].classList.add('highlight-B');
                    }
                }
            }
        });

        cell.addEventListener('mouseout', () => {
            // Limpiar sombreado en Matriz A
            if (matrixATable) {
                matrixATable.querySelectorAll('td').forEach(c => c.classList.remove('highlight-A'));
            }

            // Limpiar sombreado en Matriz B
            if (matrixBTable) {
                matrixBTable.querySelectorAll('td').forEach(c => c.classList.remove('highlight-B'));
            }
        });
    });
}

/**
 * Ejecuta el cálculo y prepara los datos para la visualización.
 */
function calculate() {
    const A = getMatrixValues('A');
    const B = getMatrixValues('B');
    const operation = document.getElementById('operation').value;
    const errorDisplay = document.getElementById('error-message');
    
    let resultMatrix = null;
    let stepByStep = null;

    errorDisplay.textContent = ''; 
    document.getElementById('result-container').innerHTML = ''; 
    document.getElementById('operation-display-container').innerHTML = ''; 

    // Limpiar clases de sombreado
    document.getElementById('matrix-table-A')?.querySelectorAll('td').forEach(c => c.className = '');
    document.getElementById('matrix-table-B')?.querySelectorAll('td').forEach(c => c.className = '');


    const rowsA = A.length;
    const colsA = A[0].length;
    const rowsB = B.length;
    const colsB = B[0].length;
    const symbol = operation === 'add' ? '+' : (operation === 'subtract' ? '-' : 'x');


    try {
        switch (operation) {
            case 'add':
            case 'subtract':
                if (rowsA !== rowsB || colsA !== colsB) {
                    throw new Error('La Suma y Resta requieren que ambas matrices tengan las mismas dimensiones.');
                }
                
                [resultMatrix, stepByStep] = calculateElementWise(A, B, symbol);
                break;

            case 'multiply':
                if (colsA !== rowsB) {
                    throw new Error('La Multiplicación requiere que el número de Columnas de A sea igual al número de Filas de B.');
                }

                [resultMatrix, stepByStep] = calculateMultiplication(A, B);
                break;
        }
    } catch (error) {
        errorDisplay.textContent = `Error de cálculo: ${error.message}`;
        resultMatrix = null;
        stepByStep = null;
    }
    
    if (resultMatrix) {
        const colsR = resultMatrix[0].length; 

        // 1. Colorear las matrices de entrada A y B
        colorInputMatrices(resultMatrix.length, colsR, operation);
        
        // 2. Mostrar operaciones y resultado
        displayOperationSteps(stepByStep, resultMatrix, operation);
        displayResult(resultMatrix, colsR);
    }
}

/**
 * Colorea las celdas de las matrices A y B con el color que corresponde a la operación que generan.
 */
function colorInputMatrices(rowsR, colsR, operation) {
    const tableA = document.getElementById('matrix-table-A');
    const tableB = document.getElementById('matrix-table-B');
    if (!tableA || !tableB) return;
    
    if (operation === 'add' || operation === 'subtract') {
        // Lógica para Suma/Resta: El par A[i][j] y B[i][j] tienen el mismo color que R[i][j].
        for (let i = 0; i < rowsR; i++) {
            for (let j = 0; j < colsR; j++) {
                const colorClass = getColorClass(i, j, colsR);
                
                // Colorear A[i][j]
                if (tableA.rows[i] && tableA.rows[i].cells[j]) {
                    tableA.rows[i].cells[j].classList.add(colorClass);
                }
                // Colorear B[i][j]
                if (tableB.rows[i] && tableB.rows[i].cells[j]) {
                    tableB.rows[i].cells[j].classList.add(colorClass);
                }
            }
        }
    } else if (operation === 'multiply') {
        // Lógica para Multiplicación: Todos los elementos usados para R[i][j] tienen el color de R[i][j].
        const rowsA = tableA.rows.length;
        const colsB = tableB.rows[0].cells.length;
        const commonDim = tableA.rows[0].cells.length; // Filas de B

        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                const colorClass = getColorClass(i, j, colsR);

                for (let k = 0; k < commonDim; k++) {
                    // A[i][k] (Fila i, Columna k)
                    if (tableA.rows[i] && tableA.rows[i].cells[k]) {
                        tableA.rows[i].cells[k].classList.add(colorClass);
                    }
                    // B[k][j] (Fila k, Columna j)
                    if (tableB.rows[k] && tableB.rows[k].cells[j]) {
                        tableB.rows[k].cells[j].classList.add(colorClass);
                    }
                }
            }
        }
    }
}


/**
 * Realiza la suma o resta y genera los pasos. (Lógica sin cambios)
 */
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


/**
 * Realiza la multiplicación de dos matrices (A * B) y genera los pasos. (Lógica sin cambios)
 */
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


/**
 * Abre la ventana de impresión del navegador.
 */
function printResult() {
    window.print();
}