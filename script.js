// --- DOM Elements ---
// Tab elements
const tabSingle = document.getElementById("tab-single");
const tabBulk = document.getElementById("tab-bulk");
const tabContentSingle = document.getElementById("tab-content-single");
const tabContentBulk = document.getElementById("tab-content-bulk");

// Single row form elements
const singleForm = document.getElementById("single-generator-form");
const singleReportTypeSelect = document.getElementById("single-report-type");
const jsonInputsContainer = document.getElementById("json-inputs-container");
const addJsonBtn = document.getElementById("add-json-btn");
const singleDelimiterSelect = document.getElementById("single-delimiter");
const singleFileNameInput = document.getElementById("single-file-name");

// Bulk form elements
const bulkForm = document.getElementById("bulk-generator-form");
const bulkReportTypeSelect = document.getElementById("bulk-report-type");
const bulkJsonInput = document.getElementById("bulk-json-input");
const bulkRecordCountInput = document.getElementById("bulk-record-count");
const bulkDelimiterSelect = document.getElementById("bulk-delimiter");
const bulkFileNameInput = document.getElementById("bulk-file-name");

// Preview elements
const previewContainer = document.getElementById("preview-container");
const previewHeader = document.getElementById("preview-header");
const previewBody = document.getElementById("preview-body");
const noDataMessage = document.getElementById("no-data");
const actionButtons = document.getElementById("action-buttons");
const downloadBtn = document.getElementById("download-btn");
const copyBtn = document.getElementById("copy-btn");
const toast = document.getElementById("toast");

// --- State ---
let generatedData = [];
let generatedHeaders = [];
let jsonData = null;

// --- Report Type Configurations ---
const REPORT_CONFIGS = {
  ReportPegadaianBayar: {
    headers: [
      "TGL_TRANSAKSI",
      "CLIENT_ID",
      "JENIS_TRANSAKSI",
      "NO_KONTRAK",
      "PRODUCT_CODE",
      "REFF_ID_SWITCHING",
      "AMOUNT",
      "ADMIN",
      "CHANNEL_ID",
      "STATUS",
    ],
    mappings: {
      TGL_TRANSAKSI: "feResponse.data.tglTransaksi",
      CLIENT_ID: "feRequest.clientId",
      JENIS_TRANSAKSI: "feRequest.jenisTransaksi",
      NO_KONTRAK: "feRequest.norek",
      PRODUCT_CODE: null,
      REFF_ID_SWITCHING: "feRequest.reffSwitching",
      AMOUNT: "feRequest.amount",
      ADMIN: "feRequest.surcharge",
      CHANNEL_ID: "feRequest.channelIdPegadaian",
      STATUS: "feResponse.responseCode",
    },
  },
  ReportPegadaianCicil: {
    headers: [
      "tgl_trx",
      "no_kredit",
      "reff_switching",
      "reff_biller",
      "client_id",
      "kode_produk",
      "jenis_trx",
      "amount",
      "admin",
      "fee",
      "settlement",
      "flag_rekon",
    ],
    mappings: {
      tgl_trx: "feResponse.data.tglTransaksi",
      no_kredit: "feRequest.noIdentitas",
      reff_switching: "feRequest.reffSwitching",
      reff_biller: "feRequest.reffBiller",
      client_id: "feRequest.clientId",
      kode_produk: null,
      jenis_trx: "feRequest.jenisTransaksi",
      amount: "feResponse.data.nominalUangMuka",
      admin: "feResponse.data.administrasi",
      fee: "feResponse.feeAmount",
      settlement: "esb.creditAmount",
      flag_rekon: "MA",
    },
  },
  ReportBrimoASDP: {
    headers: [],
    mappings: {},
  },
};

// --- Utility Functions for JSON Data Generation ---
const getValueFromPath = (obj, path) => {
  if (!path || !obj) return null;

  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }

  return current;
};

const generateValueFromJson = (header, mappings, jsonData) => {
  const mapping = mappings[header];

  if (!mapping) {
    return ""; // Return empty string if no mapping defined
  }

  if (mapping === null) {
    return ""; // Return empty string for null mappings
  }

  const value = getValueFromPath(jsonData, mapping);
  return value !== null ? String(value) : "";
};

// --- Formatting Helpers ---
const toDecimalString = (value) => {
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
  if (!isFinite(numeric)) return "";
  return numeric.toFixed(2);
};

const toIntegerString = (value) => {
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
  if (!isFinite(numeric)) return "";
  return String(Math.trunc(numeric));
};

const getKodeProduk = (jsonData) => {
  const serviceId = getValueFromPath(jsonData, "feRequest.serviceId");
  if (serviceId === "000RC" || serviceId === "000QZ") {
    return "37";
  } else if (serviceId === "000U7") {
    return "32";
  } else {
    return "01";
  }
};

