# ⚡ netcn CDN

A lightweight CDN library that brings .NET Toolbox controls into any web application as interactive web components.
Integrate classic and modern .NET controls effortlessly without heavy framework dependencies.
Embed full-featured tools, standard controls, and practical demos with just two lines of HTML.

## 🚀 Quick Start

Include the CSS stylesheet and JS engine in your HTML, then declare a container `div` with your desired `data-tool`:

```html
<link rel="stylesheet" href="https://bhandarihansraj.github.io/netcn/cdn/toolbox.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://bhandarihansraj.github.io/netcn/cdn/toolbox-engine.js"></script>

<div class="netcn-toolbox" data-tool="aspnet-generator"></div>
<div class="netcn-toolbox" data-tool="parking-lot"></div>
```

## 🛠️ Available Tools

| Tool ID | Control / Demo | Description |
| :--- | :--- | :--- |
| `aspnet-generator` | Project Generator | Spring Initializr-style ASP.NET project generator. Customize and download .zip files! |
| `parking-lot` | Parking Lot Board | Kanban-style board with Add, Edit, Remove, and Drag & Drop support |
| `standard-controls` | Standard Controls | All 15 .NET Standard Toolbox controls (Button, Label, TextBox, CheckBox, etc.) |
| `aspnet-practicals` | ASP.NET Practicals | Interactive demos of 9 ASP.NET practical assignments |

## ✨ Features

- 🔄 **Drag & Drop**: Smooth drag-and-drop interactions built into components.
- 💾 **State Persistence**: Automatic state saving using browser `localStorage`.
- 🛡️ **XSS Protection**: Secure rendering utilizing safe DOM text node operations.
- 📱 **Responsive Design**: Modern responsive CSS layouts for mobile and desktop screens.

## 📄 License

Distributed under the [MIT License](https://opensource.org/licenses/MIT).

---

Built with ❤️ by [Bhandarihansraj](https://github.com/Bhandarihansraj) • [GitHub Repo](https://github.com/Bhandarihansraj/netcn) • [CDN Base](https://bhandarihansraj.github.io/netcn/)
