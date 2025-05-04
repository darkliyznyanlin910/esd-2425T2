import { getServiceBaseUrl } from "@repo/service-discovery";

import { env } from "./env";
import { resend } from "./resend";

const IS_INTERNAL = true;

async function sendDelayedOrdersEmail(
  adminEmails: string[],
  delayedOrderCount: number,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Orders System <${env.EMAIL_FROM}>`,
      to: adminEmails,
      subject: "Delayed Orders Alert",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
            <h1 style="color: #d9534f; margin: 0; padding: 0; font-size: 24px;">Delayed Orders Alert</h1>
          </div>
          <div style="padding: 20px 0;">
            <p style="font-size: 16px; line-height: 1.5; color: #333;">There are currently <strong style="color: #d9534f; font-size: 18px;">${delayedOrderCount}</strong> delayed orders in the system in past 5 minutes.</p>
            <p style="font-size: 16px; line-height: 1.5; color: #333;">Please take appropriate action.</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">This is an automated message from the Order Management System.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return;
    }

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function main() {
  const delayedOrders = await fetch(
    `${getServiceBaseUrl("order", IS_INTERNAL)}/order/order?getFiveMinutesDelayedOrders=true&status=DELAYED`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
      },
    },
  );
  const delayedOrdersData = (await delayedOrders.json()) as any;
  console.log(delayedOrdersData.length);
  const adminEmails = await fetch(
    `${getServiceBaseUrl("auth", IS_INTERNAL)}/user/getAdminEmails`,
    {
      headers: {
        Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
      },
    },
  );
  const adminEmailsData = await adminEmails.json();
  console.log(adminEmailsData);

  // Send delayed orders email to admin emails
  if (
    adminEmailsData &&
    Array.isArray(adminEmailsData) &&
    adminEmailsData.length > 0
  ) {
    await sendDelayedOrdersEmail(adminEmailsData, delayedOrdersData.length);
  } else {
    console.log("No admin emails found to send the alert");
  }
}

main();
