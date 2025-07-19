// server.js

const express = require("express");
const puppeteer = require("puppeteer-core");
const path = require("path"); // Required for resolving chromePath

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000; // Use process.env.PORT for Render deployment

// 👇 Define the path to the downloaded Chrome executable
// Based on your logs, Puppeteer downloads it to:
// /opt/render/project/src/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome
// So, we construct the path relative to __dirname (which is /opt/render/project/src/)
// const chromePath = path.resolve(
//   __dirname,
//   ".cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome"
// );

// const executablePath = "/usr/bin/google-chrome"; // or Windows/macOS path

app.get("/", (req, res) => {
  res.send("Hello World <a href='/auto-login'>Get Logged In</a>");
});

// ✅ Helper to get option value by its visible text
async function getOptionValueByText(page, selectName, visibleText) {
  console.log(
    `🔍 Searching for option "${visibleText}" in select "${selectName}"...`
  );
  const optionValue = await page.evaluate(
    (selectName, visibleText) => {
      const select = document.querySelector(`select[name="${selectName}"]`);
      if (!select) return null;

      const option = Array.from(select.options).find(
        (opt) => opt.textContent.trim() === visibleText
      );
      return option ? option.value : null;
    },
    selectName,
    visibleText
  );

  console.log(
    `🎯 Found value for "${visibleText}" in ${selectName}:`,
    optionValue
  );
  return optionValue;
}

// 📌 GET Title API
app.get("/auto-login", async (req, res) => {
  const login_id = "28494";
  const password = "Mgp@28494";

  let browser; // Declare browser outside try block for finally
  try {
    console.log("🚀 Launching Puppeteer browser...");

    const browser = await puppeteer.launch({
      headless: "new", // or true
      // headless: false, // or true
      // executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 0,
    });

    const page = await browser.newPage();
    await page.goto("https://gramsuvidha.gujarat.gov.in", {
      waitUntil: "domcontentloaded",
    });

    // 🧾 Fill Login ID
    await page.type('input[name="txtSiteID"]', login_id);
    await page.evaluate(() => {
      const ddlModule = document.querySelector('input[name="txtSiteID"]');
      if (ddlModule) {
        ddlModule.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await new Promise((res) => setTimeout(res, 1500)); // trigger AJAX loading of dropdowns

    // 🕐 Wait until options are loaded
    // ⏳ Wait until both DDLModule and DDLUser dropdowns are populated
    let dropdownsReady = false;

    while (!dropdownsReady) {
      await Promise.all([page.click('select[name="DDLModule"]')]);
      dropdownsReady = await page.evaluate(() => {
        const moduleSelect = document.querySelector('select[name="DDLModule"]');

        const userSelect = document.querySelector('select[name="DDLUser"]');

        return (
          moduleSelect &&
          userSelect &&
          moduleSelect.options.length > 1 &&
          userSelect.options.length > 1
        );
      });

      if (!dropdownsReady) {
        console.log("⏳ Waiting for dropdowns to populate...");
        await new Promise((res) => setTimeout(res, 500));
      }
    }

    if (!dropdownsReady) {
      throw new Error("❌ Dropdowns not loaded even after waiting.");
    }

    const moduleValue = await getOptionValueByText(
      page,
      "DDLModule",
      "પંચાયત વેરો"
    );
    const userValue = await getOptionValueByText(page, "DDLUser", "તલાટી");

    if (!moduleValue || !userValue) {
      throw new Error("❌ Could not find required dropdown values");
    }

    await page.evaluate((value) => {
      const select = document.querySelector('select[name="DDLModule"]');
      // if (select) {
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }, moduleValue);

    await Promise.all([page.click('select[name="DDLUser"]')]);
    await page.evaluate((userValue) => {
      const select = document.querySelector('select[name="DDLUser"]');
      const option = Array.from(select.options).find(
        (opt) => opt.value === userValue
      );

      if (option) {
        option.selected = true;
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));

        // 🔁 Trigger postback manually, same as onchange="setTimeout('__doPostBack(...')"
        setTimeout(() => {
          const eventTarget = document.getElementById("__EVENTTARGET");
          const eventArgument = document.getElementById("__EVENTARGUMENT");
          if (eventTarget && eventArgument) {
            eventTarget.value = "DDLUser";
            eventArgument.value = "";

            document.forms["form1"].submit();
          }
        }, 0);
      }
    }, userValue);

    await new Promise((res) => setTimeout(res, 1500));

    let year;
    do {
      try {
        year = await page.$eval("#DDLYear", (el) => el.value);
        console.log("📅 Year:", year);

        await new Promise((res) => setTimeout(res, 1000));
      } catch (err) {}
    } while (!year);

    // 🧾 Fill password
    await page.type('input[name="TxtPassword"]', password);

    // Wait for captcha value
    let captchaValue;
    do {
      try {
        captchaValue = await page.$eval('input[name="txtCaptcha"]', (el) =>
          el.value.trim()
        );
        console.log("waiting for captcha...");
      } catch (e) {
        console.log("cannot find captcha value");
      }
      await new Promise((res) => setTimeout(res, 2000));
    } while (!captchaValue);

    // Set captcha confirm
    await page.type(
      'input[name="txtCompare"]',
      captchaValue.replace(/\s+/g, "")
    );

    // Submit form
    await new Promise((res) => setTimeout(res, 2000));

    await page.evaluate(() => {
      window.validate = () => true;
    });

    await new Promise((res) => setTimeout(res, 2000));
    console.log("🚨 validate() function overridden to always return true.");

    await Promise.all([
      page.click('input[name="BtnLogin"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    await new Promise((res) => setTimeout(res, 2000));

    const currentURL = page.url();
    console.log(`Current URL after login attempt: ${currentURL}`);

    if (currentURL.includes("DashBoardPV.aspx")) {
      console.log("✅ Login successful. Navigating to Milkat Page...");
      await page.goto(
        "https://gramsuvidha.gujarat.gov.in/PanchayatVero/ListMasterMilkatPV.aspx",
        { waitUntil: "networkidle2", timeout: 90000 } // Explicit timeout for final navigation
      );
      console.log("✅ Successfully navigated to Milkat Page.");

      return res.json({
        success: true,
        message: "Logged in successfully and navigated to Milkat Page.",
        finalUrl: page.url(),
      });
    } else {
      console.log(
        "❌ Login failed. Current URL does not include 'DashBoardPV.aspx'."
      );
      return res
        .status(400)
        .json({ error: "Login failed.", finalUrl: page.url() });
    }
  } catch (err) {
    console.error("❌ Automation failed:", err);
    // Provide more specific error details
    return res.status(500).json({
      error: "Internal error.",
      message: err.message, // Send only the error message, not the full object
      name: err.name || "Error", // Include error name if available
    });
  } finally {
    // Ensure the browser is closed even if an error occurs
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
      console.log("Browser closed.");
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Access automation at: http://localhost:${PORT}/auto-login`);
  console.log(`(On Render, use your service URL instead of localhost)`);
});
