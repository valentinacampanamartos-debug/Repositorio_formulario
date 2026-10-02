document.getElementById('form-inscripcion').addEventListener('submit', async function(evento) {
    evento.preventDefault(); // Detiene el envío automático para validar primero

    let formularioValido = true;
    const campos = ['apellido', 'nombre', 'documento', 'email', 'celular', 'empresa', 'cargo', 'comprobante'];
    const datosEnvio = new FormData(); // Necesario para enviar archivos adjuntos y texto

    // 1. Limpiar los errores de la validación anterior
    document.querySelectorAll('.campo-invalido').forEach(input => input.classList.remove('campo-invalido'));
    document.querySelectorAll('[id^="error-"]').forEach(span => span.textContent = '');

    // 2. Iterar sobre cada campo acordado
    campos.forEach(campo => {
        const inputElemento = document.getElementById(`input-${campo}`);
        const errorElemento = document.getElementById(`error-${campo}`);
        let valor = inputElemento.value.trim();

        // Validación: Ningún campo puede estar vacío
        if (!valor && campo !== 'comprobante') {
            mostrarError(inputElemento, errorElemento, 'Este campo es obligatorio.');
            formularioValido = false;
        } else if (campo === 'comprobante' && inputElemento.files.length === 0) {
            mostrarError(inputElemento, errorElemento, 'Debe adjuntar su comprobante de pago.');
            formularioValido = false;
        } else {
            // Validaciones específicas de formato
            if (campo === 'documento' && !/^\d{8}$/.test(valor)) {
                mostrarError(inputElemento, errorElemento, 'El documento debe tener exactamente 8 dígitos.');
                formularioValido = false;
            }
            if (campo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
                mostrarError(inputElemento, errorElemento, 'Ingrese un formato de email válido.');
                formularioValido = false;
            }
            if (campo === 'celular' && !/^\d{9,10}$/.test(valor)) {
                mostrarError(inputElemento, errorElemento, 'El celular debe tener entre 9 y 10 dígitos.');
                formularioValido = false;
            }
        }

        // Agregar los datos capturados para enviarlos al backend
        if (campo === 'comprobante' && inputElemento.files.length > 0) {
            datosEnvio.append(campo, inputElemento.files[0]);
        } else {
            datosEnvio.append(campo, valor);
        }
    });

    // 3. Envío al servidor si todo es válido
    if (formularioValido) {
        try {
            const respuesta = await fetch('/inscribir', {
                method: 'POST',
                body: datosEnvio
            });

            if (respuesta.ok) {
                document.getElementById('form-inscripcion').reset();
                // Opcional: Podés inyectar un mensaje de éxito en el DOM aquí
                console.log('Inscripción exitosa'); 
            } else {
                console.error('Error al registrar en el servidor');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
        }
    }
});

// Función auxiliar para inyectar errores sin usar alert()
function mostrarError(input, spanElemento, mensaje) {
    input.classList.add('campo-invalido');
    if (spanElemento) {
        spanElemento.textContent = mensaje;
    }
}