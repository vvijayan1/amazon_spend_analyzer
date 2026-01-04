# Amazon Purchase History Analyzer (Frontend-Only)

## Introduction
Amazon provides its subscribers with downloadable data files containing detailed information about their physical and digital order history. This includes product names, delivery addresses, order dates, prices paid, billing details, invoices, and return information.

The retail order history is provided as a CSV file. This project aims to build a web application that allows users to upload this file and generate meaningful insights into their purchasing behavior. To ensure user privacy, the entire operation must be performed on the frontend, with no data being transmitted, stored, or processed on any backend or external service.

---

## Objective
To create a privacy-first, client-side web application that enables users to analyze their Amazon retail order history and visualize spending patterns across time.

---

## Audience
- Individual Amazon users
- Privacy-conscious users
- Users interested in personal spending analysis

---

## Scope & Constraints
- Frontend-only implementation
- No backend services or APIs
- No persistence of user data
- All data processed in-memory and cleared on refresh

---

## Input

### File Type
- CSV (Amazon Retail Order History)

Give specific instructions about the expected format of the CSV file as Amazon has several files for different purposes. This one is retail order history.

### CSV Characteristics
- Comma-separated values
- Fields may contain commas escaped using double quotes

### Expected Columns in the data file
"Website","OrderID","OrderDate","PurchaseOrderNumber","Currency","UnitPrice","UnitPriceTax","ShippingCharge","TotalDiscounts","TotalOwed","ShipmentItemSubtotal","ShipmentItemSubtotalTax","ASIN","ProductCondition","Quantity","PaymentInstrumentType","OrderStatus","ShipmentStatus","ShipDate","ShippingOption","ShippingAddress","BillingAddress","CarrierName&TrackingNumber","ProductName","GiftMessage","GiftSenderName","GiftRecipientContactDetails","ItemSerialNumber"



---

## User Controls
- CSV file upload
- Timeframe selection:
  - Year range (from–to)
  - Optional month or date-range filter

---

## Data Processing
- Parse CSV in-browser
- Parse `OrderDate` into date objects
- Convert monetary fields to numeric values
- Use `TotalOwed` as the spend metric
- Derive:
  - Year
  - Month
  - Day of week

---

## Outputs & Visualizations

### 1. Total Spend by Year
- Bar chart
- X-axis: Year
- Y-axis: Total spend; take the column `TotalOwed`

### 2. Spend by Month
- Bar chart
- X-axis: Month
- Y-axis: Total spend
- Used to identify seasonal spending trends

### 3. Purchases by Day of Week
- Pie chart
- Show percentage distribution of purchases by weekday
- Example: Monday 40%, Sunday 20% of total purchases. This is not the value of the purchases, but the count of purchases made on each day.

### 4. Extreme Purchases
- Top 5 highest-value purchases; while calculating the highest value purchases, skip the rows which have the "Order Status" as "Cancelled".
- Top 5 lowest-value purchases; while calculating the lowest spends, skip the rows which have the "Order Status" as "Cancelled". Do not take 0 value purchases into account.

### 5. Payment type distribution
- Pie chart showing distribution of payment types used; use the column `Payment Instrument Type`. The distrubution should be based on the value in the `TotalOwed` column and not number of items.

- Displayed as tables with:
  - Product name; take the column `Product Name`
  - Order date; take the column `OrderDate`
  - Amount spent; take the column `TotalOwed`

Make sure that the currency used to display is the one where the most amount of purchases have happened. So, if a user has made 10 purchases in USD and 3 purchases in EUR, all amounts should be displayed in USD. Also, the currency symbol should be shown alongside the amounts.

The dates displayed should be in the format "DD MMM YYYY", e.g., "05 Jan 2020".



---

## Output Summary
- Interactive charts rendered entirely in-browser
- No data storage beyond the active session

---

## Non-Goals
- No authentication or user accounts
- No data export or sharing
- No backend analytics or tracking

---

## Privacy Considerations
- No data leaves the user's browser
- No cookies, localStorage, or IndexedDB usage
- Data exists only in memory during the session

---

## Key Takeaways
- Enables users to understand long-term spending behavior
- Demonstrates client-side analytics on sensitive data
- Ensures privacy by design

---

## Future Enhancements (Optional)
- Category-wise spending breakdown
- Product-level clustering
- Locally generated downloadable reports (PDF/PNG)
