import puppeteer from '@cloudflare/puppeteer';
import { SleepUtil } from './SleepUtil';

class M365LoginUtil {
  protected static M365_LOGIN_URL: string = 'https://www.microsoft.com/cascadeauth/store/account/signin';

  protected static M365_LOGIN_URL_NORMALIZED: string = new URL(M365_LOGIN_URL).toString();

  public static login(browser: Fetcher): Promise<boolean> {
    const browser = await puppeteer.launch(env.MYBROWSER);
    const page = await browser.newPage();
    await page.goto(url);
    await page.keyboard.type('username@outlook.com', { delay: 50 });
    await page.keyboard.press('Enter');
    await SleepUtil.sleep(1);
    await page.keyboard.type('password', { delay: 50 });
    await page.keyboard.press('Enter');
    await SleepUtil.sleep(1);
    const totpUrl =
      'https://totp-generator.2ba35e4d622c4747d091cb066978b585.workers.dev/generate-totp?key=sometotpkey123&digits=6&period=30&algorithm=SHA-1';
    const response = await fetch(totpUrl);
    if (!response.ok) {
      throw new Error('failed to get totp');
    }
    const data = await response.json();
    const otp = data.otp;
    await page.keyboard.type(otp, { delay: 50 });
    await page.keyboard.press('Enter');
    await SleepUtil.sleep(3);
    // await page.waitForSelector('[data-testid="secondaryButton"]', { visible: true });
    await page.click('[data-testid="secondaryButton"]');
    await SleepUtil.sleep(5);
    await browser.close();
    // TODO: verify the login status
    return true;
  }
}

export { M365LoginUtil };
