import { PaymentGateway } from "./types";
import { MockPaymentGateway } from "./mock";
import { PayPalPaymentGateway } from "./paypal";

export function getPaymentGateway(): PaymentGateway {
  if (process.env.PAYPAL_CLIENT_ID) {
    return new PayPalPaymentGateway();
  }
  return new MockPaymentGateway();
}

export * from "./types";
