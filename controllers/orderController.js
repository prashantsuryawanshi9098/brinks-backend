// backend/controllers/orderController.js
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

export const createOrder = async (req, res) => {
  try {
    console.log('===== CREATE ORDER =====');
    console.log('User ID:', req.user?._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const { items, totalAmount, deliveryAddress, paymentMethod } = req.body;
    
    // Validation
    if (!items || items.length === 0) {
      console.log('❌ No items');
      return res.status(400).json({ message: 'No items in order' });
    }
    
    if (!deliveryAddress) {
      console.log('❌ No delivery address');
      return res.status(400).json({ message: 'Delivery address required' });
    }
    
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.pincode) {
      console.log('❌ Incomplete address');
      return res.status(400).json({ message: 'Complete address required' });
    }
    
    // Get sellerId from first item
    const sellerId = items[0]?.sellerId;
    if (!sellerId) {
      console.log('❌ No sellerId in items');
      return res.status(400).json({ message: 'Seller information missing' });
    }
    
    console.log('✅ Seller ID:', sellerId);
    
    // Create order
    const order = await Order.create({
      orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      userId: req.user._id,
      sellerId: sellerId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      })),
      totalAmount: totalAmount,
      deliveryAddress: {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state || '',
        pincode: deliveryAddress.pincode
      },
      paymentMethod: paymentMethod,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
    });
    
    console.log('✅ Order created:', order._id);
    
    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
      console.log(`✅ Stock updated for ${item.productId}: -${item.quantity}`);
    }
    
    res.status(201).json(order);
    
  } catch (error) {
    console.error('❌ ORDER ERROR:', error);
    console.error('❌ Error Stack:', error.stack);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack 
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('sellerId', 'name businessName')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('sellerId', 'name businessName');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.userId._id.toString() !== req.user._id.toString() && 
        order.sellerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    
    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// backend/controllers/orderController.js
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if seller is updating
    if (order.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update status
    order.status = status;
    order.updatedAt = Date.now();
    
    // If delivered and COD, mark payment as paid
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }
    
    await order.save();
    
    console.log(`✅ Order ${order._id} status updated to: ${status}`);
    
    res.json({ 
      success: true, 
      order,
      message: `Order status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user._id })
      .populate('userId', 'name email phone')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};