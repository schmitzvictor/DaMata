export type CartItem = {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  size: string;
  color: string | null;
  price: number;
  image: string | null;
  quantity: number;
};
