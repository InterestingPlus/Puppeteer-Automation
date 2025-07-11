// server.js

const express = require("express");
const puppeteer = require("puppeteer");
const path = require('path'); // Required for resolving chromePath

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000; // Use process.env.PORT for Render deployment

// 👇 Define the path to the downloaded Chrome executable
// Based on your logs, Puppeteer downloads it to:
// /opt/render/project/src/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome
// So, we construct the path relative to __dirname (which is /opt/render/project/src/)
const chromePath = path.resolve(
    __dirname,
    '.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome'
);

app.get("/", (req, res) => {
    res.send("Hello World <a href='/auto-login'>Get Logged In</a>");
});

// ✅ Helper to get option value by its visible text
async function getOptionValueByText(page, selectName, visibleText) {
    console.log(`🔍 Searching for option "${visibleText}" in select "${selectName}"...`);
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
        browser = await puppeteer.launch({
            headless: "new", // Use 'new' for the new headless mode
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage", // Recommended for Docker/Linux environments to avoid memory issues
            ],
            executablePath: chromePath 
        });

        const page = await browser.newPage();

        // ⏱️ Increase default timeout for all page operations
        await page.setDefaultNavigationTimeout(90000); // 90 seconds (was 30s)
        await page.setDefaultTimeout(90000); // 90 seconds for other operations like .type(), .click()

        console.log("🌐 Navigating to https://gramsuvidha.gujarat.gov.in...");
        await page.goto("https://gramsuvidha.gujarat.gov.in", {
            waitUntil: "networkidle0", 
            timeout: 90000, // Explicitly set timeout for this navigation
        });
        console.log("✅ Navigation complete.");

        // 🧾 Fill Login ID
        console.log(`✍️ Typing login ID: ${login_id}`);
        await page.type('input[name="txtSiteID"]', login_id);
        await page.evaluate(() => {
            const ddlModule = document.querySelector('input[name="txtSiteID"]');
            if (ddlModule) {
                ddlModule.dispatchEvent(new Event("input", { bubbles: true }));
            }
        });
        console.log("⏳ Waiting for AJAX to trigger dropdown loading...");
        await new Promise((res) => setTimeout(res, 3000)); // Increased wait time for AJAX

        // 🕐 Wait until options are loaded
        let dropdownsReady = false;
        let attempts = 0;
        const maxAttempts = 20; // Try up to 10 seconds (20 * 500ms)

        console.log("🔄 Checking if dropdowns are populated...");
        while (!dropdownsReady && attempts < maxAttempts) {
            // Click to ensure dropdowns are active/visible, though not always necessary
            // await Promise.all([page.click('select[name="DDLModule"]')]); // This might not be needed if input event triggers it

            dropdownsReady = await page.evaluate(() => {
                const moduleSelect = document.querySelector('select[name="DDLModule"]');
                const userSelect = document.querySelector('select[name="DDLUser"]');

                // Check if elements exist and have more than just the default option
                return (
                    moduleSelect &&
                    userSelect &&
                    moduleSelect.options.length > 1 &&
                    userSelect.options.length > 1
                );
            });

            if (!dropdownsReady) {
                console.log(`⏳ Waiting for dropdowns to populate... (Attempt ${attempts + 1}/${maxAttempts})`);
                await new Promise((res) => setTimeout(res, 500));
                attempts++;
            }
        }

        if (!dropdownsReady) {
            throw new Error("❌ Dropdowns not loaded even after waiting for multiple attempts.");
        }
        console.log("✅ Dropdowns are ready!");

        const moduleValue = await getOptionValueByText(
            page,
            "DDLModule",
            "પંચાયત વેરો"
        );
        const userValue = await getOptionValueByText(page, "DDLUser", "તલાટી");

        if (!moduleValue || !userValue) {
            throw new Error("❌ Could not find required dropdown values for 'પંચાયત વેરો' or 'તલાટી'");
        }

        console.log(`Selecting DDLModule with value: ${moduleValue}`);
        await page.evaluate((value) => {
            const select = document.querySelector('select[name="DDLModule"]');
            if (select) { // Added null check
                select.value = value;
                select.dispatchEvent(new Event("change", { bubbles: true }));
            }
        }, moduleValue);
        await new Promise((res) => setTimeout(res, 1000)); // Small wait after module change

        console.log(`Selecting DDLUser with value: ${userValue}`);
        await page.evaluate((userValue) => {
            const select = document.querySelector('select[name="DDLUser"]');
            if (select) { // Added null check
                const option = Array.from(select.options).find(
                    (opt) => opt.value === userValue
                );

                if (option) {
                    option.selected = true;
                    select.value = option.value;
                    select.dispatchEvent(new Event("change", { bubbles: true }));

                    // 🔁 Trigger postback manually, same as onchange="setTimeout('__doPostBack(...')"
                    // This part is crucial for ASP.NET postbacks
                    setTimeout(() => {
                        const eventTarget = document.getElementById("__EVENTTARGET");
                        const eventArgument = document.getElementById("__EVENTARGUMENT");
                        if (eventTarget && eventArgument) {
                            eventTarget.value = "DDLUser";
                            eventArgument.value = "";
                            // Ensure form is submitted, assuming 'form1' is the correct ID
                            const form = document.forms["form1"];
                            if (form) {
                                form.submit();
                            } else {
                                console.error("Form 'form1' not found for submission.");
                            }
                        } else {
                            console.error("__EVENTTARGET or __EVENTARGUMENT not found.");
                        }
                    }, 0); // Execute immediately on next tick
                }
            }
        }, userValue);

        console.log("⏳ Waiting for page to reload after DDLUser change...");
        // Wait for navigation after the DDLUser change triggers a postback
        await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 90000 });
        console.log("✅ Page reloaded after DDLUser change.");

        let year;
        let yearAttempts = 0;
        const maxYearAttempts = 10;
        console.log("🔄 Waiting for year dropdown to be populated...");
        do {
            try {
                year = await page.$eval("#DDLYear", (el) => el.value);
                console.log("📅 Year found:", year);
            } catch (err) {
                console.log(`⏳ Year dropdown not yet ready (Attempt ${yearAttempts + 1}/${maxYearAttempts})...`);
                await new Promise((res) => setTimeout(res, 1000));
                yearAttempts++;
            }
        } while (!year && yearAttempts < maxYearAttempts);

        if (!year) {
            throw new Error("❌ Year dropdown not loaded even after waiting.");
        }

        // 🧾 Fill password
        console.log("✍️ Typing password...");
        await page.type('input[name="TxtPassword"]', password);

        // Wait for captcha value (sometimes pre-filled)
        let captchaValue;
        let captchaAttempts = 0;
        const maxCaptchaAttempts = 15; // Try up to 30 seconds (15 * 2000ms)
        console.log("🔄 Waiting for captcha value...");
        do {
            try {
                captchaValue = await page.$eval('input[name="txtCaptcha"]', (el) =>
                    el.value.trim()
                );
                if (captchaValue) {
                    console.log(`✅ Captcha value found: "${captchaValue}"`);
                } else {
                    console.log(`⏳ Captcha value not yet available (Attempt ${captchaAttempts + 1}/${maxCaptchaAttempts})...`);
                }
            } catch (e) {
                console.log(`⏳ Captcha element not found or value empty (Attempt ${captchaAttempts + 1}/${maxCaptchaAttempts})...`);
            }
            await new Promise((res) => setTimeout(res, 2000));
            captchaAttempts++;
        } while (!captchaValue && captchaAttempts < maxCaptchaAttempts);

        if (!captchaValue) {
            throw new Error("❌ Captcha value not found after multiple attempts.");
        }

        // Set captcha confirm
        console.log(`✍️ Typing captcha confirmation: ${captchaValue.replace(/\s+/g, "")}`);
        await page.type(
            'input[name="txtCompare"]',
            captchaValue.replace(/\s+/g, "")
        );

        console.log("⏳ Waiting before login submission...");
        await new Promise((res) => setTimeout(res, 2000));

        // Override validate function to always return true
        console.log("🚨 Overriding validate() function to always return true.");
        await page.evaluate(() => {
            window.validate = () => true;
        });

        console.log("⬆️ Clicking login button and waiting for navigation...");
        await Promise.all([
            page.click('input[name="BtnLogin"]'),
            page.waitForNavigation({ waitUntil: "networkidle2", timeout: 90000 }), // Explicit timeout for login navigation
        ]);
        console.log("✅ Login button clicked and navigation complete.");

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
                finalUrl: page.url()
            });
        } else {
            console.log("❌ Login failed. Current URL does not include 'DashBoardPV.aspx'.");
            return res.status(400).json({ error: "Login failed.", finalUrl: page.url() });
        }
    } catch (err) {
        console.error("❌ Automation failed:", err);
        // Provide more specific error details
        return res.status(500).json({
            error: "Internal error.",
            message: err.message, // Send only the error message, not the full object
            name: err.name || "Error" // Include error name if available
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
