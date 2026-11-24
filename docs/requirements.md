# Requirements: Bite UP

Project board: https://github.com/MarwanAhmedTalaat/Bite-UP
## 1. Roles

- **Customer:** A user who browses restaurants and menus, manages a shopping cart, places delivery or pickup orders, and tracks their orders.

- **Restaurant Owner:** A customer whose account has been upgraded to the Restaurant Owner role after submitting a restaurant registration application, receiving administrator approval, and completing account activation. The owner manages the restaurant menu, categories, offers, staff, and incoming orders.

- **Administrator:** Manages the platform, reviews restaurant registration applications, approves or rejects applications, and controls restaurant access to the platform.

## 2. User Stories

- **US-01:** As a customer, I want to browse approved restaurants in New Nubaria City so that I can discover available dining options and choose a restaurant. [Must]

- **US-02:** As a customer, I want to view a restaurant's menu so that I can explore its available food items and decide what to order. [Must]

- **US-03:** As a visitor, I want to create a customer account so that I can place orders and access my personal order information. [Must]

- **US-04:** As a registered user, I want to log in using my email and password or my Google account so that I can securely access the platform according to my account role. [Must]

- **US-05:** As a customer, I want to add menu items to my cart so that I can collect the food items I want to order before checkout. [Must]

- **US-06:** As a customer, I want to update item quantities and remove items from my cart so that I can adjust my order before checkout. [Must]

- **US-07:** As a customer, I want to place a delivery or pickup order using the items in my cart so that I can receive my selected food from the restaurant. [Must]

- **US-08:** As a customer, I want to view the status and history of my orders so that I can follow my current orders and review my previous purchases. [Should]

- **US-09:** As a customer who owns a restaurant, I want to submit a restaurant registration application so that I can request approval to register my restaurant on the platform and become a restaurant owner. [Must]

- **US-10:** As a restaurant owner, I want to manage my restaurant's menu categories and items so that I can keep the menu accurate and up to date for customers. [Must]

- **US-11:** As a restaurant owner, I want to view and manage incoming customer orders so that I can process orders and keep customers informed about their progress. [Must]

- **US-12:** As an administrator, I want to review restaurant registration applications and approve or reject them so that only approved restaurants can become available on the platform. [Must]

## 3. Acceptance Criteria

Top 5 stories. The full scenarios are available in the corresponding GitHub Issues.

### US-01 Browse Available Restaurants

```gherkin
Feature: Browse restaurants

  Scenario: Customer views approved restaurants
    Given there are approved restaurants on the platform
    When the customer opens the restaurants section
    Then the system displays the approved restaurants
    And each restaurant displays its name and available basic information

  Scenario: No approved restaurants are available
    Given there are no approved restaurants on the platform
    When the customer opens the restaurants section
    Then the system displays "No restaurants are currently available"

  Scenario: Pending restaurant is not displayed
    Given a restaurant has a pending registration application
    When the customer browses the restaurants section
    Then the restaurant is not displayed

  Scenario: Customer attempts to access an unapproved restaurant
    Given a restaurant has not been approved
    When the customer attempts to access its public page
    Then the system denies access to that restaurant
```

### US-02 View Restaurant Menu

```gherkin
Feature: View restaurant menu

  Scenario: Customer views a restaurant menu
    Given an approved restaurant has menu categories and items
    When the customer opens the restaurant's menu
    Then the system displays the restaurant's menu categories
    And displays the items under their respective categories

  Scenario: Customer views menu item details
    Given a restaurant has menu items with descriptions and prices
    When the customer selects a menu item
    Then the system displays the item's details
    And displays its current price

  Scenario: Restaurant has no available menu items
    Given an approved restaurant has no available menu items
    When the customer opens its menu
    Then the system displays "No menu items are currently available"

  Scenario: Customer views an unavailable menu item
    Given a menu item is marked as unavailable
    When the customer views the restaurant's menu
    Then the system indicates that the item is unavailable

  Scenario: Customer attempts to access an unapproved restaurant menu
    Given a restaurant has not been approved
    When the customer attempts to open its menu
    Then the system denies access to that menu
```

### US-05 Add Items to Cart

```gherkin
Feature: Add items to cart

  Scenario: Customer adds an available menu item
    Given a customer is viewing an available menu item
    When the customer adds the item to the cart
    Then the item is added to the cart
    And its name, price, and quantity are displayed

  Scenario: Customer adds the same item again
    Given a menu item is already in the customer's cart
    When the customer adds the same item again
    Then the item's quantity in the cart is increased by 1

  Scenario: Customer adds an add-on item
    Given a restaurant has an available add-on item with its own price
    When the customer adds that item to the cart
    Then the add-on is added as a regular cart item
    And its name and price are displayed

  Scenario: Customer tries to add an unavailable item
    Given a menu item is marked as unavailable
    When the customer tries to add it to the cart
    Then the system prevents the item from being added
    And informs the customer that the item is unavailable

  Scenario: Customer tries to add an item from another restaurant
    Given the customer's cart already contains items from one restaurant
    When the customer tries to add an item from a different restaurant
    Then the system prevents the item from being added
    And informs the customer that the cart can contain items from one restaurant only
```

### US-07 Place an Order

