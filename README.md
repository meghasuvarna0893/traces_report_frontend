# HAR Analyzer Frontend

A simple React frontend for the HAR Analyzer backend.

## Features

- Clean, modern UI
- Real-time HAR file analysis
- Response code statistics
- Error analysis
- Latency analysis
- Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Usage

1. Make sure the Flask backend is running on port 5000
2. Enter the path to your HAR file (default: `trace.har`)
3. Click "Analyze" to process the file
4. View the results in the dashboard

## API Endpoints

The frontend communicates with the following backend endpoints:

- `POST /api/analyze` - Analyze HAR file

## Development

This is a simple React app built with:
- React 18
- Axios for API calls
- CSS Grid for responsive layout
- No external UI libraries 

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main component
│   ├── App.css         # Component styles
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── package.json
└── README.md
```
