(function () {
  "use strict";

  const STATUS_LABELS = Object.freeze({
    "verified-current": "当前可查",
    "enroll-check": "报名前复核",
    upcoming: "即将开放",
    "direction-only": "职业或认证方向",
    "legacy-unverified": "历史名称待核",
    "retired-replaced": "已关闭或替换"
  });

  const STATUS_ORDER = Object.freeze({
    "verified-current": 0,
    "enroll-check": 1,
    upcoming: 2,
    "direction-only": 3,
    "legacy-unverified": 4,
    "retired-replaced": 5
  });

  const ISSUER_LABELS = Object.freeze({
    association: "行业协会",
    "government-training": "政府部门培训项目",
    "public-institution": "事业单位 / 专业机构",
    "local-government": "地方政府培训项目",
    vendor: "厂商认证",
    "occupational-standard": "国家职业标准 / 方向",
    "third-party": "第三方认证"
  });

  const PARAM_NAMES = ["q", "status", "issuer", "track", "code", "sort"];
  const DEFAULT_SORT = "status";
  const expandedIds = new Set();

  const data = Array.isArray(window.GOGO_CERTIFICATE_LIBRARY)
    ? window.GOGO_CERTIFICATE_LIBRARY.slice()
    : [];

  const elements = {
    form: document.getElementById("certificate-filters"),
    query: document.getElementById("filter-query"),
    status: document.getElementById("filter-status"),
    issuer: document.getElementById("filter-issuer"),
    track: document.getElementById("filter-track"),
    code: document.getElementById("filter-code"),
    sort: document.getElementById("filter-sort"),
    reset: document.getElementById("reset-filters"),
    copy: document.getElementById("copy-filter-link"),
    feedback: document.getElementById("copy-feedback"),
    resultCount: document.getElementById("result-count"),
    tableBody: document.getElementById("certificate-table-body"),
    total: document.getElementById("summary-total"),
    current: document.getElementById("summary-current"),
    tracks: document.getElementById("summary-tracks"),
    date: document.getElementById("summary-date")
  };

  function createElement(tagName, options) {
    const node = document.createElement(tagName);
    const config = options || {};
    if (config.className) node.className = config.className;
    if (config.text !== undefined) node.textContent = String(config.text);
    if (config.attributes) {
      Object.entries(config.attributes).forEach(([name, value]) => {
        node.setAttribute(name, String(value));
      });
    }
    return node;
  }

  function appendTextElement(parent, tagName, className, text) {
    const node = createElement(tagName, { className, text });
    parent.appendChild(node);
    return node;
  }

  function normalized(value) {
    return String(value || "").trim().toLocaleLowerCase("zh-CN");
  }

  function optionExists(select, value) {
    return Array.from(select.options).some((option) => option.value === value);
  }

  function readInitialFilters() {
    const params = new URL(window.location.href).searchParams;
    const query = params.get("q");
    if (query !== null) elements.query.value = query.slice(0, 120);

    ["status", "issuer", "track", "code", "sort"].forEach((name) => {
      const value = params.get(name);
      if (value !== null && optionExists(elements[name], value)) elements[name].value = value;
    });
  }

  function currentFilters() {
    return {
      q: elements.query.value.trim().slice(0, 120),
      status: elements.status.value,
      issuer: elements.issuer.value,
      track: elements.track.value,
      code: elements.code.value,
      sort: elements.sort.value || DEFAULT_SORT
    };
  }

  function buildFilterUrl(filters) {
    const url = new URL(window.location.href);
    PARAM_NAMES.forEach((name) => url.searchParams.delete(name));
    if (filters.q) url.searchParams.set("q", filters.q);
    if (filters.status) url.searchParams.set("status", filters.status);
    if (filters.issuer) url.searchParams.set("issuer", filters.issuer);
    if (filters.track) url.searchParams.set("track", filters.track);
    if (filters.code) url.searchParams.set("code", filters.code);
    if (filters.sort && filters.sort !== DEFAULT_SORT) url.searchParams.set("sort", filters.sort);
    url.hash = "";
    return url;
  }

  function updateAddressBar(filters) {
    const url = buildFilterUrl(filters);
    try {
      window.history.replaceState(null, "", url.href);
    } catch (_error) {
      // Local preview can still copy a complete filter URL when history is unavailable.
    }
  }

  function searchableText(item) {
    return [
      item.name,
      item.issuer,
      item.credentialType,
      item.audience,
      item.assessmentSummary,
      item.statusNote,
      item.codeLevel,
      ...(item.aliases || []),
      ...(item.tracks || []),
      ...(item.learningTopics || [])
    ].map(normalized).join(" ");
  }

  function matchesFilters(item, filters) {
    const terms = normalized(filters.q).split(/\s+/).filter(Boolean);
    if (terms.length && !terms.every((term) => searchableText(item).includes(term))) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.issuer && item.issuerType !== filters.issuer) return false;
    if (filters.track && !item.tracks.includes(filters.track)) return false;
    if (filters.code && item.codeLevel !== filters.code) return false;
    return true;
  }

  function sortItems(items, sortBy) {
    const collator = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });
    return items.slice().sort((left, right) => {
      if (sortBy === "name") return collator.compare(left.name, right.name);
      if (sortBy === "issuer") {
        return collator.compare(left.issuer, right.issuer) || collator.compare(left.name, right.name);
      }
      if (sortBy === "updated") {
        return right.updatedAt.localeCompare(left.updatedAt) || collator.compare(left.name, right.name);
      }
      return (STATUS_ORDER[left.status] - STATUS_ORDER[right.status]) || collator.compare(left.name, right.name);
    });
  }

  function makeCell(label, className) {
    const cell = createElement("td", { className });
    cell.dataset.label = label;
    return cell;
  }

  function makeTagList(values) {
    const list = createElement("div", { className: "tag-list" });
    values.forEach((value) => list.appendChild(createElement("span", { className: "tag", text: value })));
    return list;
  }

  function makeDetailItem(term, description, className) {
    const wrapper = createElement("div", { className: `detail-item${className ? ` ${className}` : ""}` });
    wrapper.appendChild(createElement("dt", { text: term }));
    wrapper.appendChild(createElement("dd", { text: description }));
    return wrapper;
  }

  function makeSourceItem(source) {
    const item = createElement("li");
    const link = createElement("a", {
      className: "source-link",
      text: source.label,
      attributes: {
        href: source.url,
        target: "_blank",
        rel: "noopener noreferrer",
        title: `最后核验：${source.lastVerified}`
      }
    });
    link.appendChild(createElement("span", { text: "↗", attributes: { "aria-hidden": "true" } }));
    item.appendChild(link);
    return item;
  }

  function primarySourceLabel(item) {
    if (item.status === "legacy-unverified") return "核验依据 ↗";
    if (item.status === "direction-only") return "官方标准 / 方向页 ↗";
    return "官方原页面 ↗";
  }

  function makeMainRow(item) {
    const row = createElement("tr", {
      className: `cert-row${expandedIds.has(item.id) ? " is-expanded" : ""}`,
      attributes: { id: `certificate-row-${item.id}` }
    });

    const nameCell = makeCell("证书 / 路径", "name-cell");
    const primarySource = item.officialSources[0];
    const nameLink = createElement("a", {
      className: "cert-name-link",
      attributes: {
        href: primarySource.url,
        target: "_blank",
        rel: "noopener noreferrer",
        title: `${primarySource.label}（最后核验：${primarySource.lastVerified}）`
      }
    });
    const name = appendTextElement(nameLink, "strong", "cert-name", item.name);
    name.id = `certificate-name-${item.id}`;
    nameLink.appendChild(createElement("span", { className: "official-page-hint", text: primarySourceLabel(item) }));
    nameLink.appendChild(createElement("span", {
      className: "visually-hidden",
      text: "，在新标签页打开"
    }));
    nameCell.appendChild(nameLink);
    if (Array.isArray(item.aliases) && item.aliases.length) appendTextElement(nameCell, "span", "cert-code", item.aliases.slice(0, 3).join(" · "));
    row.appendChild(nameCell);

    const issuerCell = makeCell("性质与主体", "issuer-cell");
    appendTextElement(issuerCell, "span", "cell-main", item.credentialType);
    appendTextElement(issuerCell, "span", "cell-subline", `${ISSUER_LABELS[item.issuerType] || item.issuerType} · ${item.issuer}`);
    row.appendChild(issuerCell);

    const trackCell = makeCell("学习方向", "track-cell");
    trackCell.appendChild(makeTagList(item.tracks));
    row.appendChild(trackCell);

    const codeCell = makeCell("代码程度", "code-cell");
    appendTextElement(codeCell, "span", "cell-main", item.codeLevel);
    row.appendChild(codeCell);

    const statusCell = makeCell("核验状态", "status-cell");
    statusCell.appendChild(createElement("span", {
      className: `status-badge status-${item.status}`,
      text: STATUS_LABELS[item.status]
    }));
    appendTextElement(statusCell, "span", "cell-subline", `核验于 ${item.updatedAt}`);
    row.appendChild(statusCell);

    const toggleCell = makeCell("展开详情", "toggle-cell");
    const expanded = expandedIds.has(item.id);
    const toggle = createElement("button", {
      className: "detail-toggle",
      attributes: {
        type: "button",
        "data-certificate-id": item.id,
        "aria-expanded": expanded,
        "aria-controls": `certificate-detail-${item.id}`,
        "aria-label": `${expanded ? "收起" : "查看"}${item.name}详情`
      }
    });
    toggle.appendChild(createElement("span", { className: "toggle-icon", text: "+", attributes: { "aria-hidden": "true" } }));
    toggleCell.appendChild(toggle);
    row.appendChild(toggleCell);

    return row;
  }

  function makeDetailRow(item) {
    const expanded = expandedIds.has(item.id);
    const row = createElement("tr", {
      className: "detail-row",
      attributes: {
        id: `certificate-detail-${item.id}`,
        "aria-labelledby": `certificate-name-${item.id}`
      }
    });
    row.hidden = !expanded;

    const cell = createElement("td", { attributes: { colspan: "6" } });
    const panel = createElement("div", { className: "detail-panel" });
    const details = createElement("dl", { className: "detail-grid" });
    details.appendChild(makeDetailItem("适合谁", item.audience, "detail-item-wide"));
    details.appendChild(makeDetailItem("证书语言", item.language));
    details.appendChild(makeDetailItem("主要学习内容", item.learningTopics.join(" · "), "detail-item-wide"));
    details.appendChild(makeDetailItem("考试 / 考核方向", item.assessmentSummary));
    details.appendChild(makeDetailItem("前置条件", item.prerequisites));
    details.appendChild(makeDetailItem("有效期", item.validity));
    details.appendChild(makeDetailItem("为什么这样标注", item.statusNote, "detail-item-full"));
    details.appendChild(makeDetailItem("对应 GOGO 练习", item.gogoMapping, "detail-item-full"));

    const sourceWrapper = createElement("div", { className: "detail-item detail-item-full" });
    sourceWrapper.appendChild(createElement("dt", { text: "官方来源" }));
    const sourceDescription = createElement("dd");
    const sourceList = createElement("ul", { className: "source-list" });
    item.officialSources.forEach((source) => sourceList.appendChild(makeSourceItem(source)));
    sourceDescription.appendChild(sourceList);
    sourceWrapper.appendChild(sourceDescription);
    details.appendChild(sourceWrapper);

    panel.appendChild(details);
    cell.appendChild(panel);
    row.appendChild(cell);
    return row;
  }

  function renderRows(items) {
    const fragment = document.createDocumentFragment();
    if (!items.length) {
      const row = createElement("tr", { className: "empty-row" });
      const cell = createElement("td", {
        text: "没有匹配项。可以减少一个筛选条件，或换一个关键词。",
        attributes: { colspan: "6" }
      });
      row.appendChild(cell);
      fragment.appendChild(row);
    } else {
      items.forEach((item) => {
        fragment.appendChild(makeMainRow(item));
        fragment.appendChild(makeDetailRow(item));
      });
    }
    elements.tableBody.replaceChildren(fragment);
  }

  function updateResultCount(resultCount) {
    const strong = createElement("strong", { text: resultCount });
    elements.resultCount.replaceChildren(document.createTextNode("找到 "), strong, document.createTextNode(` 条结果，共收录 ${data.length} 条`));
  }

  function render(options) {
    const config = options || {};
    const filters = currentFilters();
    const results = sortItems(data.filter((item) => matchesFilters(item, filters)), filters.sort);
    renderRows(results);
    updateResultCount(results.length);
    if (config.updateUrl !== false) updateAddressBar(filters);
  }

  function toggleDetail(button) {
    const id = button.dataset.certificateId;
    const row = document.getElementById(`certificate-row-${id}`);
    const detail = document.getElementById(`certificate-detail-${id}`);
    if (!row || !detail) return;
    const willExpand = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(willExpand));
    button.setAttribute("aria-label", `${willExpand ? "收起" : "查看"}${row.querySelector(".cert-name").textContent}详情`);
    row.classList.toggle("is-expanded", willExpand);
    detail.hidden = !willExpand;
    if (willExpand) expandedIds.add(id);
    else expandedIds.delete(id);
  }

  function announceCopy(message, failed) {
    elements.feedback.textContent = message;
    elements.feedback.style.color = failed ? "var(--red)" : "";
    window.setTimeout(() => {
      if (elements.feedback.textContent === message) elements.feedback.textContent = "";
    }, 4500);
  }

  function fallbackCopy(text) {
    const input = createElement("textarea", { attributes: { readonly: "" } });
    input.value = text;
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    if (!copied) throw new Error("copy_failed");
  }

  async function copyFilterLink() {
    const link = buildFilterUrl(currentFilters()).href;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(link);
      else fallbackCopy(link);
      announceCopy("当前筛选链接已复制。", false);
    } catch (_error) {
      announceCopy("复制失败，请从浏览器地址栏复制当前链接。", true);
    }
  }

  function resetFilters() {
    elements.form.reset();
    elements.sort.value = DEFAULT_SORT;
    expandedIds.clear();
    render();
    elements.query.focus();
  }

  function updateSummary() {
    elements.total.textContent = String(data.length);
    elements.current.textContent = String(data.filter((item) => item.status === "verified-current").length);
    elements.tracks.textContent = String(new Set(data.flatMap((item) => item.tracks)).size);
    const newestDate = data.reduce((latest, item) => item.updatedAt > latest ? item.updatedAt : latest, "");
    elements.date.textContent = newestDate || "待核验";
  }

  function bindEvents() {
    elements.query.addEventListener("input", () => render());
    [elements.status, elements.issuer, elements.track, elements.code, elements.sort].forEach((select) => {
      select.addEventListener("change", () => render());
    });
    elements.reset.addEventListener("click", resetFilters);
    elements.copy.addEventListener("click", copyFilterLink);
    elements.tableBody.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-certificate-id]");
      if (button) toggleDetail(button);
    });
    window.addEventListener("popstate", () => {
      elements.form.reset();
      elements.sort.value = DEFAULT_SORT;
      readInitialFilters();
      render({ updateUrl: false });
    });
  }

  function init() {
    if (Object.values(elements).some((element) => !element)) return;
    updateSummary();
    readInitialFilters();
    bindEvents();
    render({ updateUrl: false });
  }

  init();
})();