```gherkin
Feature: Place an order

  Scenario: Customer places a delivery order successfully
    Given the customer's cart contains items from one restaurant
    And all selected items are available
    And the customer provides the required delivery information
    When the customer confirms the delivery order
    Then the system creates a new order
    And saves a snapshot of the item prices used at checkout
    And calculates the subtotal, discount, and delivery fee
    And calculates the final order total
    And sets the order status to "Pending"
    And confirms that the order was placed successfully

  Scenario: Customer places a pickup order successfully
    Given the customer's cart contains available items from one restaurant
    When the customer confirms a pickup order
    Then the system creates a new order
    And saves a snapshot of the item prices used at checkout
    And sets the delivery fee to zero
    And sets the order status to "Pending"
    And confirms that the order was placed successfully

  Scenario: Customer attempts to place an order with an empty cart
    Given the customer's cart is empty
    When the customer attempts to place an order
    Then the system prevents the order from being placed
    And displays "Your cart is empty"

  Scenario: Customer attempts to order an unavailable item at checkout
    Given the customer's cart contains an item that is unavailable at checkout
    When the customer attempts to place the order
    Then the system prevents the order from being placed
    And informs the customer that the item is unavailable

  Scenario: Customer does not provide required delivery information
    Given the customer has items in the cart
    When the customer confirms a delivery order without the required delivery information
    Then the system prevents the order from being placed
    And identifies the missing information

  Scenario: Customer places an order with discounted items
    Given the customer's cart contains items eligible for valid offers
    When the customer confirms the order
    Then the system applies the applicable offers according to the agreed offer rules
    And calculates the discount amount
    And includes the discount in the final order total
```

### US-12 Review Restaurant Applications

```gherkin
Feature: Review restaurant applications

  Scenario: Administrator views pending applications
    Given there are restaurant registration applications with "Pending" status
    When the administrator opens the applications section
    Then the system displays all pending applications
    And shows the submitted restaurant information

  Scenario: Administrator approves an application
    Given a restaurant application has the status "Pending"
    When the administrator approves the application
    Then the application status changes to "Approved"
    And the system generates and sends an activation link to the applicant
    And the restaurant is not publicly available until the account activation is completed

  Scenario: Applicant activates an approved restaurant account
    Given the administrator has approved the applicant's restaurant application
    And the applicant has received an activation link
    When the applicant opens the valid activation link and completes activation
    Then the system upgrades the existing account role from "Customer" to "Restaurant Owner"
    And the account becomes eligible to access the Restaurant Owner Dashboard after the next login

  Scenario: Administrator rejects an application
    Given a restaurant application has the status "Pending"
    When the administrator rejects the application
    Then the application status changes to "Rejected"
    And the applicant's account remains a Customer account
    And the restaurant does not become available to customers

  Scenario: Administrator attempts to process an already reviewed application
    Given a restaurant application has already been approved or rejected
    When the administrator attempts to process the application again
    Then the system prevents the application from being processed again
```

## 4. Non-Functional Requirements

- **NFR-01 (Performance):** 95% of core API requests, including restaurant browsing, menu retrieval, cart operations, and order creation, must complete within 2.5 seconds under a load of 50 concurrent users, excluding external service response times. [Should]

- **NFR-02 (Security):** All user passwords must be stored using a secure password-hashing algorithm such as bcrypt. Protected operations must enforce role-based access control so that users cannot access resources or perform actions outside their assigned permissions. [Must]

- **NFR-03 (Data Integrity):** 100% of successfully created orders must preserve an accurate snapshot of item prices, quantities, discounts, delivery fees, and the final total at checkout. Subsequent menu price changes must not modify existing order records. [Must]

- **NFR-04 (Usability):** At least 80% of first-time test users who already have an account must be able to browse a restaurant, add an item to the cart, and complete the checkout process within 3 minutes without assistance. [Should]

- **NFR-05 (Compatibility):** The customer platform and restaurant dashboard must display their main functions correctly on supported screen widths from 360px to 1920px without horizontal scrolling or loss of essential functionality. [Should]

- **NFR-06 (Availability):** The platform must achieve at least 99% availability per calendar month, excluding planned maintenance announced in advance. [Should]

## 5. MVP Scope

### Must stories included in the MVP

- US-01: Browse Available Restaurants
- US-02: View Restaurant Menu
- US-03: Register Customer Account
- US-04: User Login
- US-05: Add Items to Cart
- US-06: Manage Cart Items
- US-07: Place an Order
- US-09: Submit Restaurant Registration Application
- US-10: Manage Restaurant Menu
- US-11: Manage Customer Orders
- US-12: Review Restaurant Applications

### Must NFRs included in the MVP

- NFR-02: Security
- NFR-03: Data Integrity

### Reason

These stories and non-functional requirements provide the essential functionality for the first release of Bite UP. Customers can discover restaurants, browse menus, create accounts, manage their carts, and place delivery or pickup orders. Restaurant owners can apply for registration, manage their menus, and process incoming orders after administrator approval. Administrators can review restaurant applications and control restaurant access to the platform.

Security ensures that user accounts, roles, and protected operations are handled safely. Data integrity ensures that order prices, quantities, discounts, delivery fees, and totals remain accurate after checkout.

The Should stories and non-functional requirements remain in the backlog for future improvements.