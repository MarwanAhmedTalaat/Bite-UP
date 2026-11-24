# Bite UP

Bite UP is a web-based restaurant discovery and food ordering platform focused on New Nubaria City, Egypt.

The platform provides a centralized place for customers to discover local restaurants, browse menus and offers, and place delivery or pickup orders. It also enables restaurant owners to manage their restaurant operations, while administrators handle restaurant registration and onboarding.

## Project Overview

Local restaurant information, menus, and ordering options are often spread across different channels. Bite UP aims to bring these interactions into one platform, making restaurant discovery and food ordering more accessible to customers and easier to manage for restaurant owners.

The initial release is designed for a single city and supports three user roles:

- **Customer** — Browses restaurants and menus, manages a cart, and places orders.
- **Restaurant Owner** — Manages restaurant information, menu items, offers, staff permissions, and incoming orders.
- **Administrator** — Reviews restaurant registration applications and manages the onboarding process.

## Core Functionality

### Restaurant Discovery
- Browse publicly available restaurants without authentication.
- View restaurant profiles and availability.
- Explore menu categories, items, prices, and active offers.

### Customer Ordering
- Manage a shopping cart associated with a single restaurant.
- Place delivery or pickup orders.
- Manage saved delivery addresses.
- View order status and order history.
- Respond to order modification requests when an item becomes unavailable.

### Restaurant Operations
- Submit a restaurant registration application.
- Manage restaurant profile and availability.
- Create and manage menu categories and items.
- Configure combo meals and offers.
- Receive and manage customer orders.
- Manage restaurant staff and their assigned permissions.

### Administration
- Review restaurant registration applications.
- Approve or reject applications.
- Manage the restaurant onboarding process.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| UI Framework | Bootstrap |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Object Storage | Amazon S3 |
| Version Control | Git, GitHub |
| System Design | Excalidraw |

## Architecture

The application is designed as a **Modular Monolith**, with feature-oriented modules and clear separation between frontend and backend responsibilities.

The backend follows a layered structure:

- **Controller Layer** — Handles HTTP requests and responses.
- **Service Layer** — Implements application workflows and business rules.
- **Repository Layer** — Encapsulates database access.

Authorization and resource ownership are enforced on the backend to ensure that users can only perform operations permitted by their roles and assigned permissions.

The architecture prioritizes maintainability and clear separation of concerns without introducing distributed-system complexity that is not required by the project's scope.

## Key Domain Rules

Some of the main rules shaping the system design include:

- Public restaurant browsing does not require authentication.
- Authentication is required to place an order.
- Each order belongs to one customer and one restaurant.
- A cart cannot contain items from multiple restaurants.
- Orders support delivery and pickup.
- The initial release supports cash payments only.
- Menu and price information is preserved in order item snapshots.
- Restaurant registration requires administrator approval.
- Restaurant staff permissions are enforced by the backend.

## Project Documentation

System analysis and design documentation is maintained alongside the project.

| Document | Description |
|---|---|
| [`Team.md`](Team.md) | Project team information and responsibilities |
| [`CONCEPT_AND_TOOLS.md`](CONCEPT_AND_TOOLS.md) | Project concept, objectives, and selected technologies |
| [`docs/requirements.md`](docs/requirements.md) | Functional requirements, user stories, acceptance criteria, and non-functional requirements |

The system design also includes the following diagrams:

- System Context Diagram
- Container Diagram
- Entity Relationship Diagram (ERD)
- Use Case Diagram
- UML Class Diagram
- Order State Diagram

## Project Scope

The initial release is limited to a web application serving New Nubaria City.

The following are outside the current scope:

- Native mobile applications.
- Multiple branches per restaurant.
- Map-based addresses and delivery zones.
- Online payments and payment gateway integrations.
- Microservices and unnecessary distributed infrastructure.

## Development Status

The project is currently in the requirements and system design stage. The core requirements, business rules, and primary design diagrams have been prepared.

Implementation will proceed according to the agreed development plan.

## Repository

[GitHub Repository](https://github.com/MarwanAhmedTalaat/Bite-UP)
