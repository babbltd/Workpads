**Logic of Workpads**


A Workpad, in its simplest form, is the story of a single exchange, recorded in binary using standardized sets of 32 and 64 bits. Its standard sequencing ensures reliable and resilient transmission using all mediums such as bluetooth, radio and serial, free from any dependencies on supplementary data. The record interprets the record.

The compression of exchange information into binary reduces the use of electricity at all scales, allowing for better performance of all devices involved in the creation, storage and transmission of business records. It also achieves greater fidelity over large distances.

Each exchange has a value as well as a quantity which is oftentimes simply "1". Treatment of the value and quantity will be reviewed in the next section. 

For both participants in the exchange, the value must be accounted for using general principles. Does the value represent an increase or decrease in assets, expenses, or sales? Is the exchange equity-related? Does the exchange value, in whole or in part, represent a liability? The variable types of exchange are: Sale Complete, Sale Pending, Expense Complete, Expense Pending, Equity Increase Complete, Equity Increase Pending, Equity Decrease Complete, and Equity Decrease Pending. Sales and Expenses are often refunded which must also provide for. Regular Sales should be differentiated from Other Sales at minimum. Expenses for Sales (ie Cost of Goods Sold) and Operational Expenses also benefit from special markers. This together provides for a basic chart of accounts which we can number this way:

1. Assets
2. Sales
3. Other Sales
4. Sales Expenses
5. Operating Expenses
6. Equity (ie Investment)
7. General Liabilities
8. Authority Liabilities

Most of these variations can be provided for using a simple 3 flag scheme. For a short Accounting Sequence of bits, let us assume:

- the first position represents 0 as Out and 1 as In
- the second position represents 0 as Past and 1 as Future
- the third position represents 0 as Out and 1 as In
- the first position symbolizes the business or entity
- the third position symbolizes the owner or operator when position 1 and 3 are opposite

Using this scheme above:

- In Past In represents Sale with Assets Increased
- In Future In represents Future Sale with Assets Increased
- In Past Out represents Equity Increase with Assets Increased
- In Future Out represents Future Equity Increase with Assets Increased
- Out Past In represents Expense with Equity Decreased
- Out Future In represents Future Expense with Equity Decreased
- Out Past Out represents an Expense with Assets Decreased
- Out Future Out represents Future Expense with Assets Decreased

This gives us a notation style of "I > O", "O < O", etc.

We must still allow for identifying types of sales (sales, other), expenses (COGS, operating) and liabilities (expense, equity).

All future-coded exchanges represent 1 of 4 liability types:
- Sale
- Equity Increase
- Equity Decrease
- Expense

In this simplified accounting system, it suffices to assume that all liabilities pertain to the future regardless of their initially intended date of settlement.

A mechanism for identifying if a liability has matured and by how much will be identified.


+++


Thesis Driving Workpads

	•	Mobile businesses require tools with zero reliance on desktop
	•	The individual job record is the organizing unit for people and platform
	•	Trades and skilled labor sectors have the greatest pain point

	•	Individual job records are the organizing unit for mobile entrepreneurs, especially in the Trades.
	•	These mobile businesses require tools with zero reliance on desktop access and setup.
	•	A platform that supports exchange and learning for these entrepreneurs must also be based around individual records, in order to drive added value at the job to job level.
	•	Drafting job records, capturing data and reviewing performance fosters the arts of dispatching, job management and team administration. This will remain a mixture of manual and automated.
	•	Discovery of services and customers can be enabled through seamless publishing.
	•	Tradesmen and skilled labourers with small teams have the greatest pain points.
	•	Their primary need is to clearly document jobs for the benefit of workers and customers. By facilitating creation of this root record, finances and performance are easily extrapolated.
	•	For the smallest teams, there is no budget for the Paid Seats model. Staffing is too fluid and skepticism about software is at its highest. Simplicity and permanency compose the value prop.
	•	The leadership of very small businesses in the Trades relies on the publishing of job information by one or few leaders, and access/interaction by workers via browsers with no account requirements.
	•	Learning happens on the job, and per job. Insights are connected to actions and real outcomes. In order to drive performance improvement and skill development, commentary and resources must get appended to record components while being viewable as a collection for review.
	•	


	•	Business coordination happens at the job level, especially in the Trades. Our mobile tools must be flattened out in response to this reality. enabling us to re-construct a business system
	•	All business coordination happens at the job level, especially in the Trades. We must flatten our tools in response to this reality; features and functions collapse down into the individual record. From this new foundation we can construct a durable platform that’s fit for the future.


