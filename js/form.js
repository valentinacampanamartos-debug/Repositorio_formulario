document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-inscripcion');

    formulario.addEventListener('submit', async (evento) => {
        // Evita que el formulario se envíe automáticamente y recargue la página
        evento.preventDefault();

        let esValido = true;

        // Lista de todos los campos (coinciden con la parte final de los IDs del HTML)
        const campos = ['apellido', 'nombre', 'documento', 'email', 'celular', 'empresa', 'cargo', 'comprobante'];

        // 1. Limpiar los mensajes y estilos de error previos
        campos.forEach(campo => {
            const inputElemento = document.getElementById(`input-${campo}`);
            const errorElemento = document.getElementById(`error-${campo}`);
            
            inputElemento.classList.remove('campo-invalido');
            errorElemento.textContent = '';
        });

        // 2. Validar cada campo
        campos.forEach(campo => {
            const inputElemento = document.getElementById(`input-${campo}`);
            const errorElemento = document.getElementById(`error-${campo}`);
            
            // Validación específica para el archivo (comprobante)
            if (campo === 'comprobante') {
                if (inputElemento.files.length === 0) {
                    mostrarError(inputElemento, errorElemento, 'Debe adjuntar un comprobante de pago.');
                    esValido = false;
                }
            } else {
                // Validación para campos de texto/números
                const valor = inputElemento.value.trim();

                if (valor === '') {
                    mostrarError(inputElemento, errorElemento, 'Este campo es obligatorio.');
                    esValido = false;
                } else {
                    // Validaciones específicas de formato
                    if (campo === 'documento' && !/^\d{8}$/.test(valor)) {
                        mostrarError(inputElemento, errorElemento, 'El documento debe tener exactamente 8 dígitos.');
                        esValido = false;
                    }
                    if (campo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
                        mostrarError(inputElemento, errorElemento, 'El formato del email no es válido.');
                        esValido = false;
                    }
                    if (campo === 'celular' && !/^\d{9,10}$/.test(valor)) {
                        mostrarError(inputElemento, errorElemento, 'El celular debe tener entre 9 y 10 dígitos.');
                        esValido = false;
                    }
                }
            }
        });

        // 3. Enviar los datos si todo está correcto
        if (esValido) {
            // FormData captura automáticamente todos los inputs (incluyendo el archivo) que tengan el atributo "name"
            const datosDelFormulario = new FormData(formulario);

            try {
                // Conexión al backend enviando los datos mediante POST a /inscribir
                const respuesta = await fetch('/inscribir', {
                    method: 'POST',
                    body: datosDelFormulario
                });

                if (respuesta.ok) {
                    // Limpia el formulario tras un envío exitoso
                    formulario.reset();
                    // Aquí podrías agregar un mensaje de éxito en el HTML si lo desean más adelante
                    console.log('Inscripción completada con éxito');
                } else {
                    console.error('Ocurrió un problema en el servidor al intentar registrar la inscripción');
                }
            } catch (error) {
                console.error('Error de conexión con el servidor:', error);
            }
        }
    });

    // Función auxiliar para inyectar la clase de error y el texto sin usar alert()
    function mostrarError(input, span, mensaje) {
        input.classList.add('campo-invalido');
        span.textContent = mensaje;
    }
});