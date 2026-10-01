require('node:fs').mkdirSync('evidence',{recursive:true});
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined),headless:true});
const context=await browser.newContext({viewport:{width:320,height:780},isMobile:true,hasTouch:true});const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765');await page.waitForFunction(()=>document.querySelector('#offline-status').textContent.includes('使えます'));
await page.locator('#price').click();await page.locator('#keyboard-switch').click();
const add=async(price,name='')=>{await page.locator('#price').fill(price);await page.locator('#name').fill(name);await page.locator('.primary').first().click()};
await page.locator('#plus').click({clickCount:2});await add('198','りんご');await add('550');assert.equal(await page.locator('#total').innerText(),'1,144円');assert.equal(await page.locator('#remaining').innerText(),'残予算 1,856円');
await page.screenshot({path:'evidence/mobile-320.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.reload();await page.locator('#price').click();await page.locator('#keyboard-switch').click();assert.equal(await page.locator('#total').innerText(),'1,144円');
await page.getByRole('button',{name:'りんごを編集'}).click();await page.locator('#edit-price').fill('200');await page.locator('[data-close="editor"]').click();assert.equal(await page.locator('#total').innerText(),'1,144円');
await page.getByRole('button',{name:'りんごを編集'}).click();await page.locator('#edit-price').fill('200');await page.locator('#edit-quantity').fill('2');await page.locator('#edit-name').fill('みかん');await page.locator('#edit-form .primary').click();assert.equal(await page.locator('#total').innerText(),'950円');
await page.getByRole('button',{name:'みかんを削除'}).click();assert.equal(await page.locator('#total').innerText(),'550円');await page.locator('#undo').click();assert.equal(await page.locator('#total').innerText(),'950円');
await page.locator('#price').fill('100');await page.locator('#add-form .primary').dblclick();assert.equal(await page.locator('#count').innerText(),'3件');
await page.locator('#budget-open').click();await page.locator('#budget-input').fill('500');await page.locator('#budget-form .primary').click();assert.equal(await page.locator('#remaining').innerText(),'予算超過 550円');
await page.locator('#finish').click();await page.locator('[data-close="finish-dialog"]').click();assert.equal(await page.locator('#total').innerText(),'1,050円');
for(const bad of ['-1','1.5','9007199254740992','abc']){await add(bad);assert.equal(await page.locator('#count').innerText(),'3件');}
await page.locator('#price').fill('9007199254740991');await page.locator('#plus').click();await page.locator('#add-form .primary').click();assert.equal(await page.locator('#count').innerText(),'3件');
await context.setOffline(true);await page.reload();await page.locator('#price').click();await page.locator('#keyboard-switch').click();assert.equal(await page.locator('#total').innerText(),'1,050円');await page.locator('#minus').click();await add('50','オフライン');assert.equal(await page.locator('#total').innerText(),'1,100円');await page.reload();await page.locator('#price').click();await page.locator('#keyboard-switch').click();assert.equal(await page.locator('#total').innerText(),'1,100円');await context.setOffline(false);
// Simulate static-cache update; retain localStorage and avoid forcing page refresh.
await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()});assert.equal(await page.locator('#total').innerText(),'1,100円');
await page.locator('#finish').click();await page.locator('#finish-confirm').click();assert.equal(await page.locator('#total').innerText(),'0円');assert.equal(await page.locator('#budget-label').innerText(),'500円');await page.reload();await page.locator('#price').click();await page.locator('#keyboard-switch').click();assert.equal(await page.locator('#count').innerText(),'0件');
await page.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('quota')}});await add('80');assert((await page.locator('#storage-status').innerText()).includes('保存に失敗'));
assert.deepEqual(errors,[]);console.log('PASS: calculation, add/edit/delete/undo, double click, invalid values/overflow, restore, finish/cancel, offline, registration update, save failure, 320px layout.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
