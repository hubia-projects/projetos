const fs = require("fs");
const path = require("path");

const basePath = "./"; // raiz do teu projeto local
const baseUrl = "https://gabriellshi.github.io/projects-site-developement-web";

const categorias = fs.readdirSync(basePath).filter(p => fs.lstatSync(path.join(basePath, p)).isDirectory());

let id = 1;
const projetos = [];

categorias.forEach((categoria) => {
  const projetosNaCategoria = fs
    .readdirSync(path.join(basePath, categoria))
    .filter((p) => fs.lstatSync(path.join(basePath, categoria, p)).isDirectory());

  projetosNaCategoria.forEach((projeto) => {
    projetos.push({
      id: id++,
      title: projeto.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      image: `${baseUrl}/${categoria}/${projeto}/screenshot.png`,
      favorite: false,
      link: `${baseUrl}/${categoria}/${projeto}/`,
      description: `Template para ${categoria} com design moderno e responsivo.`,
      date: new Date().toISOString().slice(0, 10)
    });
  });
});

fs.writeFileSync("featuredProjects.json", JSON.stringify(projetos, null, 2), "utf-8");
console.log("✅ featuredProjects.json gerado com sucesso!");
