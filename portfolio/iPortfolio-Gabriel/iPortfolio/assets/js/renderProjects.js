const PROJECTS_PER_PAGE = 9;
let currentPage = 1;
let currentFilter = "*";
let allProjects = [];

const container = document.querySelector(".isotope-container");
const filters = document.querySelectorAll(".portfolio-filters li");
const paginationContainer = document.createElement("div");
paginationContainer.classList.add("pagination-container");
container.after(paginationContainer);

// Fetch JSON
fetch("assets/data/featuredProjects.json")
  .then((res) => res.json())
  .then((projects) => {
    allProjects = projects;
    renderProjects();
    renderPagination();
    setupFilters();
  });

// Extrai categoria do link
function getCategoria(link) {
  try {
    const path = new URL(link).pathname;
    const partes = path.split("/").filter(Boolean);
    let cat = partes[1] || "Outro";
    // Padroniza: primeira letra maiúscula, resto minúsculo (igual ao filtro do menu)
    cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    return cat;
  } catch {
    return "Outro";
  }
}

function renderProjects() {
  let filtered = allProjects;

  if (currentFilter !== "*") {
    filtered = allProjects.filter((proj) => {
      const cat = getCategoria(proj.link);
      return cat === currentFilter;
    });
  }

  const start = (currentPage - 1) * PROJECTS_PER_PAGE;
  const end = start + PROJECTS_PER_PAGE;
  const paginated = filtered.slice(start, end);

  let html = "";

  paginated.forEach((project) => {
    const categoria = getCategoria(project.link);

    html += `
  <div class="col-lg-4 col-md-6 portfolio-item isotope-item ${categoria}">
    <div class="portfolio-content h-100">
      <img src="assets/img${project.image}" class="img-fluid" alt="${project.title}" />
      <div class="portfolio-info-overlay">
        <h4>${project.title}</h4>
        <div class="portfolio-actions">
          <a href="#contact" title="Entrar em contato" class="contact-link">
            <i class="bi bi-envelope"></i>
          </a>
          <a href="${project.link}" title="Mais Detalhes" class="details-link" target="_blank">
            <i class="bi bi-link-45deg"></i>
          </a>
        </div>
        <p>${project.description}</p>
      </div>
    </div>
  </div>`;
  });

  container.innerHTML = html;

  // Força o Isotope a relayout após renderização e imagens carregadas
  if (window.Isotope && window.imagesLoaded) {
    if (!container.isotopeInstance) {
      container.isotopeInstance = new Isotope(container, {
        itemSelector: ".portfolio-item",
        layoutMode: "fitRows",
      });
    } else {
      container.isotopeInstance.reloadItems();
    }
    imagesLoaded(container, function () {
      container.isotopeInstance.arrange();
    });
  }
}

function renderPagination() {
  const totalFiltered =
    currentFilter === "*"
      ? allProjects.length
      : allProjects.filter(
          (p) =>
            getCategoria(p.link).toLowerCase() === currentFilter.toLowerCase()
        ).length;

  const totalPages = Math.ceil(totalFiltered / PROJECTS_PER_PAGE);

  let pagHtml =
    '<div class="pagination d-flex gap-2 justify-content-center mt-4 flex-wrap">';
  for (let i = 1; i <= totalPages; i++) {
    pagHtml += `<button class="page-btn ${
      i === currentPage ? "active" : ""
    }" data-page="${i}">${i}</button>`;
  }
  pagHtml += "</div>";

  paginationContainer.innerHTML = pagHtml;

  document.querySelectorAll(".page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = Number(btn.dataset.page);
      renderProjects();
      renderPagination();
    });
  });
}

function setupFilters() {
  // Filtros principais
  filters.forEach((f) => {
    f.addEventListener("click", () => {
      filters.forEach((el) => el.classList.remove("filter-active"));
      f.classList.add("filter-active");

      const rawFilter = f.dataset.filter;
      currentFilter = rawFilter === "*" ? "*" : rawFilter.replace(".", "");
      currentPage = 1;
      renderProjects();
      renderPagination();
    });
  });

  // Filtros do dropdown
  document.querySelectorAll(".dropdown-categoria ul li").forEach((item) => {
    item.addEventListener("click", () => {
      const rawFilter = item.dataset.filter;
      currentFilter = rawFilter.replace(".", "");
      currentPage = 1;
      renderProjects();
      renderPagination();

      // Remove 'active' dos filtros principais
      filters.forEach((el) => el.classList.remove("filter-active"));
    });
  });
}
