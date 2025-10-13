# Report Generator

The Report Generator is a web-based tool designed to streamline the creation of CSV reports from JSON data. It provides a user-friendly interface for generating reports in various formats, catering to both single-row and bulk data generation needs. This tool is ideal for developers, data analysts, and anyone requiring quick and customizable CSV report generation.

## Features

- **Multiple Generation Modes**: Supports both single-row and bulk report generation to accommodate different use cases.
- **Customizable Report Types**: Easily extendable to support various report formats through a simple configuration-based system.
- **Flexible Delimiter Support**: Allows users to choose from common delimiters such as comma, semicolon, tab, and pipe.
- **User-Friendly Interface**: An intuitive and easy-to-navigate interface for a seamless user experience.
- **Data Preview**: Displays a preview of the generated data before downloading, ensuring accuracy and correctness.
- **Copy to Clipboard**: Provides an option to copy the generated CSV data directly to the clipboard.
- **Download as CSV**: Enables users to download the generated report as a CSV file with a customizable file name.

## How to Use

### Single Row Generation

1.  **Select the "Single Row" Tab**: This is the default mode for generating a report from one or more distinct JSON objects.
2.  **Choose a Report Type**: Select the desired report format from the "Report Type" dropdown menu.
3.  **Enter JSON Data**: Paste your JSON data into the provided text area. You can add multiple JSON inputs by clicking the "+ Add Another JSON" button. Each JSON object will correspond to a single row in the generated report.
4.  **Configure Options**:
    -   **CSV Delimiter**: Choose the delimiter for the CSV file.
    -   **CSV File Name**: Enter a name for your report file.
5.  **Generate Report**: Click the "Generate Report" button to see a preview of the data.
6.  **Download or Copy**: Once you are satisfied with the preview, you can either download the report as a CSV file or copy the data to your clipboard.

### Bulk Generation

1.  **Select the "Bulk Generation" Tab**: Switch to this mode if you need to generate a large number of records based on a single JSON template.
2.  **Choose a Report Type**: Select the desired report format.
3.  **Enter JSON Template**: Paste a single JSON object that will serve as a template for all the records.
4.  **Configure Options**:
    -   **Number of Records**: Specify how many rows to generate.
    -   **CSV Delimiter**: Choose the delimiter for the CSV file.
    -   **CSV File Name**: Enter a name for your report file.
5.  **Generate Report**: Click the "Generate Report" button.
6.  **Download or Copy**: Review the data and then download or copy it.

## How to Add New Report Type

Adding a new report type is a straightforward process that involves creating a configuration file and updating the main report index.

### 1. Create a New Report Configuration File

-   In the `reports` directory, create a new JavaScript file (e.g., `my-report.js`).
-   Inside this file, define a configuration object with two main properties: `headers` and `mappings`.

    -   **`headers`**: An array of strings representing the column headers for your CSV report.
    -   **`mappings`**: An object that defines how to populate the data for each header. The keys should correspond to the headers defined in the `headers` array. The values can be either:
        -   A string representing the path to the value in the input JSON (e.g., `"feRequest.clientId"`).
        -   A function that takes the JSON data as an argument and returns the desired value. This is useful for complex transformations or conditional logic.

**Example: `my-report.js`**

```javascript
const MyReport = {
  headers: [
    "TRANSACTION_DATE",
    "CLIENT_ID",
    "TRANSACTION_TYPE",
    "AMOUNT",
    "ADMIN_FEE",
  ],
  mappings: {
    TRANSACTION_DATE: "feResponse.data.tglTransaksi",
    CLIENT_ID: "feRequest.clientId",
    TRANSACTION_TYPE: "feRequest.jenisTransaksi",
    AMOUNT: (jsonData) => toDecimalString(getValueFromPath(jsonData, "feRequest.amount")),
    ADMIN_FEE: (jsonData) => toDecimalString(getValueFromPath(jsonData, "feRequest.surcharge")),
  },
};
```

### 2. Register the New Report Type

-   Open the `reports/index.js` file.
-   Import your new report configuration and add it to the `window.REPORT_CONFIGS` object. The key should be the name you want to display in the "Report Type" dropdown, and the value should be the configuration object you just created.

**Example: `reports/index.js`**

```javascript
// ... other imports

window.REPORT_CONFIGS = {
  ReportPegadaianBayar,
  // ReportPegadaianCicil,
  // ReportBrimoASDP,
  MyReport, // Add your new report here
};
```

### 3. Update `index.html`

-   Finally, add a new `<option>` in the "Report Type" select dropdowns in `index.html` for both single and bulk generation.

**Example: `index.html`**

```html
<select id="single-report-type" name="single-report-type" class="...">
    <option value="">Select Report Type</option>
    <option value="ReportPegadaianBayar">Report Pegadaian Bayar</option>
    <option value="MyReport">My Report</option> <!-- Add new option here -->
</select>
```

By following these steps, you can easily extend the Report Generator to support any number of custom report formats.
