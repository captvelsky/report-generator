# Project: Custom Report Generator

## Project Overview

This project is a web-based utility for generating custom CSV reports. It features a user-friendly interface where users can define column headers, specify the number of records, and choose a delimiter. The application intelligently generates random data based on common header names (e.g., "name", "email", "amount"). Users can preview the generated data and then copy it to the clipboard or download it as a CSV file.

The frontend is built with plain HTML, CSS, and JavaScript, utilizing the Tailwind CSS framework for styling.

## Building and Running

This is a client-side project and does not require a build process or a special server.

To run the project:

1.  Open the `index.html` file directly in a web browser.

There are no build scripts or dependencies to install.

## Development Conventions

*   **Styling**: The project uses [Tailwind CSS](https://tailwindcss.com/) for most of its styling, with a few additional custom styles in `styles.css`.
*   **JavaScript**: The core logic is contained in `script.js`. It follows a modular pattern with clear separation of concerns for DOM manipulation, data generation, UI rendering, and event handling.
*   **Data Generation**: The `generateSmartValue` function in `script.js` is the core of the data generation logic. It uses a set of predefined data pools and regular expression matching on header names to produce contextually relevant data.
*   **File Naming**: The project follows standard web conventions with `index.html`, `styles.css`, and `script.js` as the primary files.
