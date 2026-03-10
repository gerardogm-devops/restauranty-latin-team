# Security & Compliance Documentation

## Restauranty - Microservices DevOps Project

---

## 1. IAM & Access Control

### Azure RBAC
- Access to the AKS cluster (`restauranty-latino-aks`) is managed through Azure Role-Based Access Control (RBAC).
- Team members are assigned the **Azure Kubernetes Service Cluster User** role, which grants kubectl access without full admin privileges.
- No root or owner-level credentials are shared among team members.

### Kubernetes RBAC
- All application resources are deployed within a dedicated `restauranty` namespace to isolate them from other workloads in the cluster.
- Service accounts are scoped per namespace to prevent cross-namespace access.

### GitHub Access
- Repository access is managed through GitHub collaborator roles.
- Branch protection rules are applied to the `main` and `integration` branches, requiring pull request reviews before merging.

---

## 2. Secret Management

### Local Development
- Sensitive credentials (MongoDB URI, Cloudinary API keys, JWT secret) are stored in `.env` files.
- All `.env` files are listed in `.gitignore` to prevent accidental commits to the repository.
- `.env.example` files are provided as templates without real values.

### Kubernetes (Production)
- Credentials are stored as Kubernetes Secrets (`app-secrets`) within the `restauranty` namespace.
- The `secrets.yaml` file in the repository contains placeholder values (`CHANGE_ME`) — real credentials are injected at deployment time.
- Secrets are mounted as environment variables in pods, not as files.

### CI/CD Pipeline
- Docker Hub credentials and Azure service principal credentials are stored in GitHub Actions Secrets.
- Cloudinary credentials are also stored in GitHub Actions Secrets and injected during the deployment step.
- No credentials are hardcoded in workflow files.

### Best Practices Followed
- Credentials are never committed to Git in any branch.
- Each environment (local, CI/CD, Kubernetes) has its own mechanism for secret injection.
- Secrets are rotated by updating the corresponding store (GitHub Secrets, Kubernetes Secrets).

---

## 3. Network Security

### Kubernetes NetworkPolicies
- Only the Ingress controller is exposed to public traffic on port 80.
- Backend microservices (auth, discounts, items) are accessible only within the cluster through ClusterIP services.
- MongoDB is not exposed externally — it is only reachable by backend pods within the `restauranty` namespace.

### Azure NSGs
- The AKS cluster is deployed within a Virtual Network (VNet) configured by Terraform.
- Network Security Groups (NSGs) restrict inbound traffic to only necessary ports.
- SSH access to cluster nodes is disabled by default.

### Traffic Flow
```
Internet → Ingress Controller (port 80) → NGINX routes by path:
    /api/auth/*       → auth-service:3001       (ClusterIP, internal only)
    /api/discounts/*  → discounts-service:3002   (ClusterIP, internal only)
    /api/items/*      → items-service:3003       (ClusterIP, internal only)
    /*                → frontend-service:80      (ClusterIP, internal only)

All services → mongo-service:27017 (ClusterIP, internal only)
```

---

## 4. TLS / HTTPS

### Current State
- The application is currently served over HTTP through the NGINX Ingress Controller.
- For a production deployment, TLS should be enabled using one of the following approaches:

### Recommended Approach
- Install **cert-manager** in the cluster to automatically provision and renew Let's Encrypt TLS certificates.
- Configure the Ingress resource with TLS annotations:
  ```yaml
  metadata:
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod
  spec:
    tls:
      - hosts:
          - restauranty.example.com
        secretName: restauranty-tls
  ```
- Alternatively, use **Azure-managed certificates** through Application Gateway.

---

## 5. Authentication & Authorization

### JWT-Based Authentication
- The **auth microservice** handles user registration and login.
- Upon successful login, a JSON Web Token (JWT) is issued to the client.
- The JWT secret is stored in Kubernetes Secrets and injected as an environment variable.

### Middleware Validation
- The **discounts** and **items** microservices validate JWT tokens through middleware before processing requests.
- Requests without a valid token receive a 401 Unauthorized response.
- Tokens are passed in the HTTP Authorization header.

