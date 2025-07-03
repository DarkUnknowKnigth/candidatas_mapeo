# Información de la Estructura de Datos y Gestión de Imágenes

Este documento detalla la estructura de los objetos JSON que utilizamos para la información de ayuntamientos y presidentes municipales, y explica cómo manejar las imágenes asociadas.

---

## Estructura del Objeto

Cada objeto en el array de *candidatas.json* sigue esta plantilla:

```json
{
  "id": 1,
  "municipio": "acala", //municipio
  "nombre": "María Patricia Coello Zapata", //nombre completo
  "partido": "Morena", //partido politico
  "logo": "img/partidos/morena.png", //logo disponible en img/partidos/
  "foto": "img/presidenta.jpg", //foto de la pesona
  "fill": "#4A1B1B", //color del partido 1
  "color": "#FFFFFF" //color de relleno del partido
}
```

### Campos del Objeto:

* **`id`**: Un número único para identificar cada registro.
* **`municipio`**: El nombre del municipio, siempre en **minúsculas**.
* **`nombre`**: El nombre completo de la o el Presidente Municipal.
* **`partido`**: El nombre del partido político al que pertenece.
* **`logo`**: La ruta relativa al archivo de imagen del logo del partido (ej., `"img/partidos/morena.png"`).
* **`foto`**: La ruta relativa a la fotografía de la o el Presidente Municipal (ej., `"img/presidenta.jpg"`).
* **`fill`**: Un código de color hexadecimal (ej., `"#4A1B1B"`) para elementos gráficos, como el color de fondo.
* **`color`**: Un código de color hexadecimal (ej., `"#FFFFFF"`) para el texto que se superpone al color de `fill`.

---

## Gestión de Imágenes

Para garantizar el correcto funcionamiento de la aplicación, todas las **imágenes de perfil** de las presidentas o presidentes municipales deben subirse a la carpeta **`img/profile`**. Es crucial que las rutas en el campo `"foto"` dentro del JSON apunten a esta ubicación.

**Ejemplo de cómo debería verse la ruta de una imagen de perfil:**

```
img/profile/maria_patricia_coello_zapata.jpg
```

Asegúrate de seguir estas directrices para que la información se muestre correctamente.
## Gestion de municipios
Para agregar o quitar municipios es necesario modificar el GEOJSON chiapas.geojson el cual contiene las cordenadas para dibujar los limites territoriales en el mapa se recomienda no modificar el archivo.