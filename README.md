
<h1>Skylad Backend Assignment</h1>
<p>A comprehensive backend service for document management with folders, tags, OCR webhooks, and RBAC.</p>

<div class="section">
  <h2>Timeline</h2>
  <ul>
    <li><strong>Start Date:</strong> 2025‑01‑13</li>
    <li><strong>Submit Date:</strong> 2025‑01‑13</li>
  </ul>
</div>

<div class="section">
  <h2>Features</h2>

  <h3>1️⃣ Document &amp; Tagging Model</h3>
  <ul>
    <li>User, Document, Tag, and DocumentTag entities</li>
    <li>Each document must have exactly one primary tag</li>
    <li>Support for secondary tags</li>
    <li>Full‑text search with scope filtering</li>
  </ul>

  <h3>2️⃣ Scoped Actions</h3>
  <ul>
    <li>Run actions on folders or specific files</li>
    <li>Mock processor for generating documents and CSV files</li>
    <li>Usage tracking (5 credits per request)</li>
  </ul>

  <h3>3️⃣ OCR Webhook Ingestion</h3>
  <ul>
    <li>Content classification (official / ad)</li>
    <li>Automatic task creation for ads with unsubscribe info</li>
    <li>Rate limiting – 3 tasks per sender per day per user</li>
  </ul>

  <h3>4️⃣ RBAC &amp; Security</h3>
  <ul>
    <li>Roles: admin, support, moderator, user</li>
    <li>JWT‑based authentication</li>
    <li>Tenant isolation enforced at service level</li>
  </ul>

  <h3>5️⃣ Auditing &amp; Metrics</h3>
  <ul>
    <li>Comprehensive audit logging</li>
    <li>Metrics endpoint for system statistics</li>
  </ul>
</div>

<div class="section">
  <h2>Tech Stack</h2>
  <ul>
    <li><strong>Framework:</strong> NestJS (TypeScript)</li>
    <li><strong>Database:</strong> MongoDB with Mongoose</li>
    <li><strong>Authentication:</strong> JWT (Passport)</li>
    <li><strong>Validation:</strong> class-validator, class-transformer</li>
    <li><strong>API Documentation:</strong> Swagger/OpenAPI</li>
  </ul>
</div>

<div class="section">
  <h2>Setup</h2>

  <h3>Prerequisites</h3>
  <ul>
    <li>Node.js 18+</li>
    <li>MongoDB (or Docker)</li>
    <li>npm or yarn</li>
  </ul>

  <h3>Installation</h3>
  <pre><code># Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and set your MongoDB connection string
# Example for Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skylad?appName=Cluster0
# Example for local:
# MONGODB_URI=mongodb://localhost:27017/skylad
</code></pre>

  <h3>Running with Docker</h3>
  <pre><code># Start MongoDB and API
docker-compose up -d

# Seed the database
docker-compose exec api npm run seed
</code></pre>

  <h3>Running Locally</h3>
  <pre><code># Ensure MongoDB is running on localhost:27017
npm run dev          # starts the API at http://localhost:3000
npm run seed         # creates demo users and prints JWTs
</code></pre>

  <h3>Swagger Documentation</h3>
  <ul>
    <li>Interactive UI: <code>http://localhost:3000/api</code></li>
    <li>OpenAPI JSON: <code>http://localhost:3000/api-json</code></li>
    <li>OpenAPI YAML: <code>http://localhost:3000/api-yaml</code></li>
  </ul>
  <p>To export the Swagger JSON run <code>npm run swagger:export</code> (server must be running).</p>
</div>

<div class="section">
  <h2>Scripts</h2>
  <table>
    <thead>
      <tr><th>Command</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td><code>npm run dev</code></td><td>Start dev server with hot‑reload</td></tr>
      <tr><td><code>npm run build</code></td><td>Compile TypeScript for production</td></tr>
      <tr><td><code>npm run start:prod</code></td><td>Run the compiled production server</td></tr>
      <tr><td><code>npm run test</code></td><td>Run unit tests</td></tr>
      <tr><td><code>npm run test:e2e</code></td><td>Run end‑to‑end tests</td></tr>
      <tr><td><code>npm run lint</code></td><td>Linter</td></tr>
      <tr><td><code>npm run seed</code></td><td>Seed demo data + generate JWTs</td></tr>
      <tr><td><code>npm run token &lt;email&gt;</code></td><td>Generate a JWT for a specific user</td></tr>
      <tr><td><code>npm run test:api</code></td><td>API endpoint sanity checks (needs server)</td></tr>
      <tr><td><code>npm run swagger:export</code></td><td>Export OpenAPI JSON to <code>swagger.json</code></td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h2>Authentication</h2>
  <p>All <code>/v1</code> routes require a JWT Bearer token:</p>
  <pre><code>Authorization: Bearer &lt;your-jwt-token&gt;