This app implements very basic formatting with limited color.<br>

<h2><a href="/babb/plainjane/workpads.html">LAUNCH</a></h2>

  

{% highlight html%}

4 Main Blocks: Process, Actions, Details, Story

Listing: No filtering, New Button

Viewing: 4 Blocks, Back to List, Edit, Delete

Editing:

Storage: Browser (Local)

Network: 

{% endhighlight %}

  

This document provides a comprehensive technical and non-technical summary of the "Plain Jane", generated directly from the provided source code. It is structured for product documentation, offering insights into its functionality, implementation, and potential.

  

## Detailed Product Documentation

  

The "Plain Jane" app is a client-side web application designed for capturing and managing details related to meetings, customer interactions, or general processes. It facilitates the creation and editing of "workpads," which serve as structured records of these engagements, including actionable items.

  

### 1. Non-Technical Aspects: Product Overview and User Experience

  

The "Plain Jane" functions as a personal or small-team digital record-keeping tool, primarily focused on organized data entry for engagements.

  

**1.1 Core Functionality:**

The application allows users to:

* **Create New Workpads:** Initiate a fresh record for an engagement.
* **Edit Existing Workpads:** Modify previously saved records, loaded via a URL parameter (`id`).
* **Capture Core Engagement Data:** Input fields are provided for:
* "Customer Name" (or "Process name")
* "Date"
* "Meeting Location"
* "Meeting Time"
* **Dynamic Action Management:** Users can add multiple "Actions" to a workpad. Each action includes:
* An "Action title" input field.
* "Action notes" input field.
* A "Remove" button to delete individual actions.
* **Detailed Narrative Input:** Dedicated fields for "Details" and a "Story" allow for comprehensive textual descriptions.
* **Local Data Persistence:** All entered data is saved within the user's browser's local storage, meaning data is persistent across browser sessions on the same device until explicitly cleared by the user or browser.
* **Navigation:** Buttons are provided to "Save Workpad" (which redirects to a presumed listing page) or "Cancel" (which also redirects to the presumed listing page without saving).

  

**1.2 User Interface (UI) and User Experience (UX) Characteristics:**

The app features a straightforward and uncluttered design:

* **Form-Centric Layout:** The primary interface is a single form with clearly labeled input fields, facilitating structured data entry.
* **Inline Styling:** All CSS is embedded directly within the HTML document's `<style>` tags, providing a self-contained styling definition for the page.
* **Responsive Considerations:** The `max-width: 600px` and `margin: 2rem auto` on the `body` element suggest a basic attempt at accommodating different screen sizes by centering the content and limiting its maximum width.
* **Actionable Buttons:** Buttons are distinct in color and clearly labeled ("Save Workpad" - blue, "Cancel" - gray, "Add Action" - green, "Remove" - red) with hover effects for visual feedback.
* **Accessibility Attributes:** The use of `aria-label` on specific buttons (`Add new action`, `Remove action`) indicates an intention to improve accessibility for users of assistive technologies.

  

### 2. Technical Aspects: Code Architecture and Implementation Details

  

The "Plain Jane" is implemented as a static HTML page that relies entirely on client-side JavaScript for interactivity and data management, and leverages a static site generator context.

  

**2.1 Technology Stack:**

* **HTML5:** Defines the semantic structure and content of the web page.
* **CSS3:** Styles the appearance of the application, embedded directly within the HTML.
* **JavaScript (ECMAScript 5/6+):** Manages all dynamic behaviors, form interactions, and data persistence.
* **Jekyll (Implied):** The presence of `layout: default`, `title: Edit Workpad`, and `permalink: /babb/plainjane/workpad-edit` at the top of the file strongly suggests that this HTML is part of a static website generated using Jekyll or a similar static site generator. These directives are processed by Jekyll to integrate the content into a larger site structure and define its URL.

  

**2.2 Client-Side Data Management:**

* **Persistence Mechanism:** Data is stored using the browser's `localStorage` API. The key used for storing all workpads is `'workpads'`.
* **Data Structure:** All workpads are stored as a single JSON string representing an array of objects. Each object within this array corresponds to a workpad and has the following properties:
* `process`: String, stores the "Customer or Process name."
* `customerName`: String, a duplicate of `process` for backward compatibility.
* `date`: String, stores the date in `YYYY-MM-DD` format (from `input type="date"`).
* `location`: String, stores the meeting location.
* `meetingTime`: String, stores the meeting time.
* `actions`: Array of objects, where each object represents an action item with `title` (String) and `notes` (String) properties.
* `details`: String, stores additional details.
* `story`: String, stores the narrative or story.
* **Initialization:** Upon loading, the JavaScript attempts to parse existing workpads from `localStorage`. If no data is found, it initializes an empty array.

  

