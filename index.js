// server.js
const fs = require("fs");
const express = require("express");
const puppeteer = require("puppeteer");
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

async function wait(ms) {
  await new Promise((res) => setTimeout(res, ms));
}

function setSelectValue(selectElement, textToMatch) {
  const optionToSelect = Array.from(selectElement.options).find(
    (opt) => opt.text.trim() === textToMatch.trim()
  );

  if (optionToSelect) {
    selectElement.value = optionToSelect.value;
    selectElement.dispatchEvent(new Event("input", { bubbles: true }));
    selectElement.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    console.warn("❌ Option text not found:", textToMatch);
  }
}

async function login(req, res) {
  const login_id = "28494";
  const password = "Mgp@28494";

  let browser; // Declare browser outside try block for finally
  try {
    console.log("🚀 Launching Puppeteer browser...");

    const overrideScript = fs.readFileSync(
      "override_trantaxreceipt.js",
      "utf8"
    );

    const browser = await puppeteer.launch({
      // headless: "new", // or true
      headless: false, // or true
      /// executablePath,
      timeout: 0,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--start-maximized",
        "--disable-infobars",
      ],
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
    await wait(500); // trigger AJAX loading of dropdowns

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

        await wait(500);
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
      await wait(1500);
    } while (!captchaValue);

    // Set captcha confirm
    await page.type(
      'input[name="txtCompare"]',
      captchaValue.replace(/\s+/g, "")
    );

    // Submit form
    await wait(1000);

    await page.evaluate(() => {
      window.validate = () => true;
    });

    await wait(2000);
    console.log("🚨 validate() function overridden to always return true.");

    await Promise.all([
      page.click('input[name="BtnLogin"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    await wait(1500);

    const currentURL = page.url();
    console.log(`Current URL after login attempt: ${currentURL}`);

    // Login End =======================

    if (!currentURL.includes("DashBoardPV.aspx")) {
      throw new Error("Login failed. Not redirected to dashboard.");
    }

    console.log("✅ Login successful. Redirecting to Receipt Page...");

    // Add Receipt Start =======================

    const recieptPageURL =
      "https://gramsuvidha.gujarat.gov.in/PanchayatVero/TranTaxReceiptPV.aspx";
    await page.goto(
      recieptPageURL,
      { waitUntil: "networkidle2" } // Explicit timeout for final navigation
    );
    console.log("✅ Successfully navigated to Milkat Page.");

    const milkat_id = "5.0";
    await page.evaluate((id) => {
      window.SearchMilkatMaster(id);
    }, milkat_id);

    // Selectig Payment Method
    // Wait for Payment Method dropdown
    await page.waitForSelector(
      "select[name='ctl00$ContentPlaceHolder1$DDLCashBank']",
      { visible: true }
    );
    // Select 'રોકડ' as Payment Mode
    await page.select(
      "select[name='ctl00$ContentPlaceHolder1$DDLCashBank']",
      "F7E82911-DC42-4F06-9644-D8A925205B23"
    );
    // "રોકડ";

    // Total Payement
    // Wait for and Click input with tabindex 13 (simulate clicking total)
    await page.waitForSelector("input[tabindex='13']", { visible: true });
    await page.click("input[tabindex='13']");

    console.log("🧠 Injecting script or waiting...");

    await wait(500);
    // ✅ Inject the override script directly:
    await page.evaluate(overrideScript);
    console.log("✅ override_trantaxreceipt.js injected");

    console.log("Done, waiting to submit!");
    await wait(1000);

    const submitBtnSelector = "#ctl00_ContentPlaceHolder1_BtnSave";
    const isSubmitVisible = await page.$(submitBtnSelector);
    if (isSubmitVisible) {
      await page.click(submitBtnSelector);
      console.log("✅ Form submitted!");

      await wait(500);
      return res
        .status(200)
        .json({ success: true, message: `Receipt Number Updated.` });
    } else {
      console.log("❌ Submit button not found.");
    }
  } catch (err) {
    console.error("❌ Automation failed:", err);
    // Provide more specific error details

    return res.status(500).json({
      error: "Internal error.",
      message: err.message, // Send only the error message, not the full object
      name: err.name || "Error", // Include error name if available
    });
  }

  if (browser) {
    console.log("Closing browser...");
    await browser.close();
    console.log("Browser closed.");
  }
}

// 📌 GET Receipt Number
app.get("/add-receipt", async (req, res) => {
  login(req, res);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Access automation at: http://localhost:${PORT}/add-receipt`);
  console.log(`(On Render, use your service URL instead of localhost)`);
});
