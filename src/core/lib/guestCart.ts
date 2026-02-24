// Guest cart management using localStorage

export interface GuestCartItem {
  productId: string;
  quantity: number;
}

const GUEST_CART_KEY = 'guest_cart';

export const guestCartService = {
  // Get all items from guest cart
  getCart(): GuestCartItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const cart = localStorage.getItem(GUEST_CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error reading guest cart:', error);
      return [];
    }
  },

  // Add item to guest cart
  addItem(productId: string, quantity: number): GuestCartItem[] {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    this.saveCart(cart);
    return cart;
  },

  // Update item quantity
  updateQuantity(productId: string, quantity: number): GuestCartItem[] {
    const cart = this.getCart();
    const item = cart.find(item => item.productId === productId);

    if (item) {
      item.quantity = quantity;
      this.saveCart(cart);
    }

    return cart;
  },

  // Remove item from cart
  removeItem(productId: string): GuestCartItem[] {
    const cart = this.getCart().filter(item => item.productId !== productId);
    this.saveCart(cart);
    return cart;
  },

  // Clear entire cart
  clearCart(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_CART_KEY);
  },

  // Get cart item count
  getItemCount(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  // Save cart to localStorage
  saveCart(cart: GuestCartItem[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      // Dispatch custom event for cart updates
      window.dispatchEvent(new Event('guestCartUpdated'));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  }
};
