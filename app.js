var map;
var geojsonLayer; // Declarada aquí para ser accesible globalmente

// Función para mostrar información (tu código existente)
async function displayInformation(featureMap){
    // console.log(featureMap);
    const candidatasResp = await fetch('candidatas.json');
    const candidatas = await candidatasResp.json();
    const candidata = candidatas.find(c => c.municipio.toString().toLowerCase() == featureMap.mun_name.toString().toLowerCase());
    const informationDiv = document.querySelector('#information'); // Asegúrate de tener un div con id="information" en tu HTML
    if (candidata) {
        informationDiv.innerHTML = `
            <div class="p-4 shadow-lg rounded-lg">
                <img class="mx-auto" width="200px" src="${candidata.foto}">
                <h2>${candidata.nombre}</h2>
                <hr>
                <h3>${featureMap.mun_name}</h3>
                <div class="flex flex-row gap-4">
                    <img src="${candidata.logo}" width="200px">
                    <span>${candidata.partido}</span>
                </div>
                <p>
                    ${JSON.stringify(featureMap)}
                </p>
            <div>
        `;
    } else {
        informationDiv.innerHTML = `
            <div class="p-4">
                <h2>Sin candidata</h2>
                <p>
                    No existe una candidata para este municipio
                </p>
                <p>${featureMap.mun_name}</p>
            <div>
        `;
    }
}

// Función para obtener el estilo de la capa (tu código existente)
async function getLayerStyle(municipio){
    let color = "#F5D9E3";
    let fill = "#ff0000"; // Usar el mismo formato si es un color HTML
    const candidatasResp = await fetch('candidatas.json');
    const candidatas = await candidatasResp.json();
    const candidata = candidatas.find(c => c.municipio.toString().toLowerCase() == municipio.toString().toLowerCase());
    if (candidata) {
        color = candidata.color;
        fill = candidata.fill;
    }
    return {color,fill};
}


// Función principal para cada característica GeoJSON
function onEachFeature(feature, layer) {
    // *** AQUI VAN bindPopup Y bindTooltip (se ejecutan una sola vez por cada feature) ***

    // Configuración del Popup
    if (feature.properties) {
        var popupContent = `<h3>${feature.properties.mun_name}</h3>`;
        // Solo vincula el popup si 'layer' es un objeto válido y tiene el método
        if (layer && typeof layer.bindPopup === 'function') {
            layer.bindPopup(popupContent);
        }
    }

    // --- AÑADIR TOOLTIP PARA EL NOMBRE DEL MUNICIPIO AL PASAR EL MOUSE ---
    // Asumiendo que 'nom_mun' es la propiedad que contiene el nombre del municipio
    if (feature.properties && feature.properties.nom_mun) {
        if (layer && typeof layer.bindTooltip === 'function') {
            layer.bindTooltip(feature.properties.nom_mun, {
                permanent: false, // El tooltip no es permanente, aparece al pasar el mouse
                direction: 'center',
                className: 'my-tooltip-style' // Clase CSS opcional para estilizar el tooltip
            });
        }
    }


    // --- Evento Click ---
    // Verifica si 'layer' es un objeto válido y puede manejar eventos
    if (layer && typeof layer.on === 'function') {
        layer.on('click', async function (e) {
            L.DomEvent.stopPropagation(e);
            await displayInformation(feature.properties);
            const {color, fill} = await getLayerStyle(feature.properties.mun_name);

            // *** ¡CORRECCIÓN AQUÍ! DEBE SER 'layer.setStyle' NO 'L.layer.setStyle' ***
            if (layer && typeof layer.setStyle === 'function') {
                layer.setStyle({
                    fillColor: fill.toString(),
                    color: color.toString(),
                    weight: 5,
                    opacity: 1,
                    fillOpacity: 0.7
                });
            } else {
                console.error("Error: 'layer' es undefined o no tiene el método 'setStyle' al hacer clic.");
            }

            // También verifica geojsonLayer antes de usarlo
            // if (geojsonLayer && typeof geojsonLayer.resetStyle === 'function' && layer) {
            //     setTimeout(function() {
            //         geojsonLayer.resetStyle(layer);
            //     }, 2000);
            // } else {
            //     console.warn("geojsonLayer o layer no están disponibles para resetear el estilo.");
            // }
        });

        // --- Eventos Mouseover/Mouseout para resaltado (estos SÍ van aquí) ---
        layer.on('mouseover', function(e) {
            // Estilo de resaltado al pasar el mouse
        });

        layer.on('mouseout', function(e) {
        });
    } else {
        console.error("Error: La capa para este feature no es un objeto válido de Leaflet y no se pueden adjuntar eventos:", feature.properties);
    }
}

// Estilo por defecto para las áreas de Chiapas
var defaultStyle = {
    fillColor: '#FDA5D5',
    color: '#000000',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.3
};

// --- Tu código de inicialización del mapa y carga del GeoJSON ---

// Inicializa el mapa (asegúrate de que esto suceda antes de cargar el GeoJSON)
map = L.map('map').setView([16.5, -92.5], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Carga el GeoJSON de forma asíncrona
fetch('chiapas.geojson') // Asegúrate de que esta ruta sea correcta y el archivo se llame chiapas.geojson
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar chiapas.geojson: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        geojsonLayer = L.geoJSON(data, { // Asigna a la variable geojsonLayer declarada arriba
            style: defaultStyle,
            onEachFeature: onEachFeature
        }).addTo(map);

        if (geojsonLayer.getBounds().isValid()) {
            map.fitBounds(geojsonLayer.getBounds());
        } else {
            console.warn("Los límites del GeoJSON no son válidos o están vacíos. No se pudo ajustar el mapa.");
            // Opcional: centra el mapa en una ubicación predeterminada si el GeoJSON está vacío
            // map.setView([16.5, -92.5], 8);
        }
    })
    .catch(error => console.error('Error durante la carga o procesamiento del GeoJSON:', error));