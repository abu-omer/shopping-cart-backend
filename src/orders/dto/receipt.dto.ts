import { ApiProperty } from '@nestjs/swagger';

export class ReceiptItemDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ required: false })
  image?: string;
}

export class ReceiptDto {
  @ApiProperty({ example: 'ORD-686AB3' })
  receiptNumber: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  date: string;

  @ApiProperty({ type: [ReceiptItemDto] })
  items: ReceiptItemDto[];

  @ApiProperty()
  subtotal: number;

  @ApiProperty({ example: 0 })
  deliveryFee: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
  };
}
