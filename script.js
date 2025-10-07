// --- DOM Elements ---
const tabSingle = document.getElementById("tab-single");
const tabBulk = document.getElementById("tab-bulk");
const tabContentSingle = document.getElementById("tab-content-single");
const tabContentBulk = document.getElementById("tab-content-bulk");
const singleForm = document.getElementById("single-generator-form");
const singleReportTypeSelect = document.getElementById("single-report-type");
const jsonInputsContainer = document.getElementById("json-inputs-container");
const addJsonBtn = document.getElementById("add-json-btn");
const singleDelimiterSelect = document.getElementById("single-delimiter");
const singleFileNameInput = document.getElementById("single-file-name");
const bulkForm = document.getElementById("bulk-generator-form");
const bulkReportTypeSelect = document.getElementById("bulk-report-type");
const bulkJsonInput = document.getElementById("bulk-json-input");
const bulkRecordCountInput = document.getElementById("bulk-record-count");
const bulkDelimiterSelect = document.getElementById("bulk-delimiter");
const bulkFileNameInput = document.getElementById("bulk-file-name");
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

// --- Core Logic ---
const generateReportRow = (reportType, headers, mappings, jsonData) => {
  const row = {};
  headers.forEach((header) => {
    let value;
    const mapping = mappings[header];

    if (typeof mapping === 'function') {
      value = mapping(jsonData);
    } else if (mapping && !mapping.includes(".")) {
      value = mapping;
    } else {
      value = getValueFromPath(jsonData, mapping);
    }

    row[header] = value !== null ? String(value) : "";
  });
  return row;
};

// --- UI Rendering ---
const renderPreview = () => {
  previewHeader.innerHTML = "";
  previewBody.innerHTML = "";

  if (generatedData.length === 0) {
    previewContainer.classList.add("hidden");
    actionButtons.classList.add("hidden");
    noDataMessage.classList.remove("hidden");
    return;
  }

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

  generatedData.forEach((rowData) => {
    const tr = document.createElement("tr");
    generatedHeaders.forEach((header) => {
      const td = document.createElement("td");
      td.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-700";
      td.textContent = rowData[header];
      tr.appendChild(td);
    });
    previewBody.appendChild(tr);
  });

  previewContainer.classList.remove("hidden");
  actionButtons.classList.remove("hidden");
  noDataMessage.classList.add("hidden");
};

const arrayToCsv = (headers, data, delimiter) => {
  const headerRow = headers.join(delimiter);
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? "";
        return String(value)
          .replace(/\r?\n|\r/g, " ")
          .replace(/"/g, "''");
      })
      .join(delimiter)
  );
  return [headerRow, ...dataRows].join("\n");
};

// --- Tab Management ---
const switchTab = (activeTab) => {
  const isSingle = activeTab === "single";
  tabSingle.className = `flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
    isSingle
      ? "bg-white text-blue-700 shadow-sm"
      : "text-gray-500 hover:text-gray-700"
  }`;
  tabBulk.className = `flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
    !isSingle
      ? "bg-white text-blue-700 shadow-sm"
      : "text-gray-500 hover:text-gray-700"
  }`;
  tabContentSingle.classList.toggle("hidden", !isSingle);
  tabContentBulk.classList.toggle("hidden", isSingle);
};

// --- JSON Input Management ---
let jsonInputCount = 1;

const addJsonInput = () => {
  jsonInputCount++;
  const newIndex = jsonInputCount;
  const jsonInputGroup = document.createElement("div");
  jsonInputGroup.className = "json-input-group";
  jsonInputGroup.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm text-gray-600">JSON #${newIndex}</span>
      <button type="button" class="remove-json-btn text-red-500 hover:text-red-700 p-1 rounded-full">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
    <textarea name="json-input" rows="4" class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-mono" placeholder="Paste your JSON data here..."></textarea>
  `;
  jsonInputsContainer.appendChild(jsonInputGroup);
  updateRemoveButtons();
};

const removeJsonInput = (button) => {
  button.closest(".json-input-group").remove();
  jsonInputCount--;
  updateJsonInputNumbers();
  updateRemoveButtons();
};

const updateJsonInputNumbers = () => {
  document.querySelectorAll(".json-input-group").forEach((group, index) => {
    group.querySelector("span").textContent = `JSON #${index + 1}`;
  });
};

