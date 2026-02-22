export const sendSMS = async (phone: string, message: string) => {
    try {
        const apiKey = process.env.FAST2SMS_API_KEY;
        if (!apiKey) {
            console.warn("Fast2SMS API key is missing.");
            return false;
        }

        // Fast2SMS API request
        const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            method: "POST",
            headers: {
                "authorization": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "route": "q",
                "message": message,
                "language": "english",
                "flash": 0,
                "numbers": phone,
            }),
        });

        const data = await response.json();

        if (data.return) {
            console.log(`[SMS_SENT] To: ${phone} | Message: ${message}`);
            return true;
        } else {
            console.error("[SMS_ERROR] Fast2SMS:", data.message);
            return false;
        }
    } catch (error) {
        console.error("[SMS_EXCEPTION] error sending SMS:", error);
        return false;
    }
};
