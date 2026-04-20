import { http, HttpResponse } from 'msw';
import type { HttpHandler } from 'msw';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const orderHandlers: HttpHandler[] = [
  // Get orders list
  http.get(`${baseUrl}/api/v1/orders`, ({ request }) => {
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');

    if (!customerId) {
      return HttpResponse.json(
        { success: false, errorCode: 'BAD_REQUEST', message: 'Customer ID required' },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: [
        {
          orderId: 'order-1',
          customerId,
          status: 'PENDING_PAYMENT',
          totalAmount: 250,
          currency: 'CNY',
          items: [
            {
              productId: 'prod-1',
              productName: 'Test Product 1',
              quantity: 2,
              unitPrice: 100,
              subtotal: 200,
            },
          ],
          createTime: '2025-04-19T10:00:00Z',
          updateTime: '2025-04-19T10:00:00Z',
        },
        {
          orderId: 'order-2',
          customerId,
          status: 'PAID',
          totalAmount: 150,
          currency: 'CNY',
          items: [
            {
              productId: 'prod-2',
              productName: 'Test Product 2',
              quantity: 1,
              unitPrice: 150,
              subtotal: 150,
            },
          ],
          createTime: '2025-04-18T10:00:00Z',
          updateTime: '2025-04-18T10:30:00Z',
        },
      ],
    });
  }),

  // Get order detail
  http.get(`${baseUrl}/api/v1/orders/:orderId`, ({ params }) => {
    const orderId = params.orderId as string;

    return HttpResponse.json({
      success: true,
      data: {
        orderId,
        customerId: 'user-1',
        status: 'PENDING_PAYMENT',
        totalAmount: 250,
        currency: 'CNY',
        items: [
          {
            productId: 'prod-1',
            productName: 'Test Product 1',
            quantity: 2,
            unitPrice: 100,
            subtotal: 200,
          },
          {
            productId: 'prod-2',
            productName: 'Test Product 2',
            quantity: 1,
            unitPrice: 50,
            subtotal: 50,
          },
        ],
        createTime: '2025-04-19T10:00:00Z',
        updateTime: '2025-04-19T10:00:00Z',
      },
    });
  }),

  // Create order
  http.post(`${baseUrl}/api/v1/orders`, async ({ request }) => {
    const body = (await request.json()) as { customerId: string };

    if (!body.customerId) {
      return HttpResponse.json(
        { success: false, errorCode: 'BAD_REQUEST', message: 'Customer ID required' },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        orderId: 'order-new',
        customerId: body.customerId,
        status: 'PENDING_PAYMENT',
        totalAmount: 100,
        currency: 'CNY',
        items: [],
        createTime: '2025-04-19T10:00:00Z',
        updateTime: '2025-04-19T10:00:00Z',
      },
    });
  }),

  // Create order from cart
  http.post(`${baseUrl}/api/v1/orders/from-cart`, async ({ request }) => {
    const body = (await request.json()) as { customerId: string };

    if (!body.customerId) {
      return HttpResponse.json(
        { success: false, errorCode: 'BAD_REQUEST', message: 'Customer ID required' },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        orderId: 'order-from-cart',
        customerId: body.customerId,
        status: 'PENDING_PAYMENT',
        totalAmount: 250,
        currency: 'CNY',
        items: [],
        createTime: '2025-04-19T10:00:00Z',
        updateTime: '2025-04-19T10:00:00Z',
      },
    });
  }),

  // Pay order
  http.post(`${baseUrl}/api/v1/orders/:orderId/pay`, ({ params }) => {
    const orderId = params.orderId as string;

    return HttpResponse.json({
      success: true,
      data: {
        orderId,
        customerId: 'user-1',
        status: 'PAID',
        totalAmount: 250,
        currency: 'CNY',
        items: [],
        createTime: '2025-04-19T10:00:00Z',
        updateTime: '2025-04-19T10:05:00Z',
      },
    });
  }),

  // Cancel order
  http.post(`${baseUrl}/api/v1/orders/:orderId/cancel`, ({ params }) => {
    const orderId = params.orderId as string;

    return HttpResponse.json({
      success: true,
      data: {
        orderId,
        customerId: 'user-1',
        status: 'CANCELLED',
        totalAmount: 250,
        currency: 'CNY',
        items: [],
        createTime: '2025-04-19T10:00:00Z',
        updateTime: '2025-04-19T10:05:00Z',
      },
    });
  }),
];