---

## 6. Container Security

### Image Practices
- All container images use `node:20-alpine` as the base image, which has a minimal attack surface.
- The frontend uses a multi-stage build: the React app is built in a Node.js stage and served by `nginx:alpine`.
- Backend Dockerfiles use multi-stage builds to exclude development dependencies from production images.
- Images are pushed to Docker Hub and pulled by AKS during deployment.

### Runtime Security
- Containers run as non-root users where possible.
- No privileged containers are used in the deployment.
- Resource limits should be configured to prevent resource exhaustion attacks.

---

## 7. Data Storage & Encryption

### MongoDB
- MongoDB is deployed within the Kubernetes cluster as a stateful workload with persistent storage (PersistentVolumeClaim).
- Data is stored on Azure-managed disks, which provide encryption at rest by default.
- MongoDB access control is not enabled in the current configuration (development setup). For production, authentication should be enabled with:
  - `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` environment variables.
  - Connection strings updated to include credentials.

### Cloudinary
- User-uploaded images (restaurant menu photos) are stored in Cloudinary, a third-party cloud service.
- Cloudinary credentials are managed through Kubernetes Secrets.
- Images are served over HTTPS by Cloudinary's CDN.

---

## 8. GDPR Compliance

### Data Collected
- **User data**: email, username, and hashed passwords (stored in MongoDB).
- **Application data**: menu items, orders, discount campaigns, and coupons (stored in MongoDB).
- **Images**: menu item photos (stored in Cloudinary).

### Data Location
- MongoDB data resides in the AKS cluster hosted in the Azure region configured by Terraform.
- Image data is stored in Cloudinary's infrastructure (see Cloudinary's privacy policy for data center locations).

### User Rights
- Under GDPR, users have the right to access, rectify, and delete their personal data.
- The auth microservice provides endpoints for user management.
- For a production deployment, the following should be implemented:
  - A data export endpoint (right to data portability).
  - A user deletion endpoint that removes all associated data from MongoDB and Cloudinary (right to erasure).
  - A privacy policy page on the frontend.

### Data Processing
- Passwords are hashed using **bcryptjs** before storage — plain text passwords are never stored.
- JWT tokens have an expiration time to limit exposure in case of token theft.

---

## 9. Monitoring & Incident Response

### Monitoring
- **Prometheus** scrapes metrics from all backend microservices via their `/metrics` endpoints.
- **Grafana** dashboards visualize HTTP request counts, response times, and error rates.
- Alerts can be configured in Grafana to notify the team of anomalies (e.g., spike in 5xx errors).

### Logging
- All services log to stdout, which Kubernetes captures automatically.
- Logs can be queried using `kubectl logs` or centralized through Azure Monitor.

### Incident Response
- In case of a security incident:
  1. Identify the affected service through monitoring dashboards and logs.
  2. Isolate the affected pod(s) by scaling the deployment to zero.
  3. Rotate any compromised credentials (JWT secret, Cloudinary keys, MongoDB credentials).
  4. Redeploy with updated secrets.
  5. Document the incident and remediation steps.

---

## 10. Summary Table

| Area | Tool / Approach | Status |
|------|----------------|--------|
| IAM | Azure RBAC + K8s namespaces | Implemented |
| Secrets (local) | .env files in .gitignore | Implemented |
| Secrets (K8s) | Kubernetes Secrets | Implemented |
| Secrets (CI/CD) | GitHub Actions Secrets | Implemented |
| Network | ClusterIP services + Ingress | Implemented |
| TLS/HTTPS | cert-manager (recommended) | Planned |
| Authentication | JWT via auth microservice | Implemented |
| Data encryption at rest | Azure managed disks | Default |
| Password hashing | bcryptjs | Implemented |
| GDPR compliance | Partial (hashing, data isolation) | Partial |
| Monitoring | Prometheus + Grafana | Implemented |
| Logging | stdout + kubectl logs | Implemented |

---

*Document prepared by the Restauranty Latin Team.*
*Last updated: March 2026.*