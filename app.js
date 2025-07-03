var map;
var geojsonLayer;
async function displayInformation(featureMap){
    const candidatasResp = await fetch('candidatas.json');
    const candidatas = await candidatasResp.json();
    const candidata = candidatas.find(c => c.municipio.toString().toLowerCase() == featureMap.mun_name.toString().toLowerCase());
    const informationDiv = document.querySelector('#information'); 
    if (candidata) {
        informationDiv.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl border border-gray-100 flex flex-col items-center text-center animate-fade-in">
                <img src="${candidata.foto}" alt="Foto de ${candidata.nombre}" class="w-40 h-40 rounded-full object-cover mb-4 border-4 border-pink-400 shadow-md">
                <h4 class="text-2xl font-extrabold text-gray-800 mb-2">${candidata.nombre}</h4>
                <p class="text-lg text-gray-600 mb-4">Candidata por: <span class="font-bold">${featureMap.mun_name}</span></p>
                <p class="text-xl text-pink-600 font-semibold mb-2 flex flex-row gap-5 justify-around items-center w-full py-2 px-3 rounded-lg" style="color:${candidata.color};background-color:${candidata.fill}">
                    <img class="rounded-full border border-gray-900" src="${candidata.logo}" width="50px">    
                    <span>${candidata.partido}</span>
                </p>
            </div>
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

async function getLayerStyle(municipio){
    let color = "#FFFFFF";
    let fill = "#FDA5D5";
    const candidatasResp = await fetch('candidatas.json');
    const candidatas = await candidatasResp.json();
    const candidata = candidatas.find(c => c.municipio.toString().toLowerCase() == municipio.toString().toLowerCase());
    if (candidata) {
        color = candidata.color;
        fill = candidata.fill;
    }
    return {color,fill};
}
async function getCandidata(municipio){
    let candidata = null;
    const candidatasResp = await fetch('candidatas.json');
    const candidatas = await candidatasResp.json();
    const candidataFounded = candidatas.find(c => c.municipio.toString().toLowerCase() == municipio.toString().toLowerCase());
    if(candidataFounded){
        candidata = candidataFounded;
    }
    return candidata;
}


async function onEachFeature(feature, layer) {

    // Configuración del Popup
    if (feature.properties) {
        const candidata = await getCandidata(feature.properties.mun_name);
        let popupContent =  `<h3>${feature.properties.mun_name}</h3>`
        if (candidata) {
            
            popupContent = `
                <div class="text-center flex flex-col">
                    <h3 class="font-bold flex flex-row px-4 gap-2 justify-between items-center text-pink-600"><img src="${candidata.logo}" width="50px" class="border border-gray-900 rounded-lg"> ${candidata.nombre}</h3>
                    <p>Candidata por el partido <b>${candidata.partido}</b> del municipio <b>${feature.properties.mun_name}</b></p>
                </div>
            `;
        }
        if (layer && typeof layer.bindPopup === 'function') {
            layer.bindPopup(popupContent);
        }
    }

    if (feature.properties && feature.properties.nom_mun) {
        if (layer && typeof layer.bindTooltip === 'function') {
            layer.bindTooltip(feature.properties.nom_mun, {
                permanent: false, 
                direction: 'center',
                className: 'tooltip' 
            });
        }
    }

    if (layer && typeof layer.on === 'function') {
        layer.on('click', async function (e) {
            L.DomEvent.stopPropagation(e);
            await displayInformation(feature.properties);
            const {color, fill} = await getLayerStyle(feature.properties.mun_name);
            if (layer && typeof layer.setStyle === 'function') {
                layer.setStyle({
                    fillColor: fill.toString(),
                    color: color.toString(),
                    weight: 0.5,
                    opacity: 0.9,
                    fillOpacity: 0.7
                });
            } else {
                console.error("Error: 'layer' es undefined o no tiene el método 'setStyle' al hacer clic.");
            }
        });
        layer.on('mouseover', async function(e) {
            L.DomEvent.stopPropagation(e);
            const {color, fill} = await getLayerStyle(feature.properties.mun_name);
            if (layer && typeof layer.setStyle === 'function') {
                layer.setStyle({
                    fillColor: fill.toString(),
                    color: color.toString(),
                    weight: 0.5,
                    opacity: 0.9,
                    fillOpacity: 0.7
                });
            } 
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
    color: '#F00000',
    weight: 0.5,
    opacity: 0.9,
    fillOpacity: 0.3
};
map = L.map('map').setView([16.5, -92.5], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-<a href="https://darkunknowknigth.github.io/">ParachicoSoftware</a>'
}).addTo(map);
const _ = "REBueU00c3Qzci4";
fetch('app.json').then(r => r.json()).then( d => {
    console.log(d);
    const _L = btoa(d.licence.secret) == _;
    console.log(_L);
    if(true){
        fetch('chiapas.geojson')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar chiapas.geojson: ' + response.statusText);
                }
                return response.json();
            })
            .then(async data => {
                const candidatasResp = await fetch('candidatas.json');
                let candidatas = await candidatasResp.json();
                candidatas = candidatas.map(c => c.municipio.toString().toLowerCase()); 
                data.features = data.features.filter(d => candidatas.includes(d.properties.mun_name.toString().toLowerCase())); 
                geojsonLayer = L.geoJSON(data, { 
                    style: defaultStyle,
                    onEachFeature: onEachFeature
                }).addTo(map);
        
                if (geojsonLayer.getBounds().isValid()) {
                    map.fitBounds(geojsonLayer.getBounds());
                } else {
                    console.warn("Los límites del GeoJSON no son válidos o están vacíos. No se pudo ajustar el mapa.");
                    map.setView([16.5, -92.5], 8);
                }
            })
            .catch(error => console.error('Error durante la carga o procesamiento del GeoJSON:', error));
    }
})