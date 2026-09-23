"use strict";

(() => {
  const menu = document.querySelector("#workspaceMenu");
  const search = document.querySelector("#workspaceMenuSearch");
  const status = document.querySelector("#workspaceMenuSearchStatus");
  if (!menu || !search || !status) return;

  const sections = [...menu.querySelectorAll(".workspace-menu-section")];
  const navLinks = [...menu.querySelectorAll(".workspace-menu-nav a")];
  const entries = [];
  let activeSection = sections[0] || null;
  const normalize = (text) => String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  for (const section of sections) {
    const header = section.querySelector(":scope > header");
    const cards = section.querySelector(":scope > .workspace-menu-cards");
    if (!header || !cards?.id) continue;

    const category = header.querySelector(":scope > span");
    const heading = header.querySelector(":scope > h3");
    const description = header.querySelector(":scope > p");
    if (!category || !heading) continue;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "workspace-section-toggle";
    button.setAttribute("aria-controls", cards.id);
    button.setAttribute("aria-expanded", "false");

    const icon = document.createElement("span");
    icon.className = "workspace-section-icon";
    const sourceIcon = category.querySelector("i");
    if (sourceIcon) icon.append(sourceIcon.cloneNode(true));

    const copy = document.createElement("span");
    copy.className = "workspace-section-copy";
    const overline = document.createElement("small");
    overline.textContent = category.textContent.trim();
    const title = document.createElement("strong");
    title.id = heading.id;
    title.textContent = heading.textContent.trim();
    const detail = document.createElement("span");
    detail.textContent = description?.textContent.trim() || "";
    copy.append(overline, title, detail);

    const end = document.createElement("span");
    end.className = "workspace-section-end";
    const count = document.createElement("small");
    const total = cards.querySelectorAll(".workspace-choice").length;
    count.textContent = `${total} ${total === 1 ? "herramienta" : "herramientas"}`;
    const chevron = document.createElement("i");
    chevron.className = "fa-solid fa-chevron-down";
    chevron.setAttribute("aria-hidden", "true");
    end.append(count, chevron);

    button.append(icon, copy, end);
    header.replaceChildren(button);
    entries.push({ section, cards, button, title: normalize(`${overline.textContent} ${title.textContent}`) });
    button.addEventListener("click", () => {
      const opening = button.getAttribute("aria-expanded") !== "true";
      if (!search.value.trim()) activeSection = opening ? section : null;
      entries.forEach((entry) => setOpen(entry, opening && entry.section === section));
      updateNav();
    });
  }

  function setOpen(entry, open) {
    entry.cards.hidden = !open;
    entry.section.classList.toggle("is-open", open);
    entry.button.setAttribute("aria-expanded", String(open));
  }

  function updateNav() {
    for (const link of navLinks) {
      const id = link.getAttribute("href")?.slice(1);
      const entry = entries.find((item) => item.button.querySelector(`#${id}`));
      link.classList.toggle("is-active", Boolean(entry && !entry.cards.hidden));
    }
  }

  function filterMenu() {
    const query = normalize(search.value);
    if (!query) {
      for (const entry of entries) {
        entry.section.hidden = false;
        entry.cards.querySelectorAll(".workspace-choice").forEach((card) => { card.hidden = false; });
        setOpen(entry, entry.section === activeSection);
      }
      status.textContent = "Selecciona un área o busca una herramienta.";
      updateNav();
      return;
    }

    let visible = 0;
    for (const entry of entries) {
      let matches = 0;
      for (const card of entry.cards.querySelectorAll(".workspace-choice")) {
        const match = entry.title.includes(query) || normalize(card.textContent).includes(query);
        card.hidden = !match;
        if (match) matches += 1;
      }
      entry.section.hidden = matches === 0;
      setOpen(entry, matches > 0);
      visible += matches;
    }
    status.textContent = visible ? `${visible} ${visible === 1 ? "herramienta encontrada" : "herramientas encontradas"}.` : "No hay herramientas con ese nombre.";
    updateNav();
  }

  for (const link of navLinks) {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href")?.slice(1);
      const entry = entries.find((item) => item.button.querySelector(`#${id}`));
      if (!entry) return;
      event.preventDefault();
      search.value = "";
      activeSection = entry.section;
      filterMenu();
      entry.section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  }

  search.addEventListener("input", filterMenu);
  filterMenu();
})();
