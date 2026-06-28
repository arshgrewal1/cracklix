
/**
 * @fileOverview Institutional WhatsApp Admin Alert Utility.
 * Uses CallMeBot API for streamlined administrative notifications.
 */

export async function sendWhatsApp(message: string) {
  const phone = process.env.ADMIN_PHONE;
  const apikey = process.env.WA_API_KEY;

  if (!phone || !apikey) {
    console.warn("[WA_HUB] Admin credentials missing. Alert suppressed.");
    return;
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apikey}`;
    // Using simple fetch for the background job
    await fetch(url, { mode: 'no-cors' });
  } catch (err) {
    console.error("[WA_ERROR]:", err);
  }
}
