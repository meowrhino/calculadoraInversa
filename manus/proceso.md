# Proceso de creación - calculadoraInversa

## Objetivo

Crear una calculadora inversa de impuestos minimalista que permita calcular el total a cobrar desde la base imponible, con inputs para IVA e IRPF.

## Requisitos funcionales

1. **Input de base imponible**: Campo numérico para introducir la cantidad base en euros (permite decimales)
2. **Input de IVA**: Campo numérico que solo acepta números enteros naturales
3. **Input de IRPF**: Campo numérico que solo acepta números enteros naturales
   - Si IRPF está a 0, el input se desactiva visualmente
   - Se puede reactivar mediante un botón toggle
4. **Resultado**: Muestra el desglose (base, IVA, IRPF si aplica) y el total a cobrar
5. **Interfaz minimalista**: Sin textos explicativos largos, diseño limpio y directo

## Decisiones de diseño

### Estructura HTML

El proyecto se divide en tres secciones principales:

1. **Header**: Título y descripción breve
2. **Main panel**: Contiene dos columnas (inputs y resultado) que se adaptan en responsive
3. **Branding**: Footer con enlace a meowrhino.studio

### Estilo visual

Se mantiene la estética del proyecto original `tarifas2026`:

- Paleta de colores: `--primary: #7c5aa8`, `--bg: #faf9fb`
- Tipografía: System fonts (Apple/Segoe UI/Roboto)
- Border radius: 12px
- Sombras suaves
- Grid responsive con `minmax(320px, 1fr)`

### Funcionalidad JavaScript

El script se estructura de forma modular:

1. **Selección de elementos**: Función helper `$()` para acceder al DOM
2. **Estado de IRPF**: Variable `irpfEnabled` que controla si el campo está activo
3. **Utilidades**: Funciones `toNum()` y `round2()` para conversión y redondeo
4. **Cálculo**: Función `compute()` que actualiza todos los resultados
5. **Toggle**: Función `toggleIrpfState()` que activa/desactiva el campo IRPF
6. **Inicialización**: Función `init()` que configura eventos y estado inicial

### Validación de inputs

- **IVA e IRPF**: Se usa `Math.floor()` para asegurar que solo se aceptan números enteros
- **Base imponible**: Permite decimales con `step="0.01"`
- **Valores negativos**: Se usa `Math.max(0, ...)` para evitar valores negativos

### Toggle de IRPF

Se implementó un botón toggle visual que:

- Muestra ✓ cuando está activo (fondo morado)
- Muestra ✗ cuando está inactivo (fondo blanco)
- Desactiva el input cuando IRPF = 0
- Al reactivar, establece automáticamente el valor a 15% si estaba en 0

## Archivos generados

- `index.html`: Estructura de la página
- `styles.css`: Estilos visuales basados en tarifas2026
- `script.js`: Lógica de cálculo y toggle
- `README.md`: Documentación del proyecto
- `manus/proceso.md`: Este archivo de documentación del proceso

## Próximos pasos

1. Subir el proyecto a GitHub como nuevo repositorio
2. Probar la funcionalidad en diferentes navegadores
3. Validar el responsive en dispositivos móviles
