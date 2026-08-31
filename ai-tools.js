(function () {
  "use strict";

  const data = window.GOGO_AI_TOOLS_DATA;
  const elements = {
    search: document.getElementById("tool-search"),
    clearSearch: document.getElementById("clear-search"),
    categoryFilters: document.getElementById("category-filters"),
    regionFilters: document.getElementById("region-filters"),
    resetFilters: document.getElementById("reset-filters"),
    resultsTitle: document.getElementById("results-title"),
    resultCount: document.getElementById("result-count"),
    grid: document.getElementById("tool-grid"),
    empty: document.getElementById("empty-state"),
    headerCompare: document.getElementById("header-compare"),
    headerCompareCount: document.getElementById("header-compare-count"),
    sectionCompare: document.getElementById("section-compare"),
    comparisonHint: document.getElementById("comparison-hint"),
    tray: document.getElementById("compare-tray"),
    selectedTools: document.getElementById("selected-tools"),
    clearComparison: document.getElementById("clear-comparison"),
    openComparison: document.getElementById("open-comparison"),
    trayCount: document.getElementById("tray-count"),
    toolDialog: document.getElementById("tool-dialog"),
    toolDialogContent: document.getElementById("tool-dialog-content"),
    compareDialog: document.getElementById("compare-dialog"),
    comparisonTableWrap: document.getElementById("comparison-table-wrap"),
    toast: document.getElementById("toast")
  };

  const required = [
    "search", "categoryFilters", "regionFilters", "grid", "toolDialog",
    "compareDialog", "comparisonTableWrap"
  ];

  if (!data || !Array.isArray(data.tools) || required.some(function (key) { return !elements[key]; })) {
    if (elements.grid) elements.grid.textContent = "工具目录暂时无法读取，请刷新页面后重试。";
    return;
  }

  const categoryIds = new Set(data.categories.map(function (item) { return item.id; }));
  const regionIds = new Set(data.regions.map(function (item) { return item.id; }));
  const urlState = new URL(window.location.href);
  const initialCategory = urlState.searchParams.get("category");
  const initialRegion = urlState.searchParams.get("region");
  const initialQuery = urlState.searchParams.get("q") || "";

  const state = {
    category: categoryIds.has(initialCategory) ? initialCategory : "all",
    region: regionIds.has(initialRegion) ? initialRegion : "all",
    query: initialQuery.trim(),
    comparison: new Set(),
    openToolId: null
  };

  let toastTimer = null;

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (typeof text === "string") element.textContent = text;
    return element;
  }

  function categoryLabel(id) {
    const item = data.categories.find(function (category) { return category.id === id; });
    return item ? item.label : "全部";
  }

  function regionLabel(id) {
    const item = data.regions.find(function (region) { return region.id === id; });
    return item ? item.label.replace("入口", "") : "";
  }

  function toolById(id) {
    return data.tools.find(function (tool) { return tool.id === id; });
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    toastTimer = window.setTimeout(function () {
      elements.toast.hidden = true;
    }, 2400);
  }

  function syncUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("route");
    if (state.category === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", state.category);
    if (state.region === "all") url.searchParams.delete("region");
    else url.searchParams.set("region", state.region);
    if (state.query) url.searchParams.set("q", state.query);
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
  }

  function renderFilterButtons(items, container, activeId, dataKey) {
    container.replaceChildren();
    items.forEach(function (item) {
      const button = makeElement("button", "filter-chip", item.label);
      button.type = "button";
      button.dataset[dataKey] = item.id;
      button.setAttribute("aria-pressed", String(item.id === activeId));
      container.appendChild(button);
    });
  }

  function searchText(tool) {
    return [
      tool.name,
      tool.type,
      tool.summary,
      tool.tags.join(" "),
      tool.platforms.join(" "),
      tool.bestFor.join(" "),
      tool.categories.map(categoryLabel).join(" ")
    ].join(" ").toLocaleLowerCase("zh-CN");
  }

  function filteredTools() {
    const query = state.query.toLocaleLowerCase("zh-CN");
    const matches = data.tools.filter(function (tool) {
      const categoryMatch = state.category === "all" || tool.categories.includes(state.category);
      const regionMatch = state.region === "all" || tool.region === state.region;
      const queryMatch = !query || searchText(tool).includes(query);
      return categoryMatch && regionMatch && queryMatch;
    });
    if (state.category === "all") return matches;
    return matches.sort(function (a, b) {
      const aPrimary = a.primaryCategory === state.category ? 1 : 0;
      const bPrimary = b.primaryCategory === state.category ? 1 : 0;
      return bPrimary - aPrimary || data.tools.indexOf(a) - data.tools.indexOf(b);
    });
  }

  function createToolCard(tool) {
    const card = makeElement("article", "tool-card");
    card.dataset.toolId = tool.id;

    const head = makeElement("div", "tool-card-head");
    const mark = makeElement("span", "tool-mark", tool.mark);
    mark.style.setProperty("--tool-accent", tool.accent);
    mark.setAttribute("aria-hidden", "true");

    const identity = makeElement("div", "tool-identity");
    const name = makeElement("h3", "", tool.name);
    const region = makeElement(
      "span",
      "region-badge " + tool.region,
      tool.type + " · " + regionLabel(tool.region)
    );
    identity.append(name, region);

    const compare = makeElement(
      "button",
      "compare-toggle",
      state.comparison.has(tool.id) ? "已加入" : "+ 对比"
    );
    compare.type = "button";
    compare.dataset.compareTool = tool.id;
    compare.setAttribute("aria-pressed", String(state.comparison.has(tool.id)));
    compare.setAttribute("aria-label", (state.comparison.has(tool.id) ? "移出对比：" : "加入对比：") + tool.name);
    head.append(mark, identity, compare);

    const summary = makeElement("p", "tool-summary", tool.summary);
    const tagList = makeElement("div", "tool-tags");
    tool.tags.slice(0, 3).forEach(function (tag) {
      tagList.appendChild(makeElement("span", "", tag));
    });

    const actions = makeElement("div", "tool-actions");
    const detailButton = makeElement("button", "detail-button", "查看");
    detailButton.type = "button";
    detailButton.dataset.details = tool.id;
    detailButton.setAttribute("aria-label", "查看 " + tool.name + " 详情");

    const officialLink = makeElement("a", "official-link", "打开 ↗");
    officialLink.href = tool.url;
    officialLink.target = "_blank";
    officialLink.rel = "noopener noreferrer";
    officialLink.setAttribute("aria-label", "打开 " + tool.name + " 官方网站（新窗口）");
    actions.append(detailButton, officialLink);

    card.append(head, summary, tagList, actions);
    return card;
  }

  function renderTools() {
    const tools = filteredTools();
    elements.grid.replaceChildren();
    tools.forEach(function (tool) {
      elements.grid.appendChild(createToolCard(tool));
    });

    elements.empty.hidden = tools.length > 0;
    elements.grid.hidden = tools.length === 0;
    elements.resultCount.textContent = tools.length + " 个";

    if (state.query) elements.resultsTitle.textContent = "搜索结果";
    else elements.resultsTitle.textContent = state.category === "all" ? "全部工具" : categoryLabel(state.category);

    const hasFilters = Boolean(state.query) || state.category !== "all" || state.region !== "all";
    elements.resetFilters.hidden = !hasFilters;
    elements.clearSearch.hidden = !state.query;
  }

  function refreshCompareButtons() {
    document.querySelectorAll("[data-compare-tool]").forEach(function (button) {
      const id = button.dataset.compareTool;
      const selected = state.comparison.has(id);
      const tool = toolById(id);
      button.setAttribute("aria-pressed", String(selected));
      button.textContent = selected ? "已加入" : "+ 对比";
      if (tool) button.setAttribute("aria-label", (selected ? "移出对比：" : "加入对比：") + tool.name);
    });
  }

  function renderComparisonSelection() {
    const ids = Array.from(state.comparison);
    const count = ids.length;
    const canCompare = count >= 2;

    elements.tray.hidden = count === 0;
    elements.headerCompare.disabled = !canCompare;
    elements.sectionCompare.disabled = !canCompare;
    elements.openComparison.disabled = !canCompare;
    elements.headerCompareCount.textContent = String(count);
    elements.trayCount.textContent = String(count);
    elements.comparisonHint.textContent = count === 0
      ? "从工具卡片中加入 2–4 个工具，即可横向查看能力。"
      : count === 1
        ? "再选 1 个工具即可开始对比。"
        : "已选择 " + count + " 个工具，可以开始横向对比。";

    elements.selectedTools.replaceChildren();
    ids.forEach(function (id) {
      const tool = toolById(id);
      if (!tool) return;
      const chip = makeElement("span", "selected-chip");
      chip.appendChild(makeElement("span", "", tool.name));
      const remove = makeElement("button", "", "×");
      remove.type = "button";
      remove.dataset.removeComparison = id;
      remove.setAttribute("aria-label", "移出对比：" + tool.name);
      chip.appendChild(remove);
      elements.selectedTools.appendChild(chip);
    });

    refreshCompareButtons();
  }

  function toggleComparison(toolId) {
    if (state.comparison.has(toolId)) {
      state.comparison.delete(toolId);
    } else if (state.comparison.size >= 4) {
      showToast("最多同时对比 4 个工具");
      return;
    } else {
      state.comparison.add(toolId);
    }
    renderComparisonSelection();
  }

  function createInfoBlock(title, content, isList) {
    const block = makeElement("section", "tool-info-block");
    block.appendChild(makeElement("h3", "", title));
    if (isList) {
      const list = makeElement("ul");
      content.forEach(function (item) {
        list.appendChild(makeElement("li", "", item));
      });
      block.appendChild(list);
    } else {
      block.appendChild(makeElement("p", "", content));
    }
    return block;
  }

  function renderToolDialog(tool) {
    state.openToolId = tool.id;
    elements.toolDialogContent.replaceChildren();

    const hero = makeElement("div", "tool-dialog-hero");
    const mark = makeElement("span", "tool-mark tool-mark-large", tool.mark);
    mark.style.setProperty("--tool-accent", tool.accent);
    mark.setAttribute("aria-hidden", "true");
    const heading = makeElement("div");
    const meta = makeElement("p", "dialog-meta", tool.type + " · " + regionLabel(tool.region) + "入口");
    const title = makeElement("h2", "", tool.name);
    title.id = "tool-dialog-title";
    heading.append(meta, title, makeElement("p", "dialog-summary", tool.summary));
    hero.append(mark, heading);

    const grid = makeElement("div", "tool-dialog-grid");
    grid.append(
      createInfoBlock("适合做", tool.bestFor, true),
      createInfoBlock("特点", tool.strength, false),
      createInfoBlock("留意", tool.note, false)
    );

    const context = makeElement("div", "tool-context");
    const platforms = makeElement("div", "platform-list");
    platforms.appendChild(makeElement("strong", "", "可用入口"));
    tool.platforms.forEach(function (platform) {
      platforms.appendChild(makeElement("span", "", platform));
    });
    const verified = makeElement("p", "verified-note", "目录信息核验于 " + data.verifiedAt);
    context.append(platforms, verified);

    const actions = makeElement("div", "dialog-actions");
    const compareButton = makeElement(
      "button",
      "secondary-button",
      state.comparison.has(tool.id) ? "已加入对比" : "+ 加入对比"
    );
    compareButton.type = "button";
    compareButton.dataset.compareTool = tool.id;
    compareButton.setAttribute("aria-pressed", String(state.comparison.has(tool.id)));

    const official = makeElement("a", "primary-button", "打开官方网站 ↗");
    official.href = tool.url;
    official.target = "_blank";
    official.rel = "noopener noreferrer";
    actions.append(compareButton, official);

    elements.toolDialogContent.append(hero, grid, context, actions);
  }

  function openToolDialog(toolId) {
    const tool = toolById(toolId);
    if (!tool) return;
    renderToolDialog(tool);
    elements.toolDialog.showModal();
  }

  function capabilityClass(value) {
    if (value === "核心") return "capability-strong";
    if (value === "支持" || value === "识图") return "capability-supported";
    if (value === "有限") return "capability-limited";
    return "capability-none";
  }

  function renderComparisonTable() {
    const tools = Array.from(state.comparison).map(toolById).filter(Boolean);
    const table = makeElement("table", "comparison-table");
    const caption = makeElement("caption", "sr-only", "已选 AI 工具能力对比");
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    headRow.appendChild(makeElement("th", "", "能力"));

    tools.forEach(function (tool) {
      const cell = document.createElement("th");
      cell.scope = "col";
      const name = makeElement("span", "compare-tool-name", tool.name);
      const platforms = makeElement("small", "compare-platforms", tool.platforms.join(" / "));
      const link = makeElement("a", "", "打开 ↗");
      link.href = tool.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      cell.append(name, platforms, link);
      headRow.appendChild(cell);
    });
    head.appendChild(headRow);

    const body = document.createElement("tbody");
    data.comparisonRows.forEach(function (row) {
      const tr = document.createElement("tr");
      const label = makeElement("th", "", row.label);
      label.scope = "row";
      tr.appendChild(label);
      tools.forEach(function (tool) {
        const value = tool.capabilities[row.key] || "—";
        const td = document.createElement("td");
        td.appendChild(makeElement("span", capabilityClass(value), value));
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });

    table.append(caption, head, body);
    elements.comparisonTableWrap.replaceChildren(table);
  }

  function openComparisonDialog() {
    if (state.comparison.size < 2) return;
    renderComparisonTable();
    elements.compareDialog.showModal();
  }

  function resetFilters() {
    state.category = "all";
    state.region = "all";
    state.query = "";
    elements.search.value = "";
    renderFilterButtons(data.categories, elements.categoryFilters, state.category, "category");
    renderFilterButtons(data.regions, elements.regionFilters, state.region, "region");
    renderTools();
    syncUrl();
  }

  elements.categoryFilters.addEventListener("click", function (event) {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    renderFilterButtons(data.categories, elements.categoryFilters, state.category, "category");
    renderTools();
    syncUrl();
  });

  elements.regionFilters.addEventListener("click", function (event) {
    const button = event.target.closest("[data-region]");
    if (!button) return;
    state.region = button.dataset.region;
    renderFilterButtons(data.regions, elements.regionFilters, state.region, "region");
    renderTools();
    syncUrl();
  });

  elements.search.addEventListener("input", function () {
    state.query = elements.search.value.trim();
    renderTools();
    syncUrl();
  });

  elements.clearSearch.addEventListener("click", function () {
    state.query = "";
    elements.search.value = "";
    elements.search.focus();
    renderTools();
    syncUrl();
  });

  elements.resetFilters.addEventListener("click", resetFilters);
  elements.empty.addEventListener("click", function (event) {
    if (event.target.closest("[data-reset-all]")) resetFilters();
  });

  elements.grid.addEventListener("click", function (event) {
    const details = event.target.closest("[data-details]");
    if (details) {
      openToolDialog(details.dataset.details);
      return;
    }
    const compare = event.target.closest("[data-compare-tool]");
    if (compare) toggleComparison(compare.dataset.compareTool);
  });

  elements.toolDialog.addEventListener("click", function (event) {
    if (event.target === elements.toolDialog || event.target.closest("[data-close-dialog]")) {
      elements.toolDialog.close();
      return;
    }
    const compare = event.target.closest("[data-compare-tool]");
    if (compare) {
      toggleComparison(compare.dataset.compareTool);
      const tool = toolById(compare.dataset.compareTool);
      if (tool) renderToolDialog(tool);
    }
  });

  elements.compareDialog.addEventListener("click", function (event) {
    if (event.target === elements.compareDialog || event.target.closest("[data-close-comparison]")) {
      elements.compareDialog.close();
    }
  });

  elements.selectedTools.addEventListener("click", function (event) {
    const remove = event.target.closest("[data-remove-comparison]");
    if (remove) toggleComparison(remove.dataset.removeComparison);
  });

  elements.clearComparison.addEventListener("click", function () {
    state.comparison.clear();
    renderComparisonSelection();
  });
  elements.openComparison.addEventListener("click", openComparisonDialog);
  elements.headerCompare.addEventListener("click", openComparisonDialog);
  elements.sectionCompare.addEventListener("click", openComparisonDialog);

  renderFilterButtons(data.categories, elements.categoryFilters, state.category, "category");
  renderFilterButtons(data.regions, elements.regionFilters, state.region, "region");
  elements.search.value = state.query;
  renderTools();
  renderComparisonSelection();
  syncUrl();
})();
