# AI-Based Public Grievance Redressal Portal Backend

A production-ready Node.js & Express.js backend utilizing MySQL and Sequelize ORM. Features automated nodal officer assignment based on active workloads and districts, mock OCR/image categorization AI service abstraction, role-based JWT security, and file processing.

---

## Technical Stack
- **Engine**: Node.js & Express.js (Modular MVC architecture)
- **Database**: MySQL & Sequelize ORM
- **Authentication**: JWT & Role-Based Authorization Access (`CITIZEN`, `OFFICER`, `DEPARTMENT_ADMIN`)
- **Security**: bcrypt, helmet, rate-limiting, and express-validator parameters sanitation
- **File Uploads**: Multer
- **Log management**: winston & morgan

---

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your database credentials:
   ```bash
   cp .env.example .env
   ```

3. **Initialize Database Schema (Migrations)**:
   This utility synchronizes the Sequelize models with the MySQL server, dropping existing schemas and preparing clean tables:
   ```bash
   npm run migrate
   ```

4. **Seed Default Data**:
   Seeds 38 Tamil Nadu districts, 12 default departments, department admins, nodal officers, citizens, and test complaints:
   ```bash
   npm run seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## Environment Variables (.env)
- `PORT`: Server port (default `5000`)
- `NODE_ENV`: Runtime environment (`development` / `production`)
- `DB_HOST`: MySQL host
- `DB_PORT`: MySQL port
- `DB_NAME`: Database schema name (`grievance_portal`)
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: Signing token key passphrase
- `JWT_EXPIRES_IN`: Duration token remains valid (e.g. `1d`)
- `AI_SERVICE_URL`: Port url for the Python classifier microservice (default `http://localhost:8000`)

---

## API Documentation Summary

### 1. Authentication Endpoints
- `POST /api/auth/citizen/register`: Signup citizen
- `POST /api/auth/citizen/login`: JWT login for citizens
- `POST /api/auth/admin/login`: JWT login for departmental admins
- `POST /api/auth/officer/login`: JWT login for nodal officers

### 2. Citizen Services (requires Citizen role)
- `GET /api/citizens/me`: Fetch profile details
- `PUT /api/citizens/me`: Update profile details
- `PUT /api/citizens/change-password`: Change password
- `POST /api/complaints`: Lodge a new grievance (with image attachments)
- `GET /api/complaints/my`: Track my grievances list (with pagination)
- `POST /api/complaints/:id/feedback`: Submit feedback score rating (1-5) and comments (re-opens or closes complaint)

### 3. Nodal Officer Console (requires Officer role)
- `GET /api/officer/dashboard`: Summary stats (assigned, pending, resolved counts)
- `GET /api/officer/complaints`: View complaints assigned to the officer's department and district
- `PATCH /api/officer/complaints/:id/accept`: Mark status to ACCEPTED
- `PATCH /api/officer/complaints/:id/start`: Mark status to IN_PROGRESS
- `PATCH /api/officer/complaints/:id/hold`: Mark status to ON_HOLD
- `PATCH /api/officer/complaints/:id/escalate`: Mark status to ESCALATED (notifies Admin)
- `PATCH /api/officer/complaints/:id/resolve`: Mark status to RESOLVED (notifies Citizen)
- `POST /api/officer/complaints/:id/resolution-image`: Upload resolved photo proof

### 4. Departmental Admin Console (requires Department Admin role)
- `GET /api/admin/dashboard`: Overview bento stats for the entire department
- `GET /api/admin/complaints`: Query all departmental complaints (across districts with filters)
- `POST /api/admin/officers`: Create a new regional nodal officer
- `GET /api/admin/officers`: List departmental officers and workloads
- `PUT /api/admin/officers/:id`: Update officer records
- `PATCH /api/admin/officers/:id/status`: Deactivate/activate officers
- `GET /api/admin/reports/overview`: Summary stats exports
- `GET /api/admin/reports/districts`: District-wise complaints charts data
- `GET /api/admin/reports/officers`: Officer SLA performance logs
- `GET /api/admin/reports/trends`: Monthly complaints trends graphs data

---

## Security Validation Tests

Run unit-assertion scripts mimicking unauthorized requests (e.g. cross-district or cross-department access attempts) and verifying boundary security locks:
```bash
npm test
```
Outputs passing checks:
- ✓ Citizen A accesses Citizen A's complaint
- ✓ Citizen B accesses Citizen A's complaint (denied 403)
- ✓ Highways Salem Officer accesses Salem complaint
- ✓ Highways Erode Officer accesses Salem complaint (denied 403)
- ✓ Water Supply Salem Officer accesses Highways complaint (denied 403)
- ✓ Highways Admin accesses Highways complaint
- ✓ Water Supply Admin accesses Highways complaint (denied 403)
