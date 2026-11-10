export interface PaymentOrderRequest {
  amount: number;
  currency: string;
  description: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface PaymentOrderResponse {
  id: string;
  status: "created" | "approved" | "completed" | "failed";
  amount: number;
  currency: string;
  approvalUrl?: string;
  rawResponse?: any;
}

export interface PaymentGateway {
  name: string;
  createOrder: (req: PaymentOrderRequest) => Promise<PaymentOrderResponse>;
  captureOrder: (orderId: string) => Promise<PaymentOrderResponse>;
}
