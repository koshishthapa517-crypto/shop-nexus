-- Update existing PAID orders to PROCESSING
UPDATE orders 
SET status = 'PROCESSING', 
    "paymentStatus" = 'paid',
    "updatedAt" = NOW()
WHERE status = 'PAID';

-- This migration safely converts old PAID status to new PROCESSING status
-- while marking payment as paid in the new paymentStatus field
