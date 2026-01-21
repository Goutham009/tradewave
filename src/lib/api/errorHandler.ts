import { NextResponse } from 'next/server';
import { AuthError } from './requireAuth';
import { Prisma } from '@prisma/client';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export function successResponse<T>(data: T, pagination?: ApiResponse['pagination']): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  
  if (pagination) {
    response.pagination = pagination;
  }
  
  return NextResponse.json(response);
}

export function errorResponse(error: unknown, defaultStatus = 500): NextResponse {
  let message = 'An unexpected error occurred';
  let status = defaultStatus;
  
  if (error instanceof AuthError) {
    message = error.message;
    status = error.status;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors without exposing details
    switch (error.code) {
      case 'P2002':
        message = 'A record with this value already exists';
        status = 409;
        break;
      case 'P2025':
        message = 'Record not found';
        status = 404;
        break;
      default:
        message = 'Database operation failed';
        status = 500;
    }
    console.error('Prisma error:', error.code, error.message);
  } else if (error instanceof Error) {
    message = error.message;
    console.error('Error:', error.message, error.stack);
  } else {
    console.error('Unknown error:', error);
  }
  
  const response: ApiResponse = {
    success: false,
    error: message,
  };
  
  return NextResponse.json(response, { status });
}

export function validateFilters(params: URLSearchParams, allowedFilters: string[]): Record<string, string> {
  const filters: Record<string, string> = {};
  
  for (const filter of allowedFilters) {
    const value = params.get(filter);
    if (value) {
      filters[filter] = value;
    }
  }
  
  return filters;
}

export function getPagination(params: URLSearchParams, defaultLimit = 10) {
  const page = Math.max(1, parseInt(params.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || String(defaultLimit))));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}