// --- UI Rendering ---
const renderPreview = () => {
  if (generatedData.length === 0) {
    previewContainer.classList.add("hidden");
    actionButtons.classList.add("hidden");
    noDataMessage.classList.remove("hidden");
    return;
  }

  previewHeader.innerHTML = "";
  previewBody.innerHTML = "";

  const headerRow = document.createElement("tr");
  generatedHeaders.forEach((header) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.className =
      "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
    th.textContent = header;
    headerRow.appendChild(th);
  });
  previewHeader.appendChild(headerRow);

  generatedData.forEach((row) => {
    const tr = document.createElement("tr");
    generatedHeaders.forEach((header) => {
      const td = document.createElement("td");
      td.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-700";
      td.textContent = row[header];
      tr.appendChild(td);
    });
    previewBody.appendChild(tr);
  });

  previewContainer.classList.remove("hidden");
  actionButtons.classList.remove("hidden");
  noDataMessage.classList.add("hidden");
};

const arrayToCsv = (headers, data, delimiter) => {
  const csvRows = [];
  csvRows.push(headers.join(delimiter));
  data.forEach((row) => {
    const values = headers.map((header) => {
      const val = row[header] ?? "";
      // Emit raw value without quotes and without newlines to keep CSV row integrity
      return String(val)
        .replace(/\r?\n|\r/g, " ")
        .replace(/"/g, "");
    });
    csvRows.push(values.join(delimiter));
  });
  return csvRows.join("\n");
};

// --- Tab Management ---
const switchTab = (activeTab) => {
  // Update tab buttons
  if (activeTab === "single") {
    tabSingle.className =
      "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 bg-white text-blue-700 shadow-sm";
    tabBulk.className =
      "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 text-gray-500 hover:text-gray-700";
    tabContentSingle.classList.remove("hidden");
    tabContentBulk.classList.add("hidden");
  } else {
    tabSingle.className =
      "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 text-gray-500 hover:text-gray-700";
    tabBulk.className =
      "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 bg-white text-blue-700 shadow-sm";
    tabContentSingle.classList.add("hidden");
    tabContentBulk.classList.remove("hidden");
  }
};

// --- JSON Input Management for Single Tab ---
let jsonInputCount = 1;

const addJsonInput = () => {
  jsonInputCount++;
  const jsonInputGroup = document.createElement("div");
  jsonInputGroup.className = "json-input-group";
  jsonInputGroup.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm text-gray-600">JSON #${jsonInputCount}</span>
      <button type="button" class="remove-json-btn text-red-500 hover:text-red-700 p-1 rounded-full">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        </button>
    </div>
    <textarea name="json-input" rows="4"
      class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-mono"
      placeholder="Paste your JSON data here..."></textarea>
  `;
  jsonInputsContainer.appendChild(jsonInputGroup);

  // Show remove buttons for all inputs when we have more than 1
  if (jsonInputCount > 1) {
    document
      .querySelectorAll(".remove-json-btn")
      .forEach((btn) => btn.classList.remove("hidden"));
  }
};

const removeJsonInput = (button) => {
  button.closest(".json-input-group").remove();
  jsonInputCount--;

  // Hide remove buttons if we only have 1 input left
  if (jsonInputCount === 1) {
    document
      .querySelectorAll(".remove-json-btn")
      .forEach((btn) => btn.classList.add("hidden"));
  }

  // Update numbering
  document.querySelectorAll(".json-input-group").forEach((group, index) => {
    group.querySelector("span").textContent = `JSON #${index + 1}`;
  });
};

// --- Event Handlers ---
const handleSingleGenerate = (e) => {
  e.preventDefault();

  const reportType = singleReportTypeSelect.value;
  const jsonInputs = jsonInputsContainer.querySelectorAll(
    'textarea[name="json-input"]'
  );

  // Validate inputs
  if (!reportType) {
    alert("Please select a report type");
    return;
  }

  if (jsonInputs.length === 0) {
    alert("Please add at least one JSON input");
    return;
  }

  // Get report configuration
  const config = REPORT_CONFIGS[reportType];
  if (!config || config.headers.length === 0) {
    alert("Selected report type is not configured yet");
    return;
  }

  generatedHeaders = config.headers;
  generatedData = [];

  // Process each JSON input
  jsonInputs.forEach((textarea, index) => {
    const jsonInputValue = textarea.value.trim();
    if (!jsonInputValue) return;

    try {
      const jsonData = JSON.parse(jsonInputValue);
      const row = {};
      generatedHeaders.forEach((header) => {
        let v = generateValueFromJson(header, config.mappings, jsonData);
        if (
          singleReportTypeSelect.value === "ReportPegadaianBayar" &&
          (header === "AMOUNT" || header === "ADMIN")
        ) {
          v = toDecimalString(v);
        }
        if (
          singleReportTypeSelect.value === "ReportPegadaianCicil" &&
          (header === "fee" || header === "settlement")
        ) {
          v = toIntegerString(v);
        }
        if (
          singleReportTypeSelect.value === "ReportPegadaianCicil" &&
          header === "kode_produk"
        ) {
          v = getKodeProduk(jsonData);
        }
        row[header] = v;
      });
      generatedData.push(row);
    } catch (error) {
      alert(
        `Invalid JSON format in JSON #${index + 1}. Please check your input.`
      );
      return;
    }
  });

  if (generatedData.length === 0) {
    alert("No valid JSON data found");
    return;
  }

  renderPreview();
};

