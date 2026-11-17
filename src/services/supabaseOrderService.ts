import { supabase } from '../utils/supabase';
import { Order, OrderStatus } from '../types';

interface SupabaseOrderRow {
  id: string;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  payment_method: Order['paymentMethod'];
  payment_reference: string;
  items: Order['items'];
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

function mapOrder(row: SupabaseOrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    country: row.country,
    paymentMethod: row.payment_method,
    paymentReference: row.payment_reference,
    items: row.items,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createOrderInDb(
  order: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .insert({
      order_number: order.orderNumber.slice(0, 64),
      first_name: order.firstName.trim().slice(0, 80),
      last_name: order.lastName.trim().slice(0, 80),
      email: order.email.trim().slice(0, 160),
      phone: order.phone.trim().slice(0, 30),
      address: order.address.trim().slice(0, 240),
      city: order.city.trim().slice(0, 80),
      postal_code: order.postalCode.trim().slice(0, 30),
      country: order.country.trim().slice(0, 80),
      payment_method: order.paymentMethod,
      payment_reference: order.paymentReference.trim().slice(0, 160),
      items: order.items.slice(0, 30),
      subtotal: Number(order.subtotal),
      shipping_fee: Number(order.shippingFee),
      total: Number(order.total),
      status: 'pending'
    });

  if (error) throw new Error(error.message);
}

export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError: (error: Error) => void
): () => void {
  let isActive = true;

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isActive) return;
    if (error) {
      onError(new Error(error.message));
      return;
    }

    onData((data as SupabaseOrderRow[]).map(mapOrder));
  };

  void loadOrders();

  const channel = supabase
    .channel('admin-orders')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      () => void loadOrders()
    )
    .subscribe((status, error) => {
      if (isActive && (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT')) {
        onError(error ?? new Error(`Order updates subscription failed: ${status}`));
      }
    });

  return () => {
    isActive = false;
    void supabase.removeChannel(channel);
  };
}

export async function updateOrderStatusInDb(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}

export async function deleteOrderFromDb(orderId: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) throw new Error(error.message);
}

export async function deleteOrdersFromDb(orderIds: string[]): Promise<void> {
  if (orderIds.length === 0) return;

  const { error } = await supabase.from('orders').delete().in('id', orderIds);
  if (error) throw new Error(error.message);
}
