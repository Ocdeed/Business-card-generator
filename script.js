// Data Structure
let cardData = {
  name: "",
  title: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  logo: "",
  custom: [],
};

let settings = {
  template: "minimalist",
  bgColor: "#ffffff",
  textColor: "#000000",
  accentColor: "#007bff",
  font: "Roboto",
  logoPos: "left",
  format: "png",
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadSavedData();
  setupEventListeners();
  updatePreview();
});

// Load saved data
function loadSavedData() {
  const savedData = localStorage.getItem("cardData");
  const savedSettings = localStorage.getItem("cardSettings");
  if (savedData) cardData = JSON.parse(savedData);
  if (savedSettings) settings = JSON.parse(savedSettings);

  // Populate form fields
  Object.keys(cardData).forEach((key) => {
    const input = document.getElementById(key);
    if (input && key !== "custom" && key !== "logo") {
      input.value = cardData[key];
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Form inputs
  document.querySelectorAll('input:not([type="file"])').forEach((input) => {
    input.addEventListener(
      "input",
      debounce((e) => {
        cardData[e.target.id] = e.target.value;
        saveData();
        updatePreview();
      }, 300)
    );
  });

  // Logo upload
  const logoInput = document.getElementById("logo");
  const dropZone = document.getElementById("dropZone");

  logoInput.addEventListener("change", handleLogoUpload);
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleLogoUpload({ target: { files: [file] } });
    }
  });

  // Customization controls
  document.getElementById("template").addEventListener("change", (e) => {
    settings.template = e.target.value;
    saveSettings();
    updatePreview();
  });

  // Color pickers
  ["bgColor", "textColor", "accentColor"].forEach((id) => {
    document.getElementById(id).addEventListener("input", (e) => {
      settings[id] = e.target.value;
      saveSettings();
      updatePreview();
    });
  });

  // Download button
  document
    .getElementById("downloadBtn")
    .addEventListener("click", downloadCard);

  // Font selection
  document.getElementById("font").addEventListener("change", (e) => {
    settings.font = e.target.value;
    saveSettings();
    updatePreview();
  });

  // Template selection
  document.getElementById("template").addEventListener("change", (e) => {
    settings.template = e.target.value;
    // Auto-adjust colors based on template
    switch (e.target.value) {
      case "bold":
        settings.textColor = "#ffffff";
        settings.bgColor = "#1e1e1e";
        break;
      case "neon":
        settings.textColor = "#ffffff";
        settings.accentColor = "#00ff00";
        break;
    }
    // Update color pickers
    document.getElementById("textColor").value = settings.textColor;
    document.getElementById("bgColor").value = settings.bgColor;
    document.getElementById("accentColor").value = settings.accentColor;
    saveSettings();
    updatePreview();
  });
}

// Handle logo upload
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      cardData.logo = e.target.result;
      saveData();
      updatePreview();
    };
    reader.readAsDataURL(file);
  }
}

// Add QR code generation
function generateQRCode(data) {
  const qr = new QRCode(document.createElement("div"), {
    text: data,
    width: 64,
    height: 64,
  });
  return qr._el.firstChild.toDataURL();
}

// Enhanced preview update
function updatePreview() {
  const preview = document.getElementById("cardPreview");
  preview.className = `template-${settings.template}`;
  preview.style.fontFamily = settings.font;

  // Generate QR code
  const contactInfo = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.name}
ORG:${cardData.company}
TEL:${cardData.phone}
EMAIL:${cardData.email}
URL:${cardData.website}
END:VCARD`;

  const qrCodeURL = generateQRCode(contactInfo);

  // Single side layout with all information
  preview.innerHTML = `
      <div class="card-content">
          ${
            cardData.logo
              ? `
              <div class="logo" data-position="${settings.logoPos}">
                  <img src="${cardData.logo}" alt="Logo">
              </div>
          `
              : ""
          }
          
          <div class="main-info">
              <h1 style="color: ${settings.textColor}">${
    cardData.name || "Your Name"
  }</h1>
              <p class="title" style="color: ${settings.accentColor}">${
    cardData.title || "Your Title"
  }</p>
              <p class="company">${cardData.company || "Company Name"}</p>
          </div>

          <div class="contact-info">
              ${
                cardData.email
                  ? `<p><i class="fas fa-envelope"></i> ${cardData.email}</p>`
                  : ""
              }
              ${
                cardData.phone
                  ? `<p><i class="fas fa-phone"></i> ${cardData.phone}</p>`
                  : ""
              }
              ${
                cardData.address
                  ? `<p><i class="fas fa-map-marker-alt"></i> ${cardData.address}</p>`
                  : ""
              }
              ${
                cardData.website
                  ? `<p><i class="fas fa-globe"></i> ${cardData.website}</p>`
                  : ""
              }
          </div>

          ${
            qrCodeURL
              ? `<div class="qr-code-container">
              <img src="${qrCodeURL}" alt="Contact QR Code" class="qr-code">
          </div>`
              : ""
          }
      </div>
  `;
}

// Add color scheme presets
const colorSchemes = {
  professional: { bg: "#ffffff", text: "#000000", accent: "#007bff" },
  creative: { bg: "#2c3e50", text: "#ecf0f1", accent: "#e74c3c" },
  elegant: { bg: "#f8f9fa", text: "#2c3e50", accent: "gold" },
  modern: { bg: "#000000", text: "#ffffff", accent: "#00ff00" },
};

function applyColorScheme(scheme) {
  const colors = colorSchemes[scheme];
  settings.bgColor = colors.bg;
  settings.textColor = colors.text;
  settings.accentColor = colors.accent;
  document.getElementById("bgColor").value = colors.bg;
  document.getElementById("textColor").value = colors.text;
  document.getElementById("accentColor").value = colors.accent;
  saveSettings();
  updatePreview();
}

// Show loading overlay during download
function showLoadingOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";
  overlay.innerHTML = '<div class="loading-spinner"></div>';
  document.body.appendChild(overlay);
  return overlay;
}

// Simplified download function for single side
async function downloadCard() {
  const overlay = showLoadingOverlay();
  const preview = document.getElementById("cardPreview");
  const format = document.getElementById("format").value;

  try {
    const canvas = await html2canvas(preview, {
      scale: 3,
      backgroundColor: settings.bgColor,
    });

    // Download
    const link = document.createElement("a");
    if (format === "jpg") {
      link.href = canvas.toDataURL("image/jpeg", 0.9);
    } else {
      link.href = canvas.toDataURL("image/png");
    }
    link.download = `business_card_${Date.now()}.${format}`;
    link.click();
    showDownloadSuccess();
  } finally {
    overlay.remove();
  }
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function saveData() {
  localStorage.setItem("cardData", JSON.stringify(cardData));
}

function saveSettings() {
  localStorage.setItem("cardSettings", JSON.stringify(settings));
}

function showDownloadSuccess() {
  const notification = document.createElement("div");
  notification.className = "success-notification";
  notification.textContent = "Card Downloaded!";
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}
