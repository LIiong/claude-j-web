import { http, HttpResponse } from 'msw';
import type { HttpHandler } from 'msw';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const cartHandlers: HttpHandler[] = [
  // Get cart
  http.get(`${baseUrl}/api/v1/carts`, ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return HttpResponse.json(
        { success: false, errorCode: 'BAD_REQUEST', message: 'User ID required' },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        userId,
        items: [
          {
            productId: 'prod-1',
            productName: 'Test Product 1',
            unitPrice: 100,
            quantity: 2,
            subtotal: 200,
          },
          {
            productId: 'prod-2',
            productName: 'Test Product 2',
            unitPrice: 50,
            quantity: 1,
            subtotal: 50,
          },
        ],
        totalAmount: 250,
        currency: 'CNY',
        itemCount: 3,
        updateTime: '2025-04-19T10:00:00Z',
      },
    });
  }),

  // Add item to cart
  http.post(`${baseUrl}/api/v1/carts/items`, async ({ request }) => {
    const body = (await request.json()) as { userId: string; productId: string };

    if (!body.userId || !body.productId) {
      return HttpResponse.json(
        { success: false, errorCode: 'BAD_REQUEST', message: 'Invalid input' },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        userId: body.userId,
        items: [],
        totalAmount: 0,
        currency: 'CNY',
        itemCount: 0,
        updateTime: '2025-04-19T10:00:00Z',
      },
    });
  }),

  // Update cart item quantity
  http.put(`${baseUrl}/api/v1/carts/items/quantity`, async ({ request }) => {
    const body = (await request.json()) as { userId: string; productId: string; quantity: number };

    if (!body.userId || !body.productId) {
      return HttpResponse.json(
        { success: false, errorCode: 'BAD_REQUEST', message: 'Invalid input' },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        userId: body.userId,
        items: [
          {
            productId: body.productId,
            productName: 'Test Product',
            unitPrice: 100,
            quantity: body.quantity,
            subtotal: body.quantity * 100,
          },
        ],
        totalAmount: body.quantity * 100,
        currency: 'CNY',
        itemCount: body.quantity,
        updateTime: '2025-04-19T10:00:00Z',
      },
    });
  }),

  // Remove cart item
  http.delete(`${baseUrl}/api/v1/carts/items/:productId`, ({ params, request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return HttpResponse.json(
        { success: false, errorCode: 'BAD_REQUEST', message: 'User ID required' },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        userId,
        items: [],
        totalAmount: 0,
        currency: 'CNY',
        itemCount: 0,
        updateTime: '2025-04-19T10:00:00Z',
      },
    });
  }),

  // Clear cart
  http.delete(`${baseUrl}/api/v1/carts`, ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return HttpResponse.json(
        { success: false, errorCode: 'BAD_REQUEST', message: 'User ID required' },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        userId,
        items: [],
        totalAmount: 0,
        currency: 'CNY',
        itemCount: 0,
        updateTime: '2025-04-19T10:00:00Z',
      },
    });
  }),
];
