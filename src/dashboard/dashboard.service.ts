import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/entities/user.entity';
import { Product, ProductDocument } from '../products/entities/product.entity';
import { Order, OrderDocument } from '../orders/entities/order.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async getStats() {
    const [totalUsers, totalProducts, totalOrders, revenueData] = await Promise.all([
      this.userModel.countDocuments(),
      this.productModel.countDocuments(),
      this.orderModel.countDocuments(),
      this.orderModel.aggregate([
        { $match: { paymentStatus: 'completed' } }, // Assuming only completed payments count
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
    };
  }

  async getRecentActivity() {
    const [recentOrders, recentUsers] = await Promise.all([
      this.orderModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'username email')
        .exec(),
      this.userModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username email createdAt')
        .exec(),
    ]);

    return {
      recentOrders,
      recentUsers,
    };
  }

  async getSalesChart() {
    // Get sales data grouped by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sales = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sales;
  }
}