const updateRemoveButtons = () => {
  const removeButtons = document.querySelectorAll(".remove-json-btn");
  removeButtons.forEach((btn) =>
    btn.classList.toggle("hidden", removeButtons.length === 1)
  );
};

// --- Event Handlers ---
const handleSingleGenerate = (e) => {
  e.preventDefault();
  const reportType = singleReportTypeSelect.value;
  if (!reportType) {
    alert("Please select a report type");
    return;
  }

  const config = window.REPORT_CONFIGS[reportType];
  if (!config || config.headers.length === 0) {
    alert("Selected report type is not configured yet");
    return;
  }

  const jsonInputs = Array.from(
    jsonInputsContainer.querySelectorAll('textarea[name="json-input"]')
  );
  generatedHeaders = config.headers;
  generatedData = [];

  jsonInputs.forEach((textarea, index) => {
    const jsonInputValue = textarea.value.trim();
    if (!jsonInputValue) return;

    try {
      const jsonData = JSON.parse(jsonInputValue);
      const row = generateReportRow(
        reportType,
        config.headers,
        config.mappings,
        jsonData
      );
      generatedData.push(row);
    } catch (error) {
      alert(
        `Invalid JSON format in JSON #${index + 1}. Please check your input.`
      );
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
  const recordCount = parseInt(bulkRecordCountInput.value, 10);

  if (!reportType) {
    alert("Please select a report type");
    return;
  }

  if (!jsonInputValue) {
    alert("Please enter JSON data");
    return;
  }

  const config = window.REPORT_CONFIGS[reportType];
  if (!config || config.headers.length === 0) {
    alert("Selected report type is not configured yet");
    return;
  }

  try {
    const jsonData = JSON.parse(jsonInputValue);
    generatedHeaders = config.headers;
    generatedData = Array.from({ length: recordCount }, () =>
      generateReportRow(reportType, config.headers, config.mappings, jsonData)
    );
    renderPreview();
  } catch (error) {
    alert("Invalid JSON format. Please check your input.");
  }
};

const handleDownload = () => {
  if (generatedData.length === 0) return;

  const isSingleTab = !tabContentSingle.classList.contains("hidden");
  const delimiter = isSingleTab
    ? singleDelimiterSelect.value
    : bulkDelimiterSelect.value;
  const fileName =
    (isSingleTab
      ? singleFileNameInput.value.trim()
      : bulkFileNameInput.value.trim()) || "report";
  const finalFileName = fileName.toLowerCase().endsWith(".csv")
    ? fileName
    : `${fileName}.csv`;

  const csvContent = arrayToCsv(generatedHeaders, generatedData, delimiter);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = finalFileName;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 0);
};

const handleCopy = () => {
  if (generatedData.length === 0) return;

  const isSingleTab = !tabContentSingle.classList.contains("hidden");
  const delimiter = isSingleTab
    ? singleDelimiterSelect.value
    : bulkDelimiterSelect.value;
  const csvContent = arrayToCsv(generatedHeaders, generatedData, delimiter);

  navigator.clipboard
    .writeText(csvContent)
    .then(() => {
      toast.textContent = "Copied to clipboard!";
      toast.className = "toast show";
      setTimeout(() => {
        toast.className = toast.className.replace("show", "");
      }, 3000);
    })
    .catch((err) => {
      console.error("Copy failed", err);
      toast.textContent = "Copy failed!";
      toast.className = "toast show";
      setTimeout(() => {
        toast.className = toast.className.replace("show", "");
      }, 3000);
    });
};

// --- Initial Setup ---
const initialize = () => {
  tabSingle.addEventListener("click", () => switchTab("single"));
  tabBulk.addEventListener("click", () => switchTab("bulk"));
  singleForm.addEventListener("submit", handleSingleGenerate);
  addJsonBtn.addEventListener("click", addJsonInput);
  bulkForm.addEventListener("submit", handleBulkGenerate);
  jsonInputsContainer.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-json-btn");
    if (removeBtn) removeJsonInput(removeBtn);
  });
  downloadBtn.addEventListener("click", handleDownload);
  copyBtn.addEventListener("click", handleCopy);

  switchTab("single");
  updateRemoveButtons();
};

document.addEventListener("DOMContentLoaded", initialize);
