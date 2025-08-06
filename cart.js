// Lista de perfumes - ejemplo (podés personalizar)
const perfumes = [
  {
    nombre: "Amber Oud Gold",
    imagen: "images/Amber oud gold.jpeg",
    precio: 38000,
    descripcion: "Al Haramain, 120ml."
  },
  {
    nombre: "Armaf Odyssey Mandarin Sky",
    imagen: "images/Mandarin sky.jpeg",
    precio: 32500,
    descripcion: "Armaf, 100ml."
  },
  {
    nombre: "Valentino Donna Born In Roma",
    imagen: "images/valentino donna.jpeg",
    precio: 79000,
    descripcion: "Valentino, 100ml."
  },
  // ...agregá más productos según tu stock
];

const catalogoDiv = document.getElementById("catalogo");

perfumes.forEach((perfume, idx) => {
  const card = document.createElement("div");
  card.className = "perfume-card";
  card.innerHTML = `
    <img class="perfume-img" src="${perfume.imagen}" alt="${perfume.nombre}">
    <h3>${perfume.nombre}</h3>
    <p>${perfume.descripcion}</p>
    <div style="font-weight:600; font-size:1.2rem;">$${perfume.precio.toLocaleString()}</div>
    <button class="btn-agregar" onclick="window.location='pedido.html?prod=${encodeURIComponent(perfume.nombre)}'">Pedir</button>
  `;
  catalogoDiv.appendChild(card);
});