**2.3 JavaScript Execution Flow:**

The entire JavaScript logic is wrapped in an Immediately Invoked Function Expression (IIFE) `(function () { ... })();` to create a private scope and avoid polluting the global namespace.

  

* **URL Parameter Parsing:** `URLSearchParams(window.location.search)` is used to extract query parameters from the URL. Specifically, it looks for an `id` parameter, which signifies an existing workpad to be edited.
* **DOM Element Retrieval:** References to key HTML elements (form, inputs, containers, buttons) are obtained using `document.getElementById()`.
* **Dynamic Action Rendering (`renderActions()`):**
* This function clears the `actionsContainer`'s HTML content.
* It iterates through the `actions` array and dynamically creates `div` elements with `input` fields for `title` and `notes`, and a "Remove" button for each action.
* `data-index` attributes are used on the input fields and remove buttons to associate them with their corresponding array index in the `actions` array.
* **Event Listener Attachment:** After rendering, event listeners (`'input'` for text fields and `'click'` for buttons) are attached to *all* newly rendered action input fields and remove buttons using `document.querySelectorAll` and `forEach`. This ensures that dynamic elements are interactive.
* **Add Action Logic:**
* The `addActionBtn` click handler pushes a new blank action object `{ title: '', notes: '' }` into the `actions` array.
* It then calls `renderActions()` to update the UI with the newly added blank action.
* **Load Workpad Data (Edit Mode):**
* If an `id` URL parameter exists and corresponds to a valid index in the `workpads` array, the `pageTitle` is updated to "Edit Workpad."
* The values of the existing workpad are loaded into the respective form input fields.
* The `actions` array is populated with existing action items, ensuring `Array.isArray()` for robustness.
* **Form Submission Handling:**
* An event listener is attached to the form's `submit` event.
* `e.preventDefault()` prevents the default browser form submission.
* Input values are collected, and `trim()` is applied to string inputs.
* The `newPad` object is constructed.
* If `index` is valid (edit mode), the existing workpad at that index is updated. Otherwise, the `newPad` is pushed as a new entry.
* The updated `workpads` array is then serialized to JSON and saved back to `localStorage`.
* Finally, `window.location.href` redirects the user to `/babb/plainjane/workpads`.
* **Cancel Button Logic:** The `cancel-btn` click handler simply redirects the user to `/babb/plainjane/workpads` without saving any changes.

  

### 3. Areas for Potential Evolution

  

Based on the current implementation, several areas could be considered for future development to enhance robustness, user experience, or scalability:

  

* **Robustness of Dynamic Element Event Handling:** The current approach re-attaches event listeners to *all* action input fields and buttons every time `renderActions()` is called. For a large number of actions, this could be inefficient. A more performant pattern would be to use event delegation on the `actions-container` itself.
* **Data Validation:** No client-side input validation is present beyond basic `.trim()`. Adding validation for required fields, date formats, or specific content types would improve data integrity.
* **Unique Identifiers for Workpads/Actions:** Relying solely on array `index` for identifying workpads and actions can be brittle if items are reordered or deleted, potentially leading to incorrect updates if the `id` in the URL doesn't align with the current array state. Implementing a UUID (Universally Unique Identifier) for each workpad and action could provide more stable referencing.
* **Modular JavaScript:** For increased complexity, splitting the JavaScript into separate modules (e.g., for DOM manipulation, data storage, form logic) would improve maintainability.
* **User Feedback:** The application currently redirects upon save or cancel without explicit visual feedback (e.g., a "Saved successfully!" toast).
* **Error Handling:** There is no explicit error handling for `localStorage` operations (e.g., if quota is exceeded) or other potential runtime issues.
* **Comprehensive CSS Management:** While inline CSS is simple for a single page, external stylesheets or a CSS preprocessor would offer better organization and scalability for larger projects.
* **Accessibility Beyond `aria-label`:** A more thorough accessibility audit could identify further improvements for keyboard navigation, screen reader compatibility, and ARIA roles for dynamic content updates.	