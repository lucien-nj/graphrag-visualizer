# GraphRAG Visualizer

👉 [GraphRAG Visualizer](https://noworneverev.github.io/graphrag-visualizer/)<br/>
👉 [GraphRAG Visualizer Demo](https://www.youtube.com/watch?v=Hjx1iTZZtzw)

![demo](public/demo.png)

## Overview

GraphRAG Visualizer is an application designed to visualize Microsoft [GraphRAG](https://github.com/microsoft/graphrag) artifacts. By uploading parquet files generated from the GraphRAG indexing pipeline, users can easily view and analyze data without needing additional software or scripts.

## Important Note

If you are using **GraphRAG 0.3.x or below**, please use the legacy version of GraphRAG Visualizer available at:  
👉 [GraphRAG Visualizer Legacy](https://noworneverev.github.io/graphrag-visualizer-legacy)

## Features

- **Graph Visualization**: View the graph in 2D or 3D in the "Graph Visualization" tab.
- **Data Tables**: Display data from the parquet files in the "Data Tables" tab.
- **Search Functionality**: Fully supports search, allowing users to focus on specific nodes or relationships.
- **Local Processing**: All artifacts are processed locally on your machine, ensuring data security and privacy.

## Using the Search Functionality

Once the [graphrag-api](https://github.com/noworneverev/graphrag-api) server is up and running, you can perform searches directly through the GraphRAG Visualizer. Simply go to the [GraphRAG Visualizer](https://noworneverev.github.io/graphrag-visualizer/) and use the search interface to query the API server. This allows you to easily search and explore data that is hosted on your local server.

![search](public/search.png)

## Graph Data Model

The logic for creating relationships for text units, documents, communities, and covariates is derived from the [GraphRAG import Neo4j Cypher notebook](https://github.com/microsoft/graphrag/blob/main/examples_notebooks/community_contrib/neo4j/graphrag_import_neo4j_cypher.ipynb).

### Nodes

| Node      | Type           |
| --------- | -------------- |
| Document  | `RAW_DOCUMENT` |
| Text Unit | `CHUNK`        |
| Community | `COMMUNITY`    |
| Finding   | `FINDING`      |
| Covariate | `COVARIATE`    |
| Entity    | _Varies_       |

### Relationships

| Source Node | Relationship    | Target Node |
| ----------- | --------------- | ----------- |
| Entity      | `RELATED`       | Entity      |
| Text Unit   | `PART_OF`       | Document    |
| Text Unit   | `HAS_ENTITY`    | Entity      |
| Text Unit   | `HAS_COVARIATE` | Covariate   |
| Community   | `HAS_FINDING`   | Finding     |
| Entity      | `IN_COMMUNITY`  | Community   |

## Developer Instructions

### Setting Up the Project

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/noworneverev/graphrag-visualizer.git
   cd graphrag-visualizer
   ```

2. Install the necessary dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm start
   ```

4. Open the app in your browser:
   ```
   http://localhost:3000
   ```

### Loading Parquet Files

To load `.parquet` files automatically when the application starts, place your Parquet files in the `public/artifacts` directory. These files will be loaded into the application for visualization and data table display. The files can be organized as follows:

- GraphRAG v2.x.x
  - `public/artifacts/entities.parquet`
  - `public/artifacts/relationships.parquet`
  - `public/artifacts/documents.parquet`
  - `public/artifacts/text_units.parquet`
  - `public/artifacts/communities.parquet`
  - `public/artifacts/community_reports.parquet`
  - `public/artifacts/covariates.parquet`

- GraphRAG v1.x.x
  - `public/artifacts/create_final_entities.parquet`
  - `public/artifacts/create_final_relationships.parquet`
  - `public/artifacts/create_final_documents.parquet`
  - `public/artifacts/create_final_text_units.parquet`
  - `public/artifacts/create_final_communities.parquet`
  - `public/artifacts/create_final_community_reports.parquet`
  - `public/artifacts/create_final_covariates.parquet`

If the files are placed in the `public/artifacts` folder, the app will automatically load and display them on startup.

### Loading from an Arbitrary Local Directory

If your GraphRAG output directory is located elsewhere on your machine and you do not want to copy the files into `public/artifacts`, you can specify an **absolute path** via the `REACT_APP_ARTIFACTS_DIR` environment variable. This works in development mode (`npm start`) by mapping the local directory to the `/artifacts` URL path.

**Usage:**

- **macOS / Linux:**

  ```bash
  REACT_APP_ARTIFACTS_DIR=/absolute/path/to/your/graphrag/output npm start
  ```

- **Windows (Command Prompt):**

  ```cmd
  set REACT_APP_ARTIFACTS_DIR=C:\absolute\path\to\your\graphrag\output
  npm start
  ```

- **Windows (PowerShell):**

  ```powershell
  $env:REACT_APP_ARTIFACTS_DIR="C:\absolute\path\to\your\graphrag\output"
  npm start
  ```

When `REACT_APP_ARTIFACTS_DIR` is set, the development server will serve files from that directory at the `/artifacts` URL, so the app can fetch them just like the default `public/artifacts` folder. There is no need to copy or duplicate your data.

### Loading from a Custom URL

If you are hosting your parquet files on a separate local server (e.g., a Python HTTP server or Nginx), you can set the `REACT_APP_ARTIFACTS_URL` environment variable to the base URL:

```bash
REACT_APP_ARTIFACTS_URL=http://localhost:8080/my-data npm start
```

The app will then attempt to load parquet files from:
- `http://localhost:8080/my-data/create_final_*.parquet`
- `http://localhost:8080/my-data/*.parquet`
