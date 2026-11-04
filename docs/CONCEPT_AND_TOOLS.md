# Bite UP --- Concept and Tools

## 1. Project Overview

**Bite UP** is a restaurant discovery and food ordering platform
designed for **New Nubaria City, Egypt**. It connects customers with
local restaurants through a single platform where they can discover
restaurants, explore menus, and place delivery or pickup orders.

## 2. The Problem

Finding suitable restaurants and deciding what to order can be
inconvenient when information about local restaurants and their menus is
scattered across different sources.

Customers may need to search through multiple pages or contact
restaurants directly to find menu details, availability, and ordering
information. Local restaurants also need a convenient way to present
their menus and manage incoming customer orders.

## 3. The Proposed Solution

Bite UP provides a centralized platform for discovering local
restaurants and ordering from them.

The platform aims to:

-   Allow visitors to browse available restaurants and view their menus.
-   Allow customers to create accounts, manage a cart, and place orders.
-   Support both delivery and pickup orders.
-   Provide restaurant owners with tools to manage menu items,
    categories, orders, restaurant settings, and staff permissions.
-   Provide an administrative workflow for reviewing restaurant
    registration applications.

The platform uses **cash payment only**, including cash on delivery and
cash on pickup.

## 4. Target Audience

The primary target audience is people living in or visiting **New
Nubaria City** who want to discover local restaurants and order food.

The platform also serves:

-   **Customers:** People who browse restaurants, explore menus, and
    place orders.
-   **Restaurant Owners:** Local restaurant owners who want to manage
    their restaurant presence, menus, and customer orders.
-   **Restaurant Staff:** Authorized employees who help manage
    restaurant operations according to permissions assigned by the
    owner.
-   **Platform Administrators:** People responsible for reviewing
    restaurant applications and managing platform onboarding.

## 5. Main Platform Capabilities

-   Public restaurant discovery and menu browsing.
-   Customer registration and login.
-   Shopping cart and order placement.
-   Delivery and pickup fulfillment.
-   Order status and order history.
-   Restaurant menu and category management.
-   Restaurant order management.
-   Restaurant staff and permission management.
-   Restaurant application review and activation workflow.
-   Offers and discounts.

## 6. Tools and Technologies (Tech Stack)

The following technologies and tools are used or selected for the
project:

  -----------------------------------------------------------------------
  Area                    Technology / Tool       Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React                   Building the user
                                                  interface.

  Frontend Tooling        Vite                    Frontend development
                                                  server and build
                                                  tooling.

  Programming Language    JavaScript              Application
                                                  development.

  UI Framework            Bootstrap               Responsive interface
                                                  styling and layout.

  Backend                 Node.js                 Server-side JavaScript
                                                  runtime.

  Backend Framework       Express.js              Building backend APIs
                                                  and handling HTTP
                                                  requests.

  Database                MongoDB                 Storing application
                                                  data.

  Database ODM            Mongoose                Defining and working
                                                  with MongoDB models.

  Object Storage          AWS S3                  Storing application
                                                  files and media.

  Version Control         Git                     Tracking source-code
                                                  changes.

  Code Hosting &          GitHub                  Repository hosting,
  Collaboration                                   issue tracking, and
                                                  team collaboration.

  System Design           Excalidraw              Creating and editing
                                                  system and UML
                                                  diagrams.
  -----------------------------------------------------------------------

## 7. Project Scope Notes

-   Bite UP is designed around restaurants operating in New Nubaria
    City.
-   Each restaurant has one branch in the current project scope.
-   A shopping cart and an order belong to one restaurant only.
-   Customers can choose delivery or pickup.
-   Payment is cash only; online payment gateways and digital wallets
    are outside the current scope.
-   Restaurant owners and staff access management capabilities according
    to their roles and permissions.

------------------------------------------------------------------------

*This document summarizes the project concept and the technologies
selected for its current scope. It does not replace the detailed
requirements or design documents.*