const handleBulkGenerate = (e) => {
  e.preventDefault();

  const reportType = bulkReportTypeSelect.value;
  const jsonInputValue = bulkJsonInput.value.trim();

  // Validate inputs
  if (!reportType) {
    alert("Please select a report type");
    return;
  }

  if (!jsonInputValue) {
    alert("Please enter JSON data");
    return;
  }

  // Parse JSON
  try {
    jsonData = JSON.parse(jsonInputValue);
  } catch (error) {
    alert("Invalid JSON format. Please check your input.");
    return;
  }

  // Get report configuration
  const config = REPORT_CONFIGS[reportType];
  if (!config || config.headers.length === 0) {
    alert("Selected report type is not configured yet");
    return;
  }

  generatedHeaders = config.headers;
  const recordCount = parseInt(bulkRecordCountInput.value, 10);

  // Generate data based on JSON and mappings
  generatedData = Array.from({ length: recordCount }, () => {
    const row = {};
    generatedHeaders.forEach((header) => {
      let v = generateValueFromJson(header, config.mappings, jsonData);
      if (
        bulkReportTypeSelect.value === "ReportPegadaianBayar" &&
        (header === "AMOUNT" || header === "ADMIN")
      ) {
        v = toDecimalString(v);
      }
      if (
        bulkReportTypeSelect.value === "ReportPegadaianCicil" &&
        (header === "fee" || header === "settlement")
      ) {
        v = toIntegerString(v);
      }
      if (
        bulkReportTypeSelect.value === "ReportPegadaianCicil" &&
        header === "kode_produk"
      ) {
        v = getKodeProduk(jsonData);
      }
      row[header] = v;
    });
    return row;
  });

  renderPreview();
};

const handleDownload = () => {
  if (generatedData.length === 0) return;

  // Get delimiter and filename from active tab
  const isSingleTab = !tabContentSingle.classList.contains("hidden");
  const delimiter = isSingleTab
    ? singleDelimiterSelect.value
    : bulkDelimiterSelect.value;
  const fileName = isSingleTab
    ? singleFileNameInput.value.trim()
    : bulkFileNameInput.value.trim();

  const csvContent = arrayToCsv(generatedHeaders, generatedData, delimiter);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  let finalFileName = fileName || "report";
  if (!finalFileName.toLowerCase().endsWith(".csv")) {
    finalFileName += ".csv";
  }
  link.download = finalFileName;

  document.body.appendChild(link);
  link.click();

  // Use a timeout to ensure the download link has been processed before removing it
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 0);
};

const handleCopy = () => {
  if (generatedData.length === 0) return;

  // Get delimiter from active tab
  const isSingleTab = !tabContentSingle.classList.contains("hidden");
  const delimiter = isSingleTab
    ? singleDelimiterSelect.value
    : bulkDelimiterSelect.value;

  const csvContent = arrayToCsv(generatedHeaders, generatedData, delimiter);

  const textArea = document.createElement("textarea");
  textArea.value = csvContent;
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand("copy");
    toast.textContent = "Copied to clipboard!";
  } catch (err) {
    console.error("Copy failed", err);
    toast.textContent = "Copy failed!";
  }

  document.body.removeChild(textArea);

  toast.className = "toast show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
};

// --- Initial Setup ---
const initialize = () => {
  // Tab switching
  tabSingle.addEventListener("click", () => switchTab("single"));
  tabBulk.addEventListener("click", () => switchTab("bulk"));

  // Single row form
  singleForm.addEventListener("submit", handleSingleGenerate);
  addJsonBtn.addEventListener("click", addJsonInput);

  // Bulk form
  bulkForm.addEventListener("submit", handleBulkGenerate);

  // JSON input removal
  jsonInputsContainer.addEventListener("click", (e) => {
    if (e.target.closest(".remove-json-btn")) {
      removeJsonInput(e.target.closest(".remove-json-btn"));
    }
  });

  // Preview actions
  downloadBtn.addEventListener("click", handleDownload);
  copyBtn.addEventListener("click", handleCopy);

  // Initialize with single tab active
  switchTab("single");
};

document.addEventListener("DOMContentLoaded", initialize);
