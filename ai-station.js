(function () {
  "use strict";

  const toolsData = window.GOGO_AI_TOOLS_DATA;
  const stationData = window.GOGO_AI_STATION_DATA;
  const snapshot = window.GOGO_AIHOT_SNAPSHOT;
  const validViews = new Set(["home", "tools", "hot", "flows", "glossary"]);
  const groupOrder = ["入门概念", "Agent 与连接", "构建与版本", "可靠性"];

  if (!toolsData || !stationData || !snapshot) return;

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (typeof text === "string") element.textContent = text;
    return element;
  }

  function safeHttps(value) {
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "https:" ? url.href : null;
    } catch (_) {
      return null;
    }
  }

  function viewUrl(view, extra) {
    const url = new URL(window.location.href);
    url.search = "";
    if (view !== "home") url.searchParams.set("view", view);
    Object.entries(extra || {}).forEach(function (entry) {
      if (entry[1]) url.searchParams.set(entry[0], entry[1]);
    });
    return url.pathname + url.search;
  }

  const url = new URL(window.location.href);
  const legacyRoute = url.searchParams.get("route");
  const legacyCategories = new Set(toolsData.categories.map(function (item) { return item.id; }));
  if (legacyRoute && legacyCategories.has(legacyRoute)) {
    url.searchParams.set("view", "tools");
    url.searchParams.set("category", legacyRoute);
    url.searchParams.delete("route");
    history.replaceState(null, "", url);
  }

  const explicitView = url.searchParams.get("view");
  const hasToolState = ["category", "region", "q"].some(function (key) {
    return url.searchParams.has(key);
  });
  const currentView = validViews.has(explicitView)
    ? explicitView
    : hasToolState
      ? "tools"
      : "home";

  document.body.dataset.activeView = currentView;
  document.querySelectorAll("[data-view-panel]").forEach(function (panel) {
    const active = panel.dataset.viewPanel === currentView;
    panel.hidden = !active;
    panel.dataset.viewActive = String(active);
  });
  document.querySelectorAll("[data-nav-view]").forEach(function (link) {
    if (link.dataset.navView === currentView) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  const skipLink = document.querySelector(".skip-link");
  const viewTargets = {
    home: "#portal-grid",
    tools: "#tool-grid",
    hot: "#model-ranking-full",
    flows: "#workflow-grid",
    glossary: "#glossary-grid"
  };
  if (skipLink) skipLink.href = viewTargets[currentView];

  const compareNav = document.getElementById("header-compare");
  if (compareNav) compareNav.hidden = currentView !== "tools";

  function renderPortals() {
    const grid = document.getElementById("portal-grid");
    if (!grid) return;
    grid.replaceChildren();
    stationData.portals.forEach(function (portal) {
      const link = makeElement("a", "portal-card portal-card-" + portal.id);
      link.href = viewUrl(portal.id);
      link.dataset.portal = portal.id;
      const order = makeElement("span", "portal-order", portal.order);
      const copy = makeElement("span", "portal-copy");
      copy.append(
        makeElement("strong", "", portal.title),
        makeElement("span", "", portal.summary),
        makeElement("small", "", portal.meta)
      );
      const arrow = makeElement("span", "portal-arrow", "→");
      arrow.setAttribute("aria-hidden", "true");
      link.append(order, copy, arrow);
      grid.appendChild(link);
    });
  }

  function renderRanking(containerId, compact) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const models = snapshot.leaderboard && Array.isArray(snapshot.leaderboard.models)
      ? snapshot.leaderboard.models.slice(0, 5)
      : [];
    const list = makeElement("ol", compact ? "model-ranking-list compact" : "model-ranking-list");
    models.forEach(function (model) {
      const item = makeElement("li", "model-ranking-row");
      const link = makeElement("a");
      link.href = safeHttps(model.url) || snapshot.sources.leaderboard;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "查看 AIHOT 中的 " + model.name + " 模型详情");
      const rank = makeElement("span", "model-rank", String(model.rank).padStart(2, "0"));
      const identity = makeElement("span", "model-identity");
      identity.append(makeElement("strong", "", model.name), makeElement("small", "", model.provider));
      const coverage = makeElement("span", "model-coverage");
      coverage.append(makeElement("small", "", "评测完整度"), makeElement("strong", "", model.coverage || "—"));
      const score = makeElement("span", "model-score");
      score.append(makeElement("small", "", "共识分"), makeElement("strong", "", String(model.score)));
      link.append(rank, identity, coverage, score);
      item.appendChild(link);
      list.appendChild(item);
    });

    if (!models.length) list.appendChild(makeElement("li", "ranking-empty", "模型排行暂时无法读取。"));
    const source = makeElement("div", "source-line");
    const sourceText = makeElement(
      "span",
      "",
      "来源：AIHOT 大模型排行榜" + (snapshot.leaderboard.updatedLabel ? " · 更新于 " + snapshot.leaderboard.updatedLabel : "")
    );
    const links = makeElement("span", "source-links");
    const full = makeElement("a", "", "查看完整榜单 ↗");
    full.href = snapshot.sources.leaderboard;
    full.target = "_blank";
    full.rel = "noopener noreferrer";
    const method = makeElement("a", "", "计算方法 ↗");
    method.href = snapshot.sources.methodology;
    method.target = "_blank";
    method.rel = "noopener noreferrer";
    links.append(full, method);
    source.append(sourceText, links);
    container.replaceChildren(list, source);
  }

  function toolName(id) {
    const tool = toolsData.tools.find(function (item) { return item.id === id; });
    return tool ? tool.name : id;
  }

  function workflowCard(workflow, compact) {
    const card = makeElement("button", compact ? "workflow-card compact" : "workflow-card");
    card.type = "button";
    card.dataset.workflowId = workflow.id;
    card.setAttribute("aria-haspopup", "dialog");
    const meta = makeElement("span", "workflow-card-meta");
    meta.append(makeElement("span", "", workflow.category), makeElement("span", "", "核验 " + workflow.verifiedAt));
    const title = makeElement("strong", "", workflow.title);
    const summary = makeElement("span", "workflow-card-summary", workflow.summary);
    const result = makeElement("span", "workflow-deliverable", "交付：" + workflow.deliverable);
    const arrow = makeElement("span", "workflow-arrow", "→");
    arrow.setAttribute("aria-hidden", "true");
    card.append(meta, title, summary, result, arrow);
    return card;
  }

  function renderWorkflows(containerId, featuredOnly) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const workflows = featuredOnly
      ? stationData.workflows.filter(function (item) { return item.featured; }).slice(0, 4)
      : stationData.workflows;
    container.replaceChildren();
    workflows.forEach(function (workflow) {
      container.appendChild(workflowCard(workflow, featuredOnly));
    });
  }

  function appendList(parent, title, items, ordered) {
    const block = makeElement("section", "detail-block");
    block.appendChild(makeElement("h3", "", title));
    const list = document.createElement(ordered ? "ol" : "ul");
    items.forEach(function (item) { list.appendChild(makeElement("li", "", item)); });
    block.appendChild(list);
    parent.appendChild(block);
  }

  function openWorkflow(id, trigger) {
    const workflow = stationData.workflows.find(function (item) { return item.id === id; });
    const dialog = document.getElementById("workflow-dialog");
    const content = document.getElementById("workflow-dialog-content");
    if (!workflow || !dialog || !content) return;
    content.replaceChildren();

    const head = makeElement("header", "content-dialog-head");
    head.append(
      makeElement("p", "dialog-meta", workflow.category + " · 核验 " + workflow.verifiedAt),
      makeElement("h2", "", workflow.title),
      makeElement("p", "dialog-summary", workflow.summary),
      makeElement("p", "deliverable-callout", "完成后你会得到：" + workflow.deliverable)
    );
    content.appendChild(head);
    const detailGrid = makeElement("div", "content-detail-grid");
    appendList(detailGrid, "开始前准备", workflow.inputs, false);
    appendList(detailGrid, "执行步骤", workflow.steps, true);
    appendList(detailGrid, "完成检查", workflow.done, false);
    appendList(detailGrid, "常见失败", workflow.pitfalls, false);
    content.appendChild(detailGrid);

    const tools = makeElement("section", "related-section");
    tools.appendChild(makeElement("h3", "", "本流程可用工具"));
    const toolLinks = makeElement("div", "related-links");
    workflow.toolIds.forEach(function (toolId) {
      const link = makeElement("a", "", toolName(toolId) + " →");
      link.href = viewUrl("tools", { q: toolName(toolId) });
      toolLinks.appendChild(link);
    });
    tools.appendChild(toolLinks);
    content.appendChild(tools);

    dialog.dataset.lastTriggerId = trigger && trigger.id || "";
    dialog.showModal();
  }

  function renderMethodCards() {
    const container = document.getElementById("method-card-grid");
    if (!container) return;
    container.replaceChildren();
    stationData.methodCards.forEach(function (item) {
      const link = makeElement("a", "method-card");
      link.href = viewUrl("glossary", { term: item.termId });
      link.append(
        makeElement("span", "method-order", item.order),
        makeElement("strong", "", item.title),
        makeElement("span", "", item.summary),
        makeElement("span", "method-arrow", "→")
      );
      container.appendChild(link);
    });
  }

  function buildGlossary() {
    const base = window.GOGO_GLOSSARY_TERMS || {};
    const merged = {};
    Object.keys(base).forEach(function (id) {
      merged[id] = Object.assign({ id: id, group: stationData.baseTermGroups[id] || "入门概念" }, base[id]);
    });
    Object.keys(stationData.extraTerms).forEach(function (id) {
      merged[id] = Object.assign({ id: id }, stationData.extraTerms[id]);
    });
    return Object.values(merged).sort(function (a, b) {
      const groupDiff = groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group);
      return groupDiff || a.term.localeCompare(b.term, "zh-CN");
    });
  }

  const glossary = buildGlossary();
  let glossaryGroup = "全部";
  let glossaryQuery = "";

  function glossarySearchText(term) {
    return [term.term, term.translation, term.summary].concat(term.aliases || []).join(" ").toLocaleLowerCase("zh-CN");
  }

  function renderGlossaryFilters() {
    const filters = document.getElementById("glossary-filters");
    if (!filters) return;
    filters.replaceChildren();
    ["全部"].concat(groupOrder).forEach(function (group) {
      const button = makeElement("button", "filter-chip", group);
      button.type = "button";
      button.dataset.glossaryGroup = group;
      button.setAttribute("aria-pressed", String(group === glossaryGroup));
      filters.appendChild(button);
    });
  }

  function renderGlossary() {
    const grid = document.getElementById("glossary-grid");
    const count = document.getElementById("glossary-count");
    if (!grid) return;
    const query = glossaryQuery.toLocaleLowerCase("zh-CN");
    const terms = glossary.filter(function (term) {
      const groupMatch = glossaryGroup === "全部" || term.group === glossaryGroup;
      const queryMatch = !query || glossarySearchText(term).includes(query);
      return groupMatch && queryMatch;
    });
    grid.replaceChildren();
    terms.forEach(function (term) {
      const card = makeElement("button", "term-card");
      card.type = "button";
      card.dataset.termId = term.id;
      card.setAttribute("aria-haspopup", "dialog");
      card.append(
        makeElement("span", "term-group", term.group),
        makeElement("strong", "", term.term),
        makeElement("small", "", term.translation),
        makeElement("span", "term-summary", term.summary),
        makeElement("span", "term-arrow", "查看解释 →")
      );
      grid.appendChild(card);
    });
    if (!terms.length) {
      const empty = makeElement("p", "content-empty", "没有找到这个词，换个中文或英文关键词试试。");
      grid.appendChild(empty);
    }
    if (count) count.textContent = terms.length + " 个词";
  }

  function openTerm(id) {
    const term = glossary.find(function (item) { return item.id === id; });
    const dialog = document.getElementById("term-dialog");
    const content = document.getElementById("term-dialog-content");
    if (!term || !dialog || !content) return;
    content.replaceChildren();
    const head = makeElement("header", "content-dialog-head");
    head.append(
      makeElement("p", "dialog-meta", term.group),
      makeElement("h2", "", term.term),
      makeElement("p", "term-translation", term.translation),
      makeElement("p", "dialog-summary", term.summary)
    );
    content.appendChild(head);
    if (term.logic) {
      const logic = makeElement("section", "detail-block standalone");
      logic.append(makeElement("h3", "", "它是怎么工作的"), makeElement("p", "", term.logic));
      content.appendChild(logic);
    }
    if (Array.isArray(term.flow) && term.flow.length) appendList(content, "标准流程", term.flow, true);
    if (term.example) {
      const example = makeElement("section", "term-example");
      example.append(makeElement("h3", "", "举个例子"), makeElement("p", "", term.example));
      content.appendChild(example);
    }
    dialog.showModal();
  }

  function formatTime(value) {
    if (!value) return "时间待核验";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "时间待核验";
    const diffHours = Math.round((Date.now() - date.getTime()) / 3600000);
    if (diffHours >= 0 && diffHours < 1) return "刚刚更新";
    if (diffHours >= 1 && diffHours < 24) return diffHours + " 小时前";
    if (diffHours >= 24 && diffHours < 48) return "昨天";
    return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "numeric", day: "numeric" }).format(date);
  }

  function renderEventCards(items) {
    const grid = document.getElementById("event-news-grid");
    if (!grid) return;
    grid.replaceChildren();
    (items || []).slice(0, 6).forEach(function (item, index) {
      const link = makeElement("a", "news-card event-card");
      const href = safeHttps(item.url || item.links && (item.links.aihot || item.links.original));
      if (!href) return;
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const rank = Number(item.rank) || index + 1;
      const source = item.source && item.source.name || item.source || "原始来源";
      const sourceCount = Number(item.sourceCount) || 0;
      link.append(
        makeElement("span", "news-rank", String(rank).padStart(2, "0")),
        makeElement("span", "news-label", "事件热度 · " + (sourceCount ? sourceCount + " 个来源" : "AIHOT 精选")),
        makeElement("strong", "", String(item.title || "未命名事件")),
        makeElement("span", "news-meta", String(source) + " · " + formatTime(item.publishedAt || item.latestAt)),
        makeElement("span", "news-arrow", "查看事件 →")
      );
      grid.appendChild(link);
    });
    if (!grid.childElementCount) grid.appendChild(makeElement("p", "content-empty", "事件动态暂时无法读取。"));
  }

  function renderProductCards(items) {
    const grid = document.getElementById("product-news-grid");
    if (!grid) return;
    grid.replaceChildren();
    (items || []).slice(0, 8).forEach(function (item) {
      const href = safeHttps(item.url || item.links && (item.links.aihot || item.links.original));
      if (!href) return;
      const link = makeElement("a", "news-card product-card");
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const source = item.source && item.source.name || item.source || "原始来源";
      link.append(
        makeElement("span", "news-label", "产品关注 · " + formatTime(item.publishedAt || item.discoveredAt)),
        makeElement("strong", "", String(item.title || "未命名产品动态")),
        makeElement("span", "news-summary", String(item.summary || item.reason || "打开原文查看完整信息。")),
        makeElement("span", "news-meta", String(source)),
        makeElement("span", "news-arrow", "查看原文 →")
      );
      grid.appendChild(link);
    });
    if (!grid.childElementCount) grid.appendChild(makeElement("p", "content-empty", "产品动态暂时无法读取。"));
  }

  function normalizeHot(payload) {
    return Array.isArray(payload && payload.items) ? payload.items.map(function (item) {
      return {
        rank: item.rank,
        title: item.title,
        source: item.source,
        sourceCount: item.sourceCount,
        signalCount: item.signalCount,
        publishedAt: item.latestAt,
        url: item.links && (item.links.aihot || item.links.original)
      };
    }) : [];
  }

  function normalizeProducts(payload) {
    return Array.isArray(payload && payload.items) ? payload.items.map(function (item) {
      return {
        title: item.title,
        summary: item.summary || item.reason,
        source: item.source,
        publishedAt: item.publishedAt || item.discoveredAt,
        url: item.links && (item.links.aihot || item.links.original)
      };
    }) : [];
  }

  async function fetchJson(urlValue) {
    const controller = new AbortController();
    const timer = window.setTimeout(function () { controller.abort(); }, 6500);
    try {
      const response = await fetch(urlValue, { headers: { Accept: "application/json" }, signal: controller.signal });
      if (!response.ok) throw new Error("request failed");
      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  let refreshingNews = false;
  async function refreshNews() {
    if (refreshingNews) return;
    refreshingNews = true;
    const status = document.getElementById("aihot-live-status");
    const retry = document.getElementById("retry-aihot");
    if (status) status.textContent = "正在更新近期动态…";
    if (retry) retry.hidden = true;
    let updated = 0;
    try {
      const hotPayload = await fetchJson("https://aihot.virxact.com/api/v1/hot-topics");
      const hot = normalizeHot(hotPayload);
      if (hot.length) {
        renderEventCards(hot);
        updated += 1;
      }
    } catch (_) {
      // Keep the bundled snapshot. External availability must not block the page.
    }
    try {
      const productPayload = await fetchJson("https://aihot.virxact.com/api/v1/items?mode=selected&category=ai-products&window=7d&limit=8");
      const products = normalizeProducts(productPayload);
      if (products.length) {
        renderProductCards(products);
        updated += 1;
      }
    } catch (_) {
      // Keep the bundled snapshot. External availability must not block the page.
    }
    if (status) {
      status.textContent = updated === 2
        ? "近期动态已更新 · 摘要由 AIHOT 整理，重要信息请打开原文核对"
        : "当前显示最近一次同步 · 部分动态更新暂缓";
    }
    if (retry) retry.hidden = updated === 2;
    refreshingNews = false;
  }

  function renderGlobalSearch(query) {
    const results = document.getElementById("global-search-results");
    if (!results) return;
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    results.replaceChildren();
    results.hidden = !normalized;
    if (!normalized) return;

    const toolMatches = toolsData.tools.filter(function (tool) {
      return [tool.name, tool.type, tool.summary].concat(tool.tags || [], tool.bestFor || []).join(" ").toLocaleLowerCase("zh-CN").includes(normalized);
    }).slice(0, 4);
    const workflowMatches = stationData.workflows.filter(function (workflow) {
      return [workflow.title, workflow.summary, workflow.deliverable, workflow.category].join(" ").toLocaleLowerCase("zh-CN").includes(normalized);
    }).slice(0, 4);
    const termMatches = glossary.filter(function (term) { return glossarySearchText(term).includes(normalized); }).slice(0, 5);
    const total = toolMatches.length + workflowMatches.length + termMatches.length;

    function group(title, entries, maker) {
      if (!entries.length) return;
      const section = makeElement("section", "global-result-group");
      section.appendChild(makeElement("h2", "", title));
      const list = makeElement("div", "global-result-list");
      entries.forEach(function (item) { list.appendChild(maker(item)); });
      section.appendChild(list);
      results.appendChild(section);
    }

    group("工具", toolMatches, function (tool) {
      const link = makeElement("a");
      link.href = viewUrl("tools", { q: tool.name });
      link.append(makeElement("strong", "", tool.name), makeElement("span", "", tool.summary));
      return link;
    });
    group("流程", workflowMatches, function (workflow) {
      const link = makeElement("a");
      link.href = viewUrl("flows", { open: workflow.id });
      link.append(makeElement("strong", "", workflow.title), makeElement("span", "", workflow.deliverable));
      return link;
    });
    group("常用词", termMatches, function (term) {
      const link = makeElement("a");
      link.href = viewUrl("glossary", { term: term.id });
      link.append(makeElement("strong", "", term.term), makeElement("span", "", term.summary));
      return link;
    });
    if (!total) results.appendChild(makeElement("p", "content-empty", "暂时没有匹配内容，换个更短的关键词试试。"));
  }

  renderPortals();
  renderRanking("model-ranking-home", true);
  renderRanking("model-ranking-full", false);
  renderWorkflows("home-workflow-grid", true);
  renderWorkflows("workflow-grid", false);
  renderMethodCards();
  renderGlossaryFilters();
  renderGlossary();
  renderEventCards(snapshot.hotTopics);
  renderProductCards(snapshot.products);

  const globalSearch = document.getElementById("global-search");
  const globalClear = document.getElementById("clear-global-search");
  if (globalSearch) {
    globalSearch.addEventListener("input", function () {
      const value = globalSearch.value;
      if (globalClear) globalClear.hidden = !value;
      renderGlobalSearch(value);
    });
  }
  if (globalClear) {
    globalClear.addEventListener("click", function () {
      globalSearch.value = "";
      globalClear.hidden = true;
      renderGlobalSearch("");
      globalSearch.focus();
    });
  }

  document.addEventListener("click", function (event) {
    const workflowTrigger = event.target.closest("[data-workflow-id]");
    if (workflowTrigger) {
      openWorkflow(workflowTrigger.dataset.workflowId, workflowTrigger);
      return;
    }
    const termTrigger = event.target.closest("[data-term-id]");
    if (termTrigger) openTerm(termTrigger.dataset.termId);
  });

  const glossaryFilters = document.getElementById("glossary-filters");
  if (glossaryFilters) {
    glossaryFilters.addEventListener("click", function (event) {
      const button = event.target.closest("[data-glossary-group]");
      if (!button) return;
      glossaryGroup = button.dataset.glossaryGroup;
      renderGlossaryFilters();
      renderGlossary();
    });
  }
  const glossarySearch = document.getElementById("glossary-search");
  if (glossarySearch) {
    glossarySearch.addEventListener("input", function () {
      glossaryQuery = glossarySearch.value.trim();
      renderGlossary();
    });
  }

  ["workflow-dialog", "term-dialog"].forEach(function (id) {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog || event.target.closest("[data-close-content-dialog]")) dialog.close();
    });
  });

  const retry = document.getElementById("retry-aihot");
  if (retry) retry.addEventListener("click", refreshNews);
  if (currentView === "hot") refreshNews();

  if (currentView === "flows") {
    const openId = url.searchParams.get("open");
    if (openId) window.setTimeout(function () { openWorkflow(openId); }, 0);
  }
  if (currentView === "glossary") {
    const termId = url.searchParams.get("term");
    if (termId) window.setTimeout(function () { openTerm(termId); }, 0);
  }
})();
