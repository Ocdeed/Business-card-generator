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
  setupCustomFields();
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
  try {
    const container = document.createElement("div");
    const qr = new QRCode(container, {
      text: data,
      width: 64,
      height: 64,
      colorDark: settings.textColor,
      colorLight: settings.bgColor === "#ffffff" ? "#ffffff" : "#f8f9fa",
      correctLevel: QRCode.CorrectLevel.H,
      quietZone: 2,
      quietZoneColor: "transparent",
    });

    // Add subtle pattern to QR code
    const canvas = container.querySelector("canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.globalCompositeOperation = "overlay";
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, `${settings.accentColor}22`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return container.firstChild.toDataURL();
  } catch (error) {
    console.error("QR Code generation failed:", error);
    return null;
  }
}

function formatUrl(url) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function updatePreview() {
  const preview = document.getElementById("cardPreview");
  preview.className = `template-${settings.template}`;
  preview.style.fontFamily = settings.font;

  // Generate QR code and prepare contact info
  const contactInfo = `BEGIN:VCARD\nVERSION:3.0\nFN:${cardData.name}\nORG:${cardData.company}\nTEL:${cardData.phone}\nEMAIL:${cardData.email}\nURL:${cardData.website}\nEND:VCARD`;
  const qrCodeURL = generateQRCode(contactInfo);

  preview.innerHTML = `
      <div class="card-content">
          ${
            cardData.logo
              ? `
              <div class="logo">
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
                  ? `
                  <p title="${cardData.email}">
                      <i class="fas fa-envelope"></i>
                      <span>${cardData.email}</span>
                  </p>
              `
                  : ""
              }
              ${
                cardData.phone
                  ? `
                  <p title="${cardData.phone}">
                      <i class="fas fa-phone"></i>
                      <span>${cardData.phone}</span>
                  </p>
              `
                  : ""
              }
              ${
                cardData.address
                  ? `
                  <p title="${cardData.address}">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>${cardData.address}</span>
                  </p>
              `
                  : ""
              }
              ${
                cardData.website
                  ? `
                  <p title="${cardData.website}">
                      <i class="fas fa-globe"></i>
                      <a href="${cardData.website}" target="_blank">${formatUrl(
                      cardData.website
                    )}</a>
                  </p>
              `
                  : ""
              }
              ${getCustomFieldsHTML()}
          </div>

          ${
            qrCodeURL
              ? `
              <div class="qr-code-container">
                  <img src="${qrCodeURL}" alt="Contact QR Code" class="qr-code">
                  <span class="qr-tooltip">Scan for contact</span>
              </div>
          `
              : ""
          }
      </div>
  `;
}

// Add helper function for custom fields HTML
function getCustomFieldsHTML() {
  return cardData.custom
    .map((field) => {
      let icon = "fa-star";
      switch (field.type) {
        case "link":
          icon = "fa-link";
          break;
        case "social":
          icon = "fa-share-alt";
          break;
      }
      return `
        <p class="custom-field-preview" title="${field.label}: ${field.value}">
            <i class="fas ${icon}"></i>
            ${
              field.type === "link"
                ? `<a href="${field.value}" target="_blank">${field.label}</a>`
                : `<span>${field.label}: ${field.value}</span>`
            }
        </p>
    `;
    })
    .join("");
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

// Add custom fields functionality
function setupCustomFields() {
  const addFieldBtn = document.getElementById("addField");
  const customFieldsContainer = document.getElementById("customFields");

  addFieldBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Custom Field';

  addFieldBtn.addEventListener("click", () => {
    const fieldId = `custom-${Date.now()}`;
    const fieldHTML = `
          <div class="custom-field" id="${fieldId}">
              <div class="custom-field-header">
                  <input type="text" 
                         class="custom-field-label" 
                         placeholder="Field Label"
                         aria-label="Custom field label">
                  <button type="button" class="delete-field" aria-label="Delete field">
                      <i class="fas fa-times"></i>
                  </button>
              </div>
              <div class="custom-field-type">
                  <button type="button" class="field-type active" data-type="text">
                      <i class="fas fa-font"></i> Text
                  </button>
                  <button type="button" class="field-type" data-type="link">
                      <i class="fas fa-link"></i> Link
                  </button>
                  <button type="button" class="field-type" data-type="social">
                      <i class="fas fa-share-alt"></i> Social
                  </button>
              </div>
              <input type="text" 
                     class="custom-field-value" 
                     placeholder="Field Value"
                     aria-label="Custom field value">
          </div>
      `;

    customFieldsContainer.insertAdjacentHTML("beforeend", fieldHTML);

    // Setup new field event listeners
    const newField = document.getElementById(fieldId);
    setupCustomFieldListeners(newField);
  });
}

function setupCustomFieldListeners(fieldElement) {
  const typeButtons = fieldElement.querySelectorAll(".field-type");
  const deleteBtn = fieldElement.querySelector(".delete-field");
  const label = fieldElement.querySelector(".custom-field-label");
  const value = fieldElement.querySelector(".custom-field-value");

  // Type selection
  typeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      typeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateFieldType(value, btn.dataset.type);
    });
  });

  // Delete field
  deleteBtn.addEventListener("click", () => {
    fieldElement.style.animation = "slideDown 0.3s ease-out reverse";
    setTimeout(() => {
      fieldElement.remove();
      updatePreview();
    }, 300);
  });

  // Update on input
  [label, value].forEach((input) => {
    input.addEventListener(
      "input",
      debounce(() => {
        cardData.custom = getCustomFieldsData();
        saveData();
        updatePreview();
      }, 300)
    );
  });
}

function updateFieldType(input, type) {
  switch (type) {
    case "link":
      input.type = "url";
      input.placeholder = "https://...";
      break;
    case "social":
      input.type = "text";
      input.placeholder = "@username";
      break;
    default:
      input.type = "text";
      input.placeholder = "Field Value";
  }
}

function getCustomFieldsData() {
  const fields = document.querySelectorAll(".custom-field");
  return Array.from(fields).map((field) => ({
    label: field.querySelector(".custom-field-label").value,
    value: field.querySelector(".custom-field-value").value,
    type: field.querySelector(".field-type.active").dataset.type,
  }));
}