</code></pre>

  <h3>Getting JWT Tokens</h3>
  <p><strong>Method 1 – Seed script (all demo users)</strong></p>
  <pre><code>npm run seed
# output includes tokens for admin, user1, user2, support
</code></pre>

  <p><strong>Method 2 – Generate a token for a specific user</strong></p>
  <pre><code># admin
npm run token admin@example.com

# user1
npm run token user1@example.com

# user2
npm run token user2@example.com

# support
npm run token support@example.com
</code></pre>

  <p>Demo users created by the seed script:</p>
  <ul>
    <li><code>admin@example.com</code> – admin role</li>
    <li><code>user1@example.com</code> – user role</li>
    <li><code>user2@example.com</code> – user role</li>
    <li><code>support@example.com</code> – support role</li>
  </ul>
</div>

<div class="section">
  <h2>API Reference</h2>
  <p>All endpoints are prefixed with <code>/v1</code> and require authentication.</p>

  <h3>Document APIs</h3>

  <h4>Upload Document</h4>
  <pre><code>POST /v1/docs
Content-Type: application/json
Authorization: Bearer &lt;token&gt;

{
  "filename": "invoice-2025-01.pdf",
  "mime": "application/pdf",
  "textContent": "Invoice content...",
  "primaryTag": "invoices-2025",
  "secondaryTags": ["january","billing"]
}
</code></pre>

  <h3>Folder &amp; Search APIs</h3>

  <h4>List Folders</h4>
  <pre><code>GET /v1/folders
Authorization: Bearer &lt;token&gt;
</code></pre>

  <p>Response example:</p>
  <pre><code>[
  { "name": "invoices-2025", "count": 5 },
  { "name": "legal",        "count": 2 }
]
</code></pre>

  <h4>Get Documents in a Folder</h4>
  <pre><code>GET /v1/folders/{tag}/docs
Authorization: Bearer &lt;token&gt;
</code></pre>
  <p>Example: <code>GET /v1/folders/invoices-2025/docs</code></p>

  <h4>Full‑Text Search</h4>
  <pre><code>GET /v1/search?q=invoice&scope=files&ids[]=doc1&ids[]=doc2
Authorization: Bearer &lt;token&gt;
</code></pre>
  <ul>
    <li><code>q</code> – required search term</li>
    <li><code>scope</code> – optional: <code>folder</code> or <code>files</code></li>
    <li><code>ids[]</code> – optional array of document IDs (only when <code>scope=files</code>)</li>
  </ul>
  <p class="note"><strong>Note:</strong> You cannot mix a folder scope with file IDs.</p>

  <h3>Actions APIs</h3>

  <h4>Run Scoped Action</h4>
  <pre><code>POST /v1/actions/run
Content-Type: application/json
Authorization: Bearer &lt;token&gt;

{
  "scope": {
    "type": "folder",
    "name": "invoices-2025"
  },
  "messages": [
    { "role": "user", "content": "make a CSV of vendor totals" }
  ],
  "actions": ["make_document","make_csv"]
}
</code></pre>

  <p>File‑scope example:</p>
  <pre><code>{
  "scope": {
    "type": "files",
    "ids": ["doc1","doc2"]
  },
  "messages": [...],
  "actions": ["make_document"]
}
</code></pre>
  <p class="note"><strong>Note:</strong> Folder scope and file IDs cannot be used together.</p>

  <h4>Get Monthly Usage</h4>
  <pre><code>GET /v1/actions/usage/month?year=2025&month=1
Authorization: Bearer &lt;token&gt;
</code></pre>

  <h3>OCR Webhook API</h3>
  <pre><code>POST /v1/webhooks/ocr
Content-Type: application/json
Authorization: Bearer &lt;token&gt;

{
  "source": "scanner-01",
  "imageId": "img_123",
  "text": "LIMITED TIME SALE… unsubscribe: mailto:stop@brand.com",
  "meta": { "address": "123 Main St" }
}
</code></pre>

  <h3>Metrics API</h3>
  <pre><code>GET /v1/metrics
Authorization: Bearer &lt;token&gt;
</code></pre>
  <p>Response example:</p>
  <pre><code>{
  "docs_total": 123,
  "folders_total": 7,
  "actions_month": 42,
  "tasks_today": 5
}
</code></pre>
  <p class="note"><strong>Note:</strong> Only users with <code>admin</code>, <code>support</code> or <code>moderator</code> roles may call this endpoint.</p>

  <h2>RBAC Roles</h2>
  <ul>
    <li><strong>user</strong> – CRUD on own docs/tags, run actions, view usage</li>
    <li><strong>support</strong> – Read‑only access</li>
    <li><strong>moderator</strong> – Read‑only access (future‑proof)</li>
    <li><strong>admin</strong> – Full access to everything</li>
  </ul>
