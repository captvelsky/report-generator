// --- DOM Elements ---
const form = document.getElementById('generator-form');
const headersContainer = document.getElementById('headers-container');
const addHeaderBtn = document.getElementById('add-header-btn');
const recordCountInput = document.getElementById('record-count');
const delimiterSelect = document.getElementById('delimiter');
const fileNameInput = document.getElementById('file-name');
const previewContainer = document.getElementById('preview-container');
const previewHeader = document.getElementById('preview-header');
const previewBody = document.getElementById('preview-body');
const noDataMessage = document.getElementById('no-data');
const actionButtons = document.getElementById('action-buttons');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');

// --- State ---
let generatedData = [];
let generatedHeaders = [];

// --- INTELLIGENT DATA GENERATION ---

// --- Data Pools ---
const FIRST_NAMES = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hadi', 'Indah', 'Joko'];
const LAST_NAMES = ['Santoso', 'Wijaya', 'Kusuma', 'Lestari', 'Setiawan', 'Pratama', 'Nugroho', 'Wahyuni', 'Susanti', 'Hakim'];
const CITIES = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar'];
const STREET_NAMES = ['Jalan Sudirman', 'Jalan Thamrin', 'Jalan Gatot Subroto', 'Jalan Diponegoro'];
const STATUSES = ['SUCCESS', 'FAILED', 'PENDING', 'SETTLEMENT', 'CANCELLED', 'EXPIRED'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'bri.co.id'];

// --- Utility Functions for Data Generation ---
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomAmount = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const randomString = (length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
};
const randomFullName = () => `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
const randomEmail = () => `${randomItem(FIRST_NAMES).toLowerCase()}.${randomInt(1,99)}@${randomItem(DOMAINS)}`;
const randomPhoneNumber = () => `08${randomInt(10, 99)}${randomString(8, '0123456789')}`;
const randomDate = (start = new Date(2022, 0, 1), end = new Date()) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomId = (prefix = 'ID') => `${prefix}${Date.now()}${randomInt(100, 999)}`;
const randomAddress = () => `${randomItem(STREET_NAMES)} No. ${randomInt(1, 150)}, ${randomItem(CITIES)}`;

const generateSmartValue = (header) => {
    const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/gi, ''); // Sanitize header
    
    if (lowerHeader.includes('email')) return randomEmail();
    if (lowerHeader.includes('name')) return randomFullName();
    if (lowerHeader.includes('phone') || lowerHeader.includes('mobile') || lowerHeader.includes('nomorhp')) return randomPhoneNumber();
    if (lowerHeader.includes('amount') || lowerHeader.includes('price') || lowerHeader.includes('balance') || lowerHeader.includes('harga') || lowerHeader.includes('total')) return randomAmount(10000, 5000000);
    if (lowerHeader.includes('date') || lowerHeader.includes('time') || lowerHeader.includes('waktu') || lowerHeader.includes('tanggal')) return randomDate().toISOString().slice(0, 19).replace('T', ' ');
    if (lowerHeader.includes('status')) return randomItem(STATUSES);
    if (lowerHeader.includes('id') || lowerHeader.includes('ref') || lowerHeader.includes('nomor') || lowerHeader.includes('trx')) return randomId(header.substring(0,3).toUpperCase());
    if (lowerHeader.includes('address') || lowerHeader.includes('alamat')) return randomAddress();
    if (lowerHeader.includes('city') || lowerHeader.includes('kota')) return randomItem(CITIES);
    if (lowerHeader.includes('code') || lowerHeader.includes('kode')) return randomString(6).toUpperCase();
    
    // Fallback for unrecognized headers
    return randomString(12);
};


// --- UI Rendering ---
const renderPreview = () => {
    if (generatedData.length === 0) {
        previewContainer.classList.add('hidden');
        actionButtons.classList.add('hidden');
        noDataMessage.classList.remove('hidden');
        return;
    }

    previewHeader.innerHTML = '';
    previewBody.innerHTML = '';

    const headerRow = document.createElement('tr');
    generatedHeaders.forEach(header => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        th.textContent = header;
        headerRow.appendChild(th);
    });
    previewHeader.appendChild(headerRow);

    generatedData.forEach(row => {
        const tr = document.createElement('tr');
        generatedHeaders.forEach(header => {
            const td = document.createElement('td');
            td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700';
            td.textContent = row[header];
            tr.appendChild(td);
        });
        previewBody.appendChild(tr);
    });
    
    previewContainer.classList.remove('hidden');
    actionButtons.classList.remove('hidden');
    noDataMessage.classList.add('hidden');
};

const arrayToCsv = (headers, data, delimiter) => {
    const csvRows = [];
    csvRows.push(headers.join(delimiter));
    data.forEach(row => {
        const values = headers.map(header => {
            const val = row[header] || '';
            const escaped = val.toString().replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(delimiter));
    });
    return csvRows.join('\n');
};

// --- Event Handlers ---
const handleAddHeader = () => {
    const div = document.createElement('div');
    div.className = 'header-input-group';
    div.innerHTML = `
        <input type="text" name="header" class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" placeholder="Column name" required>
        <button type="button" class="remove-header-btn text-red-500 hover:text-red-700 p-1.5 rounded-full">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </button>
    `;
    headersContainer.appendChild(div);
};

headersContainer.addEventListener('click', (e) => {
    if (e.target.closest('.remove-header-btn')) {
        e.target.closest('.header-input-group').remove();
    }
});

const handleGenerate = (e) => {
    e.preventDefault();
    
    const headerInputs = headersContainer.querySelectorAll('input[name="header"]');
    generatedHeaders = Array.from(headerInputs).map((input, i) => input.value.trim() || `column_${i + 1}`);
    
    const recordCount = parseInt(recordCountInput.value, 10);
    
    generatedData = Array.from({ length: recordCount }, () => {
        const row = {};
        generatedHeaders.forEach(header => {
            row[header] = generateSmartValue(header);
        });
        return row;
    });

    renderPreview();
};

const handleDownload = () => {
    if (generatedData.length === 0) return;
    const delimiter = delimiterSelect.value;
    const csvContent = arrayToCsv(generatedHeaders, generatedData, delimiter);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    let fileName = fileNameInput.value.trim() || 'report';
    if (!fileName.toLowerCase().endsWith('.csv')) {
        fileName += '.csv';
    }
    link.download = fileName;
    
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
    const delimiter = delimiterSelect.value;
    const csvContent = arrayToCsv(generatedHeaders, generatedData, delimiter);
    
    const textArea = document.createElement('textarea');
    textArea.value = csvContent;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
        toast.textContent = "Copied to clipboard!";
    } catch (err) {
        console.error('Copy failed', err);
        toast.textContent = "Copy failed!";
    }
    
    document.body.removeChild(textArea);
    
    toast.className = "toast show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
};

// --- Initial Setup ---
const initialize = () => {
    addHeaderBtn.addEventListener('click', handleAddHeader);
    form.addEventListener('submit', handleGenerate);
    downloadBtn.addEventListener('click', handleDownload);
    copyBtn.addEventListener('click', handleCopy);
    // Trigger initial generation for demo
    form.dispatchEvent(new Event('submit'));
};

document.addEventListener('DOMContentLoaded', initialize);
