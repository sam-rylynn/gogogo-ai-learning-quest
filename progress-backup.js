(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.GOGOGO_BACKUP_CORE = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var KIND = "gogogo-progress-backup";
  var BACKUP_VERSION = 2;
  var APP_VERSION = "2026.08.28";
  var MAX_BYTES = 5 * 1024 * 1024;
  var MAX_DEPTH = 80;
  var MAX_NODES = 100000;
  var STORE_DEFINITIONS = [
    { key: "gogogo_ai_quest_v2", label: "基础课程与复习卡", required: true },
    { key: "gogogo_pixel_guild_v1", label: "公会进度与项目证据", required: true },
    { key: "gogogo_unified_learning_v1", label: "课卡、训练、错题与 Agent 回执", required: true },
    { key: "gogogo_learning_flow_v2", label: "五步学习流程", required: true },
    { key: "gogogo_ai_quest_v1", label: "旧版迁移源", required: false }
  ];
  var STORE_KEYS = STORE_DEFINITIONS.map(function (definition) { return definition.key; });
  var DANGEROUS_KEYS = ["__proto__", "prototype", "constructor"];

  function backupError(code, message, details) {
    var error = new Error(message);
    error.code = code;
    if (details) error.details = details;
    return error;
  }

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function byteLength(text) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(String(text)).length;
    return unescape(encodeURIComponent(String(text))).length;
  }

  function scanJsonValue(value, counters, depth) {
    if (depth > MAX_DEPTH) throw backupError("too_deep", "备份内容嵌套过深，已拒绝恢复");
    counters.nodes += 1;
    if (counters.nodes > MAX_NODES) throw backupError("too_many_nodes", "备份内容过于复杂，已拒绝恢复");
    if (!value || typeof value !== "object") return;
    Object.keys(value).forEach(function (key) {
      if (DANGEROUS_KEYS.indexOf(key) >= 0) throw backupError("dangerous_key", "备份包含不安全字段，已拒绝恢复", { key: key });
      scanJsonValue(value[key], counters, depth + 1);
    });
  }

  function parseStoreRaw(raw, key) {
    if (raw === null) return null;
    if (typeof raw !== "string") throw backupError("invalid_store_value", "备份中的进度记录格式不正确", { key: key });
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw backupError("invalid_store_json", "备份中的进度记录不是有效 JSON", { key: key });
    }
    if (!isPlainObject(parsed)) throw backupError("invalid_store_shape", "备份中的进度记录必须是对象", { key: key });
    scanJsonValue(parsed, { nodes: 0 }, 0);
    return parsed;
  }

  function fnv1a32(text) {
    var hash = 2166136261;
    for (var index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  async function digestText(text, requestedAlgorithm) {
    var cryptoObject = typeof globalThis !== "undefined" ? globalThis.crypto : null;
    var algorithm = requestedAlgorithm || (cryptoObject && cryptoObject.subtle && typeof TextEncoder !== "undefined" ? "sha256" : "fnv1a32");
    if (algorithm === "fnv1a32") return "fnv1a32:" + fnv1a32(text);
    if (algorithm !== "sha256") throw backupError("unsupported_checksum", "备份使用了不支持的完整性校验算法");
    if (cryptoObject && cryptoObject.subtle && typeof TextEncoder !== "undefined") {
      var digest = await cryptoObject.subtle.digest("SHA-256", new TextEncoder().encode(text));
      var hex = Array.prototype.map.call(new Uint8Array(digest), function (value) {
        return value.toString(16).padStart(2, "0");
      }).join("");
      return "sha256:" + hex;
    }
    throw backupError("checksum_unavailable", "当前浏览器无法校验这份 SHA-256 备份，请换用最新版浏览器恢复");
  }

  function sourceMetadata(source) {
    source = source || {};
    return {
      origin: String(source.origin || "unknown"),
      pathname: String(source.pathname || "/")
    };
  }

  function captureStores(storage) {
    if (!storage || typeof storage.getItem !== "function") throw backupError("storage_unavailable", "浏览器存储不可用，无法生成完整备份");
    var stores = {};
    STORE_KEYS.forEach(function (key) {
      var raw;
      try {
        raw = storage.getItem(key);
      } catch (error) {
        throw backupError("storage_read_failed", "读取浏览器进度失败，未生成空备份", { key: key });
      }
      if (raw !== null) parseStoreRaw(raw, key);
      stores[key] = raw;
    });
    return stores;
  }

  async function createBackupText(storage, options) {
    options = options || {};
    var now = options.now instanceof Date ? options.now : new Date();
    var payload = {
      kind: KIND,
      backupVersion: BACKUP_VERSION,
      appVersion: APP_VERSION,
      exportedAt: now.toISOString(),
      source: sourceMetadata(options.source),
      stores: captureStores(storage)
    };
    var checksum = await digestText(JSON.stringify(payload));
    var output = JSON.stringify(Object.assign({}, payload, { checksum: checksum }), null, 2);
    if (byteLength(output) > MAX_BYTES) throw backupError("backup_too_large", "完整备份超过 5 MB，未生成无法恢复的文件");
    return output;
  }

  function payloadFromDocument(documentValue) {
    return {
      kind: documentValue.kind,
      backupVersion: documentValue.backupVersion,
      appVersion: documentValue.appVersion,
      exportedAt: documentValue.exportedAt,
      source: documentValue.source,
      stores: documentValue.stores
    };
  }

  async function parseBackupText(text) {
    if (typeof text !== "string" || !text.trim()) throw backupError("empty_backup", "没有读取到备份内容");
    if (byteLength(text) > MAX_BYTES) throw backupError("backup_too_large", "备份文件超过 5 MB，已拒绝恢复");
    var documentValue;
    try {
      documentValue = JSON.parse(text);
    } catch (error) {
      throw backupError("invalid_backup_json", "备份文件不是有效 JSON");
    }
    if (!isPlainObject(documentValue)) throw backupError("invalid_backup_shape", "备份文件结构不正确");
    scanJsonValue(documentValue, { nodes: 0 }, 0);
    if (documentValue.kind !== KIND) throw backupError("wrong_backup_kind", "这不是 GOGO 完整进度备份");
    if (documentValue.backupVersion !== BACKUP_VERSION) throw backupError("unsupported_backup_version", "暂不支持这个备份版本", { version: documentValue.backupVersion });
    if (typeof documentValue.exportedAt !== "string" || !Number.isFinite(Date.parse(documentValue.exportedAt))) {
      throw backupError("invalid_exported_at", "备份导出时间无效");
    }
    if (!isPlainObject(documentValue.source)) throw backupError("invalid_source", "备份来源信息无效");
    if (!isPlainObject(documentValue.stores)) throw backupError("invalid_stores", "备份缺少进度记录");
    Object.keys(documentValue.stores).forEach(function (key) {
      if (STORE_KEYS.indexOf(key) < 0) throw backupError("unexpected_store", "备份试图写入非课程数据，已拒绝恢复", { key: key });
    });
    STORE_KEYS.forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(documentValue.stores, key)) {
        throw backupError("missing_store", "备份缺少必要的进度记录", { key: key });
      }
      parseStoreRaw(documentValue.stores[key], key);
    });
    if (typeof documentValue.checksum !== "string") throw backupError("missing_checksum", "备份缺少完整性校验");
    var checksumAlgorithm = documentValue.checksum.split(":", 1)[0];
    if (checksumAlgorithm !== "sha256" && checksumAlgorithm !== "fnv1a32") {
      throw backupError("unsupported_checksum", "备份使用了不支持的完整性校验算法");
    }
    var expectedChecksum = await digestText(JSON.stringify(payloadFromDocument(documentValue)), checksumAlgorithm);
    if (expectedChecksum !== documentValue.checksum) throw backupError("checksum_mismatch", "备份完整性校验失败，文件可能已损坏");
    return documentValue;
  }

  function objectSize(value) {
    return isPlainObject(value) ? Object.keys(value).length : 0;
  }

  function summarizeBackup(documentValue) {
    var parsed = {};
    STORE_KEYS.forEach(function (key) {
      parsed[key] = parseStoreRaw(documentValue.stores[key], key);
    });
    var legacy = parsed.gogogo_ai_quest_v2 || {};
    var guild = parsed.gogogo_pixel_guild_v1 || {};
    var unified = parsed.gogogo_unified_learning_v1 || {};
    var flow = parsed.gogogo_learning_flow_v2 || {};
    var wrongCount = 0;
    Object.keys(unified.wrong || {}).forEach(function (key) {
      if (Array.isArray(unified.wrong[key])) wrongCount += unified.wrong[key].length;
    });
    return {
      exportedAt: documentValue.exportedAt,
      source: sourceMetadata(documentValue.source),
      presentStores: STORE_DEFINITIONS.filter(function (definition) { return documentValue.stores[definition.key] !== null; }).length,
      totalStores: STORE_DEFINITIONS.length,
      legacyLevels: objectSize(legacy.levels),
      reviewCards: objectSize(legacy.cards),
      guildQuestions: Array.isArray(guild.questions) ? guild.questions.length : 0,
      guildArtifacts: objectSize(guild.artifacts),
      reflections: objectSize(unified.reflections),
      agentReviews: objectSize(unified.reflectionReviews),
      passedLevels: Object.keys(unified.passed || {}).filter(function (key) { return Boolean(unified.passed[key]); }).length,
      wrongCount: wrongCount,
      libraryCheckpoints: objectSize(flow.libraryDoneByLevel)
    };
  }

  function restoreBackup(storage, documentValue) {
    if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function" || typeof storage.removeItem !== "function") {
      throw backupError("storage_unavailable", "浏览器存储不可用，无法恢复备份");
    }
    var previous = {};
    STORE_KEYS.forEach(function (key) {
      previous[key] = storage.getItem(key);
    });
    var rollbackFailures = [];
    function rollback() {
      STORE_KEYS.forEach(function (key) {
        try {
          storage.removeItem(key);
        } catch (error) {
          rollbackFailures.push(key);
        }
      });
      STORE_KEYS.forEach(function (key) {
        try {
          if (previous[key] !== null) storage.setItem(key, previous[key]);
          if (storage.getItem(key) !== previous[key]) rollbackFailures.push(key);
        } catch (error) {
          rollbackFailures.push(key);
        }
      });
      if (rollbackFailures.length) {
        STORE_KEYS.forEach(function (key) {
          try { storage.removeItem(key); } catch (error) { rollbackFailures.push(key); }
        });
      }
    }
    try {
      STORE_KEYS.forEach(function (key) {
        var target = documentValue.stores[key];
        if (target === null) storage.removeItem(key);
        else storage.setItem(key, target);
        if (storage.getItem(key) !== target) throw backupError("storage_verify_failed", "恢复后的进度回读不一致", { key: key });
      });
    } catch (error) {
      rollback();
      if (rollbackFailures.length) {
        throw backupError("rollback_failed", "恢复失败，且浏览器未能完整回滚；请使用刚下载的导入前安全备份", { keys: rollbackFailures, cause: error.code || error.message });
      }
      throw backupError("restore_failed", "恢复失败，原进度已完整保留", { cause: error.code || error.message });
    }
    return { restoredKeys: STORE_KEYS.slice() };
  }

  return {
    KIND: KIND,
    BACKUP_VERSION: BACKUP_VERSION,
    APP_VERSION: APP_VERSION,
    MAX_BYTES: MAX_BYTES,
    STORE_DEFINITIONS: STORE_DEFINITIONS.slice(),
    STORE_KEYS: STORE_KEYS.slice(),
    createBackupText: createBackupText,
    parseBackupText: parseBackupText,
    summarizeBackup: summarizeBackup,
    restoreBackup: restoreBackup
  };
});