</div>

<div class="section">
  <h2>Design Decisions &amp; Trade‑offs</h2>

  <h3>Architecture</h3>
  <ul>
    <li><strong>NestJS</strong> – modular, DI‑friendly, great TypeScript support.</li>
    <li><strong>MongoDB</strong> – flexible schema, built‑in text search.</li>
  </ul>

  <h3>Data Modeling</h3>
  <ul>
    <li><strong>Primary Tag Constraint</strong> – enforced in service layer via <code>isPrimary: true</code>. Application‑level validation gives clearer errors than a DB‑level unique index.</li>
    <li><strong>Tenant Isolation</strong> – every query automatically includes <code>{ ownerId: req.user.id }</code>, avoiding complex middleware.</li>
  </ul>

  <h3>Security</h3>
  <ul>
    <li><strong>JWT</strong> – stateless, perfect for API‑first services.</li>
    <li><strong>RBAC</strong> – implemented with NestJS guards and custom decorators.</li>
  </ul>

  <h3>Trade‑offs</h3>
  <table>
    <thead>
      <tr><th>Area</th><th>Current Choice</th><th>Production‑grade Alternative</th></tr>
    </thead>
    <tbody>
      <tr><td>Full‑text search</td><td>MongoDB text index</td><td>Elasticsearch</td></tr>
      <tr><td>Rate limiting</td><td>In‑process counters</td><td>Redis‑based distributed limiter</td></tr>
      <tr><td>Audit logging</td><td>Synchronous DB writes</td><td>Async queue (Kafka, RabbitMQ)</td></tr>
      <tr><td>Mock processor</td><td>Deterministic stub</td><td>Real LLM / AI service</td></tr>
      <tr><td>File storage</td><td>Metadata only</td><td>S3 / MinIO</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h2>Testing</h2>

  <h3>Unit Tests</h3>
  <pre><code>npm run test
</code></pre>

  <h3>End‑to‑End Tests</h3>
  <pre><code>npm run test:e2e
</code></pre>

  <h3>API Endpoint Tests</h3>
  <pre><code>npm run test:api   # server must be running (npm run dev)
</code></pre>

  <p>Tests validate:</p>
  <ul>
    <li>Folder vs file scope validation</li>
    <li>Primary‑tag uniqueness</li>
    <li>JWT isolation &amp; role enforcement</li>
    <li>OCR webhook classification &amp; rate‑limit logic</li>
    <li>Credits tracking on scoped actions</li>
  </ul>
</div>

<div class="section">
  <h2>What I'd Do Next (Given More Time)</h2>
  <ol>
    <li>Enhanced Search – integrate Elasticsearch.</li>
    <li>File Storage – connect to S3 / MinIO for real binary storage.</li>
    <li>Real OCR – replace mock classifier with a cloud OCR provider.</li>
    <li>Caching – Redis for hot data &amp; rate limiting.</li>
    <li>Monitoring – Prometheus metrics, OpenTelemetry tracing.</li>
    <li>CI/CD – GitHub Actions pipeline.</li>
    <li>Database Migrations – add a migration system.</li>
    <li>WebSockets – stream real‑time processing status.</li>
    <li>Batch Operations – bulk uploads and bulk actions.</li>
  </ol>
</div>

<div class="section">
  <h2>Project Structure</h2>
  <pre><code>src/
├── auth/              # JWT strategy, guards, decorators
│   ├── guards/
│   └── *.ts
├── documents/        # Document CRUD
│   ├── dto/
│   └── *.ts
├── actions/          # Scoped actions logic
├── webhooks/         # OCR webhook handling
├── metrics/          # Metrics controller
├── audit/            # Audit logging service
├── schemas/          # Mongoose schemas
└── scripts/          # seed, token generation, etc.
</code></pre>
</div>

<div class="section">
  <h2>Known Gaps &amp; Shortcuts</h2>
  <ul>
    <li><strong>File upload</strong> – only metadata is accepted; multipart handling is missing.</li>
    <li><strong>JWT generation</strong> – done via CLI scripts; a proper login endpoint is not present.</li>
    <li><strong>Error handling</strong> – generic HTTP exceptions; production would need richer error bodies.</li>
    <li><strong>Validation</strong> – some edge‑case scope checks could be stricter.</li>
    <li><strong>Indexes</strong> – basic indexes added; further tuning may be required for large datasets.</li>
  </ul>
</div>

<footer>
  © 2025 Skylad Team – MIT License
</footer>

</body>
</html>


