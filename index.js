const express = require("express");
// const puppeteer = require("puppeteer-core");
const puppeteer = require("puppeteer");
const app = express();
app.use(express.json());

const PORT = 3000;

// 👇 Replace with your actual Chrome path
const path = require('path');
const chromePath = path.resolve(
  __dirname,
  '.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome'
);


app.get("/", (req, res) => {
  res.send("Hello World <a href='/auto-login'>Get Logged In</a>");
});

// ✅ Helper to get option value by its visible text
async function getOptionValueByText(page, selectName, visibleText) {
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
  // const { login_id = "28494", password = "Mgp@28494" } = req.body;
  const login_id = "28494",
    password = "Mgp@28494";

  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: chromePath, // 👈 Must match downloaded path
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

    // Wait for captcha value (sometimes pre-filled)
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
    console.log("🚨 validate() function overridden to always return true.");

    await Promise.all([
      page.click('input[name="BtnLogin"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    const currentURL = page.url();

    if (currentURL.includes("DashBoardPV.aspx")) {
      console.log("✅ Login successful. Redirecting...");
      await page.goto(
        "https://gramsuvidha.gujarat.gov.in/PanchayatVero/ListMasterMilkatPV.aspx"
      );

      return res.json({
        success: true,
        message: "Logged in successfully and navigated to Milkat Page.",
      });
    } else {
      return res.status(400).json({ error: "Login failed." });
    }
  } catch (err) {
    console.error("❌ Automation failed:", err);
    return res.status(500).json({ error: "Internal error." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// 		<option selected="selected" value="220E8302-1B69-4D00-8A4F-BEF8224D305D">તલાટી</option>
