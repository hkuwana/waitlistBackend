# Webflow Waitlist Integration Guide

A guide to adding a referral-based waitlist system to your Webflow site using code injection.

## Table of Contents

- [Quick Start](#quick-start)
- [Detailed Installation Steps](#detailed-installation-steps)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Quick Start

1. Go to Webflow Project Settings → Custom Code
2. Add the code to your site's `<head>` and `<body>` tags
3. Publish your site

## Detailed Installation Steps

### 1. Add the Styles (Head Code)

In Webflow:

1. Go to Project Settings
2. Click on "Custom Code"
3. Add this code to the "Head Code":

```html
<style>
  .waitlist-widget {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif;
    max-width: 600px;
    margin: 0 auto;
    color: #f8f8f8;
    padding: 24px;
  }

  .input-group {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    background: rgba(167, 139, 250, 0.1);
    padding: 24px;
    border-radius: 12px;
    border: 1px solid rgba(167, 139, 250, 0.2);
  }

  input[type="email"] {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(167, 139, 250, 0.3);
    color: #f8f8f8;
    padding: 14px 20px;
    border-radius: 8px;
    width: 100%;
    font-size: 16px;
    transition: all 0.2s ease;
  }

  .referral-link {
    color: #a78bfa;
    cursor: pointer;
    text-decoration: underline;
    word-break: break-all;
    transition: color 0.2s ease;
  }

  .copy-feedback {
    display: inline-block;
    font-size: 14px;
    color: #a78bfa;
    margin-left: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .copy-feedback.show {
    opacity: 1;
  }

  /* Add the rest of your CSS styles here */
</style>
```

### 2. Add the HTML and JavaScript (Body Code)

Add this code to the "Before </body> tag" section:

```html
<!-- Waitlist Widget HTML -->
<div class="waitlist-widget">
  <div class="pre-signup">
    <div class="input-group">
      <input type="email" placeholder="Enter your email" id="email-input" />
      <button class="join-button" onclick="handleWaitlistJoin()">
        Join Waitlist
        <div class="spinner"></div>
      </button>
    </div>
    <div class="error-message" id="error-message"></div>
  </div>
  <div class="post-signup" style="display: none;">
    <div class="referral-box"></div>
  </div>
</div>

<script>
  // Configuration
  const API_BASE = "https://waitlist-backend-six.vercel.app/api";
  let isSubmitting = false;

  async function handleWaitlistJoin() {
    const emailInput = document.getElementById("email-input");
    const joinButton = document.querySelector(".join-button");
    const spinner = document.querySelector(".spinner");
    const errorMessage = document.getElementById("error-message");

    // Reset states
    errorMessage.style.display = "none";

    // Basic email validation
    const email = emailInput.value.trim();
    if (!email || !email.includes("@")) {
      showError("Please enter a valid email address");
      return;
    }

    if (isSubmitting) return;

    // Show loading state
    isSubmitting = true;
    joinButton.disabled = true;
    spinner.style.display = "block";

    try {
      const referralCode = new URLSearchParams(window.location.search).get(
        "ref"
      );

      const response = await fetch(`${API_BASE}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          referralCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      showPostSignup({
        position: data.position,
        referralCode: data.referralCode,
      });
    } catch (error) {
      console.error("Error joining waitlist:", error);
      showNetworkError();
    } finally {
      isSubmitting = false;
      joinButton.disabled = false;
      spinner.style.display = "none";
    }
  }

  function showPostSignup(data) {
    const referralBox = document.querySelector(".referral-box");
    referralBox.innerHTML = `
      <div>You are <span class="position-number">#${data.position}</span> in line!</div>
      <div>Refer people to move up:</div>
      <div>
        <span class="referral-link" onclick="copyReferralLink(this)">${window.location.origin}?ref=${data.referralCode}</span>
        <span class="copy-feedback">Copied!</span>
      </div>
    `;
    document.querySelector(".pre-signup").style.display = "none";
    document.querySelector(".post-signup").style.display = "block";
  }

  async function copyReferralLink(element) {
    const referralLink = element.textContent;
    try {
      await navigator.clipboard.writeText(referralLink);
      const feedback = element.nextElementSibling;
      feedback.classList.add("show");
      setTimeout(() => {
        feedback.classList.remove("show");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }
</script>
```

## Customization

### Changing Colors

1. Find the color values in the CSS (e.g., `#A78BFA`)
2. Replace with your brand colors
3. Update hover states accordingly

### Modifying Text

- Edit the text directly in the HTML
- Update error messages in the JavaScript functions

### Styling Tips

- Use Webflow's style editor for basic changes
- Use custom CSS for more advanced modifications
- Keep the widget's max-width (600px) for optimal display

## Troubleshooting

### Common Issues

1. **CORS Errors**

```javascript
// Add this to your backend API
res.setHeader("Access-Control-Allow-Origin", "https://your-webflow-site.com");
```

2. **Widget Not Showing**

- Ensure the HTML is placed where you want the widget to appear
- Check console for JavaScript errors
- Verify custom code is published

3. **Styling Conflicts**

- Add more specific CSS selectors
- Use `!important` for critical styles if needed

### Error Messages

- Network errors show retry button
- Invalid emails show validation message
- Server errors display with explanation

## FAQ

**Q: Where should I place the widget in my Webflow design?**
A: Create a container element where you want the widget to appear and ensure it has sufficient padding/margin.

**Q: How do I change the API endpoint?**
A: Update the `API_BASE` constant in the JavaScript code.

**Q: Can I modify the referral link format?**
A: Yes, edit the `showPostSignup` function to change the link structure.

**Q: How do I test the waitlist?**
A: Use different email addresses and referral codes to verify functionality.

For additional support or customization needs, contact your development team or refer to the Webflow documentation.
