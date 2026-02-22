import api from '@/lib/axios';

export interface CashDrawer {
  _id?: string;
  restaurantId?: string;
  cashierId?: string;
  status: 'OPEN' | 'CLOSED';
  openedAt?: string;
  openingAmount: number;
  closedAt?: string;
  closingAmount?: number;
  expectedAmount?: number;
  variance?: number;
  notes?: string;
  transactionsHandled?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Open cash drawer
 */
export const apiOpenDrawer = async (openingAmount: number, notes?: string): Promise<CashDrawer> => {
  const response = await api.post('/cash-drawer/open', {
    openingAmount,
    notes,
  });
  return response.data.data;
};

/**
 * Close cash drawer
 */
export const apiCloseDrawer = async (closingAmount: number, notes?: string): Promise<CashDrawer> => {
  const response = await api.post('/cash-drawer/close', {
    closingAmount,
    notes,
  });
  return response.data.data;
};

/**
 * Get current drawer status
 */
export const apiGetDrawerStatus = async (): Promise<CashDrawer | null> => {
  const response = await api.get('/cash-drawer/status');
  return response.data.data;
};

/**
 * Get drawer history
 */
export const apiGetDrawerHistory = async (limit: number = 10, skip: number = 0): Promise<{ drawers: CashDrawer[]; total: number }> => {
  const response = await api.get('/cash-drawer/history', {
    params: { limit, skip },
  });
  return {
    drawers: response.data.data,
    total: response.data.pagination.total,
  };
};
